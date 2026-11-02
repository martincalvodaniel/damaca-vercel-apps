import { expect, test as it } from "bun:test"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { WEEKDAY_HEADERS } from "./calendar-constants"
import MonthCalendarGrid from "./MonthCalendarGrid"

it("shared absence and event grid renders Monday-first Spanish three-letter weekdays", () => {
  expect(WEEKDAY_HEADERS).toEqual([
    "lun",
    "mar",
    "mié",
    "jue",
    "vie",
    "sáb",
    "dom",
  ])
  const html = renderToStaticMarkup(
    createElement(MonthCalendarGrid, {
      cells: [],
      renderCell: () => null,
    })
  )
  for (const day of WEEKDAY_HEADERS) expect(html).toContain(`>${day}<`)
  expect(html).not.toContain(">Mon<")
})
