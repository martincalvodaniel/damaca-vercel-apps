export const categories = [
  ["taste", "Sabor"],
  ["presentation", "Presentación"],
  ["originality", "Originalidad"],
  ["ingredients", "Calidad de los ingredientes"],
] as const

export type Category = (typeof categories)[number][0]
export type Scores = Record<Category, number>
export type Person = { id: string; alias: string }
export type Attendee = Person & { memberId?: string }
export type Tapa = { id: string; name: string; authors: Person[] }

type Phase =
  | "registration"
  | "rubric"
  | "preview"
  | "runoff"
  | "draw"
  | "resolved"
  | "published"
type Ballot<T> = { voter: string; value: T }
type Rubric = { tapa: string; scores: Scores }[]

export type Contest = {
  phase: Phase
  tapas: Tapa[]
  roster: Attendee[]
  rubric: Ballot<Rubric>[]
  runoff: Ballot<string>[]
  winner: string | null
  draw: string[]
  reason: "runoff" | "categories" | "draw" | null
}

export function emptyContest(): Contest {
  return {
    phase: "registration",
    tapas: [],
    roster: [],
    rubric: [],
    runoff: [],
    winner: null,
    draw: [],
    reason: null,
  }
}

export type Result = Tapa & { sums: Scores; count: number; total: number }

export function compareScore(a: Result, b: Result, key: Category | "total") {
  if (!a.count || !b.count) return b.count - a.count
  const av = key === "total" ? a.total : a.sums[key]
  const bv = key === "total" ? b.total : b.sums[key]
  return bv * a.count - av * b.count
}

export function results(contest: Contest, key: Category | "total" = "total") {
  return contest.tapas
    .map((tapa): Result => {
      const sums: Scores = {
        taste: 0,
        presentation: 0,
        originality: 0,
        ingredients: 0,
      }
      let count = 0
      for (const ballot of contest.rubric) {
        const entry = ballot.value.find(({ tapa: id }) => id === tapa.id)
        if (!entry) continue
        count += 1
        for (const [category] of categories)
          sums[category] += entry.scores[category]
      }
      return {
        ...tapa,
        sums,
        count,
        total: Object.values(sums).reduce((a, b) => a + b, 0),
      }
    })
    .sort(
      (a, b) =>
        compareScore(a, b, key) ||
        (key === "total"
          ? Number(b.id === contest.winner) - Number(a.id === contest.winner)
          : 0) ||
        a.name.localeCompare(b.name, "es") ||
        a.id.localeCompare(b.id)
    )
}

export function finalists(contest: Contest) {
  const ranked = results(contest)
  const first = ranked[0]
  return first?.count
    ? ranked.filter((row) => compareScore(row, first, "total") === 0)
    : []
}

export function ballotOptions(contest: Contest, attendee: Attendee) {
  const isAuthor = (tapa: Tapa) =>
    tapa.authors.some(({ id }) => id === attendee.memberId)
  if (contest.phase === "rubric")
    return contest.tapas.filter((tapa) => !isAuthor(tapa))
  if (contest.phase !== "runoff") return []
  const options = finalists(contest)
  return options.some(isAuthor)
    ? []
    : options.map(({ id, name, authors }) => ({ id, name, authors }))
}

export type Actor = { admin: boolean; member?: Person }

export function selectVoter(
  contest: Contest,
  actor: Actor,
  assistedId: string
) {
  if (assistedId)
    return actor.admin
      ? contest.roster.find(({ id }) => id === assistedId)
      : undefined
  return actor.member
    ? contest.roster.find(({ memberId }) => memberId === actor.member?.id)
    : undefined
}

export function canSeeResults(contest: Contest, admin: boolean) {
  return (
    contest.phase === "published" ||
    (admin && ["preview", "runoff", "draw", "resolved"].includes(contest.phase))
  )
}

export class ContestError extends Error {}

function fail(message: string): never {
  throw new ContestError(message)
}

function field(form: FormData, name: string) {
  const value = form.get(name)
  return typeof value === "string" ? value : ""
}

function replace<T>(ballots: Ballot<T>[], voter: string, value: T) {
  return [
    ...ballots.filter((ballot) => ballot.voter !== voter),
    { voter, value },
  ]
}

export function applyContestAction(
  contest: Contest,
  actor: Actor,
  form: FormData,
  context: { people: Person[]; roster: Attendee[]; newId: string }
): Contest {
  const action = field(form, "intent")
  if (action === "save" || action === "remove") {
    const member = actor.member
    if (contest.phase !== "registration" || !member)
      fail("La inscripción no está disponible.")
    const own = contest.tapas.find(
      ({ authors }) => authors[0]?.id === member.id
    )
    if (action === "remove")
      return {
        ...contest,
        tapas: contest.tapas.filter((entry) => entry !== own),
      }
    const name = field(form, "name").trim()
    if (!name || name.length > 80)
      fail("Escribe un nombre de hasta 80 caracteres.")
    const partnerId = field(form, "partner")
    const partner = context.people.find(({ id }) => id === partnerId)
    if (partnerId && (!partner || partner.id === member.id))
      fail("Elige otro miembro como coautor.")
    const authors = partner ? [member, partner] : [member]
    const other = contest.tapas.filter((entry) => entry !== own)
    if (
      other.some((tapa) =>
        tapa.authors.some(({ id }) =>
          authors.some((author) => author.id === id)
        )
      )
    ) {
      fail("Uno de los autores ya figura en otra tapa.")
    }
    return {
      ...contest,
      tapas: [...other, { id: own?.id ?? context.newId, name, authors }],
    }
  }

  if (action === "vote") {
    if (field(form, "round") !== contest.phase)
      fail("Esta ronda ya no está abierta.")
    const voter = selectVoter(contest, actor, field(form, "assisted"))
    if (!voter) fail("No puedes votar por este asistente.")
    const options = ballotOptions(contest, voter)
    if (!options.length) fail("No tienes tapas elegibles en esta ronda.")
    if (contest.phase === "runoff") {
      const choice = field(form, "choice")
      if (!options.some(({ id }) => id === choice))
        fail("Elige una tapa finalista.")
      return { ...contest, runoff: replace(contest.runoff, voter.id, choice) }
    }
    const expected = new Set(
      options.flatMap(({ id }) =>
        categories.map(([key]) => `score:${id}:${key}`)
      )
    )
    for (const key of form.keys()) {
      if (
        key.startsWith("score:") &&
        (!expected.has(key) || form.getAll(key).length !== 1)
      ) {
        fail("La papeleta contiene una puntuación no válida.")
      }
    }
    const value = options.map(({ id }) => {
      const scores = {} as Scores
      for (const [key] of categories) {
        const raw = field(form, `score:${id}:${key}`)
        if (!/^(?:[0-9]|10)$/.test(raw))
          fail("Completa la papeleta con notas enteras de 0 a 10.")
        scores[key] = Number(raw)
      }
      return { tapa: id, scores }
    })
    return { ...contest, rubric: replace(contest.rubric, voter.id, value) }
  }

  if (!actor.admin) fail("Solo un administrador puede usar este control.")
  if (action === "open" && contest.phase === "registration") {
    if (!contest.tapas.length)
      fail("Inscribe al menos una tapa antes de abrir la votación.")
    const people = new Set(context.people.map(({ id }) => id))
    if (
      contest.tapas.some(({ authors }) =>
        authors.some(({ id }) => !people.has(id))
      )
    ) {
      fail(
        "Revisa las inscripciones: hay un autor que ya no pertenece al club."
      )
    }
    const linked = new Set<string>()
    const roster = context.roster.filter(({ memberId }) => {
      if (!memberId) return true
      if (linked.has(memberId)) return false
      linked.add(memberId)
      return true
    })
    return { ...contest, phase: "rubric", roster }
  }
  if (action === "resolve" && contest.phase === "rubric") {
    const tied = finalists(contest)
    return {
      ...contest,
      phase: tied.length > 1 ? "preview" : "resolved",
      winner: tied.length === 1 ? tied[0].id : null,
    }
  }
  if (action === "open-runoff" && contest.phase === "preview")
    return { ...contest, phase: "runoff" }
  if (action === "resolve-runoff" && contest.phase === "runoff") {
    const votes = new Map<string, number>()
    for (const { value } of contest.runoff)
      votes.set(value, (votes.get(value) ?? 0) + 1)
    const count = (id: string) => votes.get(id) ?? 0
    const tied = finalists(contest).sort((a, b) => count(b.id) - count(a.id))
    const leaders = tied.filter(({ id }) => count(id) === count(tied[0].id))
    if (leaders.length === 1)
      return {
        ...contest,
        phase: "resolved",
        winner: leaders[0].id,
        reason: "runoff",
      }
    const compare = (a: Result, b: Result) =>
      compareScore(a, b, "taste") ||
      compareScore(a, b, "ingredients") ||
      compareScore(a, b, "originality") ||
      compareScore(a, b, "presentation")
    leaders.sort(compare)
    const draw = leaders
      .filter((row) => compare(row, leaders[0]) === 0)
      .map(({ id }) => id)
    return draw.length === 1
      ? { ...contest, phase: "resolved", winner: draw[0], reason: "categories" }
      : { ...contest, phase: "draw", draw }
  }
  if (action === "record-draw" && contest.phase === "draw") {
    const winner = field(form, "winner")
    if (!contest.draw.includes(winner))
      fail("Elige una de las tapas que entraron en el sorteo.")
    return { ...contest, phase: "resolved", winner, reason: "draw" }
  }
  if (
    action === "publish" &&
    contest.phase === "resolved" &&
    field(form, "confirm") === "yes"
  )
    return { ...contest, phase: "published" }
  fail("Esta acción ya no está disponible.")
}
