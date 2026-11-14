export const guideSections = [
  { id: "dec30", label: "30 de diciembre" },
  { id: "dec31", label: "31 de diciembre" },
  { id: "jan01", label: "1 de enero" },
  { id: "other", label: "Otros" },
] as const

export const guideNotes = [
  { id: "lodging", label: "Alojamiento" },
  { id: "tapas", label: "Nota del concurso de tapas" },
  { id: "costumes", label: "Nota de disfraces" },
] as const

export type GuideSection = (typeof guideSections)[number]["id"]
type GuideNote = (typeof guideNotes)[number]["id"]

export type GuideBlock = { id: string; title: string; text: string }
export const guideActivities = {
  dec30: { id: "tapas", title: "Concurso de tapas", link: "Concurso de tapas" },
  dec31: { id: "costumes", title: "Disfraces", link: "Elegir disfraz" },
} as const

export type ActivityDay = keyof typeof guideActivities
type GuideActivity = (typeof guideActivities)[ActivityDay]

export type EventGuide = {
  notes: Record<GuideNote, string>
  sections: Record<GuideSection, GuideBlock[]>
  activityTitles?: Partial<Record<GuideActivity["id"], string>>
  activityPositions?: Record<ActivityDay, number>
}

export const guideLimits = { blocks: 25, title: 100, text: 4000 }

export function emptyGuide(): EventGuide {
  return {
    notes: { lodging: "", tapas: "", costumes: "" },
    sections: { dec30: [], dec31: [], jan01: [], other: [] },
  }
}

export function isActivityDay(section: GuideSection): section is ActivityDay {
  return section === "dec30" || section === "dec31"
}

export function guideEntries(guide: EventGuide, section: GuideSection) {
  const blocks = guide.sections[section]
  const entries: (GuideBlock | GuideActivity)[] = [...blocks]
  if (isActivityDay(section)) {
    const position =
      guide.activityPositions?.[section] ??
      (section === "dec30" ? 0 : blocks.length)
    entries.splice(position, 0, guideActivities[section])
  }
  return entries
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === "object" && input !== null && !Array.isArray(input)
}

export function parseGuide(input: unknown): EventGuide | null {
  if (!isRecord(input) || !isRecord(input.notes) || !isRecord(input.sections)) {
    return null
  }
  const guide = emptyGuide()
  for (const { id } of guideNotes) {
    const note = input.notes[id]
    if (typeof note !== "string" || note.length > guideLimits.text) return null
    guide.notes[id] = note.trim()
  }

  const titles = input.activityTitles
  if (titles !== undefined && !isRecord(titles)) return null
  const activityTitles: NonNullable<EventGuide["activityTitles"]> = {}
  for (const { id } of Object.values(guideActivities)) {
    const title = titles?.[id]
    if (title === undefined) continue
    if (typeof title !== "string" || title.length > guideLimits.title)
      return null
    if (title.trim()) activityTitles[id] = title.trim()
  }

  const positions = input.activityPositions
  if (positions !== undefined && !isRecord(positions)) return null
  const activityPositions = { dec30: 0, dec31: 0 }
  const ids = new Set<string>()
  for (const { id } of guideSections) {
    const blocks = input.sections[id]
    if (!Array.isArray(blocks) || blocks.length > guideLimits.blocks)
      return null

    const position = isActivityDay(id)
      ? positions === undefined
        ? id === "dec30"
          ? 0
          : blocks.length
        : positions[id]
      : 0
    if (
      typeof position !== "number" ||
      !Number.isInteger(position) ||
      position < 0 ||
      position > blocks.length
    )
      return null

    for (const [index, block] of blocks.entries()) {
      if (!isRecord(block)) return null
      const { id: blockId, title, text } = block
      if (
        typeof blockId !== "string" ||
        !/^[a-f0-9-]{36}$/u.test(blockId) ||
        ids.has(blockId) ||
        typeof title !== "string" ||
        title.length > guideLimits.title ||
        typeof text !== "string" ||
        text.length > guideLimits.text
      ) {
        return null
      }
      ids.add(blockId)
      if (title.trim() || text.trim()) {
        if (!title.trim()) return null
        if (isActivityDay(id) && index < position) activityPositions[id] += 1
        guide.sections[id].push({
          id: blockId,
          title: title.trim(),
          text: text.trim(),
        })
      }
    }
  }

  return { ...guide, activityPositions, activityTitles }
}
