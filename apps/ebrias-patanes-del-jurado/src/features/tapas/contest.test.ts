import { expect, test as it } from "bun:test"
import {
  type Actor,
  applyContestAction,
  ballotOptions,
  type Contest,
  canSeeResults,
  categories,
  emptyContest,
  results,
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
  expect(canSeeResults(contest, true)).toBe(false)
  expect(() => submit(contest, member("d"), "resolve")).toThrow("administrador")
  contest = submit(contest, admin, "resolve")
  expect(contest.winner).toBe("First")
  expect(results(contest, "taste")[0].id).toBe("Second")
  expect(canSeeResults(contest, false)).toBe(false)
  expect(() =>
    submit(contest, member("b"), "vote", { round: "rubric", ...second })
  ).toThrow("abierta")
  expect(() =>
    submit(contest, member("a"), "publish", { confirm: "yes" })
  ).toThrow("administrador")
  contest = submit(contest, admin, "publish", { confirm: "yes" })
  expect(canSeeResults(contest, false)).toBe(true)
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
  return submit(contest, admin, "open-runoff")
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
  expect(
    submit(resolved, admin, "publish", { confirm: "yes" }).winner
  ).toBeNull()
  expect(results(resolved)[0].count).toBe(0)
})
