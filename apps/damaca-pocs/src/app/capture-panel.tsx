import type { Capture } from "@/lib/captures"

const groups = [
  ["shopping", "Shopping list"],
  ["reminder", "Reminders"],
  ["summary", "Conversation summaries"],
  ["link", "Saved links"],
] as const

const madridDate = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Europe/Madrid",
})

export function CapturePanel({ entries }: { entries: Capture[] }) {
  return (
    <div className="captures">
      {groups.map(([kind, title]) => {
        const captures = entries.filter((entry) => entry.kind === kind)
        return (
          <section key={kind} aria-label={title}>
            <h2>{title}</h2>
            {captures.length ? (
              <ul>
                {captures.map((entry) => (
                  <li key={entry._id}>
                    {entry.kind === "link" ? (
                      <a href={entry.url}>{entry.title || entry.url}</a>
                    ) : entry.kind === "summary" ? (
                      <details>
                        <summary>{entry.title}</summary>
                        <p>{entry.text}</p>
                      </details>
                    ) : (
                      entry.text
                    )}
                    {entry.kind === "reminder" ? (
                      <time dateTime={entry.dueAt.toISOString()}>
                        {madridDate.format(entry.dueAt)}
                      </time>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No entries yet.</p>
            )}
          </section>
        )
      })}
    </div>
  )
}
