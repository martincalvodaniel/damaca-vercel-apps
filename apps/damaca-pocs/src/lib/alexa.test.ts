import { expect, it, mock } from "bun:test"
import { config } from "../../vercel"
import { type AlexaEnvelope, handleAlexa, isAlexaRequest } from "./alexa"
import { parseReminderDate } from "./reminder-date"

const now = new Date("2026-11-11T08:00:00Z")

it("resolves Madrid times and rejects past, partial, missing and repeated times", () => {
  expect(parseReminderDate("2026-11-12", "09:00", now)?.toISOString()).toBe(
    "2026-11-12T08:00:00.000Z"
  )
  for (const [date, time] of [
    ["2026-11-11", "09:00"],
    ["2026-W48", "09:00"],
    ["2027-03-28", "02:30"],
    ["2027-10-31", "02:30"],
    ["2027-02-30", "09:00"],
  ]) {
    expect(parseReminderDate(date, time, now)).toBeUndefined()
  }
})

it("rejects other skill IDs, users and stale Alexa requests", () => {
  const envelope: AlexaEnvelope = {
    context: {
      System: {
        application: { applicationId: "skill" },
        user: { userId: "owner" },
      },
    },
    request: { timestamp: now.toISOString() },
  }
  expect(isAlexaRequest(envelope, "skill", "owner", +now)).toBe(true)
  expect(isAlexaRequest(envelope, "other", "owner", +now)).toBe(false)
  expect(isAlexaRequest(envelope, "skill", "other", +now)).toBe(false)
  expect(isAlexaRequest(envelope, "skill", "owner", +now + 150_001)).toBe(false)
})

it("saves a reminder only after collecting date and time", async () => {
  const save = mock(async () => "entry")
  const send = (
    name: string,
    slot: string,
    value: string,
    attributes?: { reminder?: string; date?: string }
  ) =>
    handleAlexa(
      {
        session: { attributes },
        request: {
          type: "IntentRequest",
          requestId: name,
          intent: { name, slots: { [slot]: { value } } },
        },
      },
      now,
      save
    )
  const start = await send("AddReminder", "Reminder", "Llamar al dentista")
  const date = await send(
    "SetReminderDate",
    "Date",
    "2026-11-12",
    start.sessionAttributes
  )
  expect(save).not.toHaveBeenCalled()
  await send("SetReminderTime", "Time", "09:00", date.sessionAttributes)
  expect(save).toHaveBeenCalledWith({
    kind: "reminder",
    source: "alexa",
    requestId: "SetReminderTime",
    text: "Llamar al dentista",
    dueAt: new Date("2026-11-12T08:00:00Z"),
  })
})

it("exempts only the Alexa webhook from the regional rule", () => {
  const route = config.routes?.[0]
  if (!route || !("src" in route)) throw new Error("Missing geography rule")
  const restricted = new RegExp(`^${route.src}$`, "u")
  expect(restricted.test("/api/integrations/alexa")).toBe(false)
  for (const path of [
    "/",
    "/api/auth/callback/google",
    "/api/integrations/alexa/other",
    "/api/integrations/alexa-other",
  ]) {
    expect(restricted.test(path)).toBe(true)
  }
})
