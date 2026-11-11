const madrid = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Europe/Madrid",
  dateStyle: "short",
  timeStyle: "short",
})

export function parseReminderDate(date: string, time: string, now: Date) {
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(date) || !/^\d{2}:\d{2}$/u.test(time)) return
  const wallTime = new Date(`${date}T${time}:00Z`)
  if (Number.isNaN(wallTime.getTime())) return

  // Madrid uses UTC+1 or UTC+2 for future reminders. A clock change
  // can leave zero or two instants matching the requested civil time.
  const candidates = [1, 2]
    .map((offset) => new Date(wallTime.getTime() - offset * 3_600_000))
    .filter((candidate) => madrid.format(candidate) === `${date} ${time}`)
  const [dueAt] = candidates
  if (candidates.length === 1 && dueAt && dueAt > now) return dueAt
}
