type ClubEvent = {
  href: string
  title: string
  startDate: string
  endDate: string
  location: string
}

export const letuxEventListing = {
  href: "/eventos/26-12-30-nochevieja-letux",
  title: "Nochevieja en Letux",
  startDate: "2026-12-30",
  endDate: "2027-01-01",
  location: "Casa rural en Letux",
}

const events: readonly ClubEvent[] = [letuxEventListing]

const localDate = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Europe/Madrid",
  dateStyle: "short",
})
const displayDate = new Intl.DateTimeFormat("es-ES", {
  timeZone: "UTC",
  dateStyle: "medium",
})

export function formatEventDate(date: string) {
  return displayDate.format(new Date(date))
}

export function listEvents(now = new Date()) {
  const today = localDate.format(now)
  const chronological = events.toSorted((first, second) =>
    first.startDate.localeCompare(second.startDate)
  )

  return {
    upcoming: chronological.filter((event) => event.endDate >= today),
    past: chronological.filter((event) => event.endDate < today).reverse(),
  }
}
