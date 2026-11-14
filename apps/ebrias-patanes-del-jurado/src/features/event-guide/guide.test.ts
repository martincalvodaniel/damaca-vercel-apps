import { expect, test as it } from "bun:test"
import { emptyGuide, guideEntries, parseGuide } from "./guide"

const meal = {
  id: "55555555-5555-4555-8555-555555555555",
  title: "Comida",
  text: "",
}
const dinner = {
  id: "66666666-6666-4666-8666-666666666666",
  title: "Cena",
  text: "",
}

it("a guide saved before activity ordering keeps the original order", () => {
  const guide = emptyGuide()
  guide.sections.dec30 = [meal]
  guide.sections.dec31 = [dinner]

  expect(guideEntries(guide, "dec30").map(({ id }) => id)).toEqual([
    "tapas",
    meal.id,
  ])
  expect(guideEntries(guide, "dec31").map(({ id }) => id)).toEqual([
    dinner.id,
    "costumes",
  ])
})

it("saved activities stay between the intended blocks when empty blocks are discarded", () => {
  const guide = emptyGuide()
  const blocks = [
    { id: crypto.randomUUID(), title: "", text: "" },
    meal,
    dinner,
  ]
  guide.sections.dec30 = blocks
  guide.sections.dec31 = blocks.map((block) => ({
    ...block,
    id: crypto.randomUUID(),
  }))
  const saved = parseGuide({
    ...guide,
    activityPositions: { dec30: 2, dec31: 2 },
  })
  if (!saved) throw new Error("Expected a valid guide")

  expect(guideEntries(saved, "dec30").map(({ title }) => title)).toEqual([
    "Comida",
    "Concurso de tapas",
    "Cena",
  ])
  expect(guideEntries(saved, "dec31").map(({ title }) => title)).toEqual([
    "Comida",
    "Disfraces",
    "Cena",
  ])
  expect(
    parseGuide({ ...guide, activityPositions: { dec30: 4, dec31: 2 } })
  ).toBeNull()
})
