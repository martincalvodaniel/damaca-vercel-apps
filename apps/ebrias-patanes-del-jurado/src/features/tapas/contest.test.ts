import { expect, test as it } from "bun:test"
import {
  type Actor,
  applyContestAction,
  ballotOptions,
  type Contest,
  canSeeResults,
  categories,
  emptyContest,
  finalRunoffCounts,
  nextReveal,
  results,
  revealedPodium,
  revealVersion,
} from "./contest"

const people = ["a", "b", "c", "d", "e"].map((id) => ({ id, alias: id }))
const roster = [
  ...people.map(({ id, alias }) => ({
    id: `member:${id}`,
    memberId: id,
    alias,
  })),
  { id: "guest", alias: "Guest" },
]
const member = (id: string): Actor => ({
  admin: false,
  member: people.find((person) => person.id === id),
})
const admin = { admin: true }

function submit(
  contest: Contest,
  actor: Actor,
  intent: string,
  fields: Record<string, string> = {}
) {
  const form = new FormData()
  for (const [key, value] of Object.entries({ intent, ...fields }))
    form.set(key, value)
  return applyContestAction(contest, actor, form, {
    people,
    roster,
    newId: fields.name ?? "new",
  })
}

function advance(contest: Contest, actor = admin) {
  const next = nextReveal(contest)
  if (!next) throw new Error("No pending reveal")
  return submit(contest, actor, "reveal", { step: next.token })
}

function publish(contest: Contest) {
  let current = contest
  while (nextReveal(current)) current = advance(current)
  return current
}

function register(
  contest: Contest,
  author: string,
  name: string,
  partner = ""
) {
  return submit(contest, member(author), "save", { name, partner })
}

function scores(tapa: string, values: number[]) {
  return Object.fromEntries(
    categories.map(([key], i) => [`score:${tapa}:${key}`, String(values[i])])
  )
}

it("registration rejects authors already booked and freezes on admin opening", () => {
  const initial = register(emptyContest(), "a", "First", "b")
  expect(() => register(initial, "b", "Duplicate")).toThrow("otra tapa")
  expect(() => register(initial, "c", "Duplicate", "a")).toThrow("otra tapa")
  const edited = register(initial, "a", "Renamed")
  const newEntry = register(edited, "b", "Second")
  expect(newEntry.tapas).toHaveLength(2)
  expect(
    submit(newEntry, member("b"), "remove").tapas.map(({ name }) => name)
  ).toEqual(["Renamed"])
  expect(() => submit(initial, member("a"), "open")).toThrow("administrador")
  const opened = submit(initial, admin, "open")
  expect(() => register(opened, "c", "Late")).toThrow("inscripción")
  expect(ballotOptions(opened, roster[0])).toEqual([])
  expect(ballotOptions(opened, roster[1])).toEqual([])
})

it("direct and assisted submissions share one ballot, enforce exclusions, and close with abstentions", () => {
  let contest = register(
    register(emptyContest(), "a", "First", "b"),
    "c",
    "Second"
  )
  contest = submit(contest, admin, "open")
  const first = scores("First", [4, 5, 6, 7])
  const second = scores("Second", [1, 2, 3, 4])
  expect(() =>
    submit(contest, member("b"), "vote", {
      round: "rubric",
      ...first,
      ...second,
    })
  ).toThrow("no válida")
  expect(() =>
    submit(contest, member("d"), "vote", { round: "rubric", ...first })
  ).toThrow("Completa")
  expect(() =>
    submit(contest, member("d"), "vote", {
      round: "rubric",
      assisted: "guest",
      ...first,
      ...second,
    })
  ).toThrow("No puedes")
  contest = submit(contest, member("b"), "vote", { round: "rubric", ...second })
  contest = submit(contest, admin, "vote", {
    round: "rubric",
    assisted: "member:b",
    ...scores("Second", [8, 8, 8, 8]),
  })
  expect(contest.rubric).toHaveLength(1)
  contest = submit(contest, admin, "vote", {
    round: "rubric",
    assisted: "guest",
    ...first,
    ...second,
  })
  expect(canSeeResults(contest)).toBe(false)
  expect(() => submit(contest, member("d"), "resolve")).toThrow("administrador")
  contest = submit(contest, admin, "resolve")
  expect(contest.winner).toBe("First")
  expect(results(contest, "taste")[0].id).toBe("Second")
  expect(canSeeResults(contest)).toBe(false)
  expect(() =>
    submit(contest, member("b"), "vote", { round: "rubric", ...second })
  ).toThrow("abierta")
  expect(() => advance(contest, member("a"))).toThrow("administrador")
  contest = publish(contest)
  expect(canSeeResults(contest)).toBe(true)
  expect(() => submit(contest, admin, "open")).toThrow("disponible")
})

function runoffFixture(third = [5, 5, 5, 5]) {
  let contest = register(
    register(register(emptyContest(), "a", "First", "b"), "c", "Second"),
    "d",
    "Third"
  )
  contest = submit(contest, admin, "open")
  contest = submit(contest, member("e"), "vote", {
    round: "rubric",
    ...scores("First", [5, 5, 5, 5]),
    ...scores("Second", [5, 5, 5, 5]),
    ...scores("Third", third),
  })
  contest = submit(contest, admin, "resolve")
  return publish(contest)
}

it("runoff excludes all finalists, leaks no scores and accepts an assisted replacement", () => {
  let contest = runoffFixture()
  expect(ballotOptions(contest, roster[1])).toEqual([])
  expect(() =>
    submit(contest, admin, "vote", {
      round: "runoff",
      assisted: "member:b",
      choice: "Second",
    })
  ).toThrow("elegibles")
  expect(ballotOptions(contest, roster[4]).map(Object.keys)).toEqual(
    Array.from({ length: 3 }, () => ["id", "name", "authors"])
  )
  contest = submit(contest, member("e"), "vote", {
    round: "runoff",
    choice: "First",
  })
  contest = submit(contest, admin, "vote", {
    round: "runoff",
    assisted: "member:e",
    choice: "Third",
  })
  contest = submit(contest, admin, "resolve-runoff")
  expect(contest.reason).toBe("runoff")
  expect(results(contest)[0].id).toBe("Third")
})

it("a runoff without votes uses category priority, then a recorded draw if needed", () => {
  const byCategory = submit(
    runoffFixture([5, 4, 5, 6]),
    admin,
    "resolve-runoff"
  )
  expect(byCategory.winner).toBe("Third")
  expect(byCategory.reason).toBe("categories")
  const draw = submit(runoffFixture(), admin, "resolve-runoff")
  expect(draw.draw).toHaveLength(3)
  expect(() => submit(draw, admin, "publish", { confirm: "yes" })).toThrow(
    "disponible"
  )
  expect(() => submit(draw, admin, "record-draw", { winner: "fake" })).toThrow(
    "sorteo"
  )
  expect(submit(draw, admin, "record-draw", { winner: "Second" }).reason).toBe(
    "draw"
  )
})

it("a contest with no votes can publish without a winner", () => {
  const opened = submit(register(emptyContest(), "a", "First"), admin, "open")
  const resolved = submit(opened, admin, "resolve")
  expect(publish(resolved).winner).toBeNull()
  expect(results(resolved)[0].count).toBe(0)
})

it("reopens registration only with admin confirmation and discards old ballots", () => {
  const runoff = runoffFixture()
  const voted = submit(runoff, member("e"), "vote", {
    round: "runoff",
    choice: "First",
  })
  const resolved = submit(voted, admin, "resolve-runoff")
  const confirmation = { confirm: "yes" }
  expect(() =>
    submit(resolved, member("e"), "reopen-registration", confirmation)
  ).toThrow("administrador")
  expect(() => submit(resolved, admin, "reopen-registration")).toThrow(
    "disponible"
  )
  const published = publish(resolved)
  expect(() =>
    submit(published, admin, "reopen-registration", confirmation)
  ).toThrow("disponible")

  const reopened = submit(resolved, admin, "reopen-registration", confirmation)
  expect(reopened).toEqual({
    ...emptyContest(),
    tapas: resolved.tapas,
    votingGeneration: 1,
  })
  const edited = register(reopened, "a", "Updated", "b")
  const next = submit(edited, admin, "open")
  const ballot = {
    round: "rubric",
    ...scores("First", [5, 5, 5, 5]),
    ...scores("Second", [5, 5, 5, 5]),
    ...scores("Third", [5, 5, 5, 5]),
  }
  expect(() => submit(next, member("e"), "vote", ballot)).toThrow("abierta")
  expect(
    submit(next, member("e"), "vote", { ...ballot, generation: "1" }).rubric
  ).toHaveLength(1)
})

it("lets an admin register, transfer authorship and remove a tapa only during registration", () => {
  const initial = register(emptyContest(), "a", "First", "b")
  const entry = { name: "Second", author: "c", partner: "d" }
  expect(() => submit(initial, member("c"), "admin-save", entry)).toThrow(
    "administrador"
  )
  expect(() =>
    submit(initial, admin, "admin-save", { ...entry, partner: "b" })
  ).toThrow("otra tapa")
  const created = submit(initial, admin, "admin-save", entry)
  const edited = submit(created, admin, "admin-save", {
    tapa: "First",
    name: "Updated",
    author: "e",
  })
  expect(edited.tapas[0]).toMatchObject({
    id: "First",
    name: "Updated",
    authors: [people[4]],
  })
  const remove = { tapa: "First", confirm: "yes" }
  expect(() => submit(edited, member("e"), "admin-remove", remove)).toThrow(
    "administrador"
  )
  expect(() =>
    submit(edited, admin, "admin-remove", { tapa: "First" })
  ).toThrow("disponible")
  expect(submit(edited, admin, "admin-remove", remove).tapas).toEqual([
    created.tapas[1],
  ])
  const opened = submit(edited, admin, "open")
  expect(() => submit(opened, admin, "admin-save", entry)).toThrow("disponible")
  expect(() => submit(opened, admin, "admin-remove", remove)).toThrow(
    "disponible"
  )
})

it("lets only an admin withdraw a published result with confirmation", () => {
  const confirmation = { confirm: "yes" }
  const runoff = runoffFixture()
  const voted = submit(runoff, member("e"), "vote", {
    round: "runoff",
    choice: "First",
  })
  const resolved = submit(voted, admin, "resolve-runoff")
  const published = publish(resolved)
  expect(() =>
    submit(published, member("e"), "unpublish", confirmation)
  ).toThrow("administrador")
  expect(() => submit(published, admin, "unpublish")).toThrow("disponible")
  const withdrawn = submit(published, admin, "unpublish", confirmation)
  expect(withdrawn).toMatchObject({
    phase: "resolved",
    rubric: published.rubric,
    winner: published.winner,
    revealedPlaces: 0,
  })
  expect(canSeeResults(withdrawn)).toBe(false)
  expect(revealedPodium(withdrawn)).toEqual([])
  expect(publish(withdrawn)).toMatchObject({
    phase: "published",
    winner: published.winner,
  })
})

it("lets coauthors rename their tapa without changing its authors", () => {
  const initial = register(emptyContest(), "a", "First", "b")
  const update = { tapa: "First", name: "Updated", partner: "c" }
  const edited = submit(initial, member("b"), "rename-own", update)
  expect(edited.tapas[0]).toEqual({ ...initial.tapas[0], name: "Updated" })
  expect(() => submit(initial, member("c"), "rename-own", update)).toThrow(
    "disponible"
  )
  expect(() => submit(initial, member("b"), "remove", update)).toThrow(
    "disponible"
  )
  const opened = submit(initial, admin, "open")
  expect(() => submit(opened, member("b"), "rename-own", update)).toThrow(
    "disponible"
  )
})

it("reveals tied score levels from third to first and rejects a repeated step", () => {
  let contest = people.reduce(
    (current, person) => register(current, person.id, person.id),
    emptyContest()
  )
  contest = submit(contest, admin, "open")
  contest = submit(contest, admin, "vote", {
    assisted: "guest",
    round: "rubric",
    ...scores("a", [10, 10, 10, 10]),
    ...scores("b", [8, 8, 8, 8]),
    ...scores("c", [8, 8, 8, 8]),
    ...scores("d", [5, 5, 5, 5]),
    ...scores("e", [5, 5, 5, 5]),
  })
  const closed = submit(contest, admin, "resolve")
  expect(revealedPodium(closed)).toEqual([])
  expect(canSeeResults(closed)).toBe(false)
  const step = nextReveal(closed)?.token ?? ""
  const third = advance(closed)
  expect(
    revealedPodium(third).map(({ place, tapas }) => [
      place,
      tapas.map(({ id }) => id),
    ])
  ).toEqual([[3, ["d", "e"]]])
  expect(() => submit(third, admin, "reveal", { step })).toThrow("disponible")
  const second = advance(third)
  expect(
    revealedPodium(second).map(({ place, tapas }) => [
      place,
      tapas.map(({ id }) => id),
    ])
  ).toEqual([
    [3, ["d", "e"]],
    [2, ["b", "c"]],
  ])
  expect(canSeeResults(second)).toBe(false)
  expect(canSeeResults(advance(second))).toBe(true)
})

it("shows final runoff totals including zero without changing the reveal version on votes", () => {
  const runoff = runoffFixture()
  const voted = submit(runoff, member("e"), "vote", {
    round: "runoff",
    choice: "First",
  })
  expect(revealVersion(voted)).toBe(revealVersion(runoff))
  expect(finalRunoffCounts(voted).size).toBe(0)
  const resolved = submit(voted, admin, "resolve-runoff")
  expect(finalRunoffCounts(resolved).size).toBe(0)
  const published = publish(resolved)
  expect(finalRunoffCounts(published)).toEqual(
    new Map([
      ["First", 1],
      ["Second", 0],
      ["Third", 0],
    ])
  )
  const withdrawn = submit(published, admin, "unpublish", { confirm: "yes" })
  expect(revealVersion(withdrawn)).not.toBe(revealVersion(resolved))
  expect(finalRunoffCounts(withdrawn).size).toBe(0)
})
