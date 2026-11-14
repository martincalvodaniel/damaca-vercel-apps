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

type GuideSection = (typeof guideSections)[number]["id"]
type GuideNote = (typeof guideNotes)[number]["id"]

export type GuideBlock = { id: string; title: string; text: string }
export type EventGuide = {
  notes: Record<GuideNote, string>
  sections: Record<GuideSection, GuideBlock[]>
}

export const guideLimits = { blocks: 25, title: 100, text: 4000 }

export function emptyGuide(): EventGuide {
  return {
    notes: { lodging: "", tapas: "", costumes: "" },
    sections: { dec30: [], dec31: [], jan01: [], other: [] },
  }
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

  const ids = new Set<string>()
  for (const { id } of guideSections) {
    const blocks = input.sections[id]
    if (!Array.isArray(blocks) || blocks.length > guideLimits.blocks)
      return null

    for (const block of blocks) {
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
        guide.sections[id].push({
          id: blockId,
          title: title.trim(),
          text: text.trim(),
        })
      }
    }
  }

  return guide
}
