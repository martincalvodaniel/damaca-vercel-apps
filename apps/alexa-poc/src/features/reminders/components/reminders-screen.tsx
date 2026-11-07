import { createReminder } from "@/features/reminders/actions"
import { requireAuthorizedSession } from "@/lib/auth/session"
import { listRecentReminders } from "@/lib/db/reminders"
import { MAX_REMINDER_LENGTH } from "@/schemas/reminder"

export async function RemindersScreen({
  invalidReminder,
}: {
  invalidReminder: boolean
}) {
  const { user } = await requireAuthorizedSession()
  const reminders = await listRecentReminders(user.email.trim().toLowerCase())

  return (
    <main className="mx-auto w-full max-w-2xl space-y-8 p-4 sm:p-8">
      <header>
        <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
          Alexa POC
        </p>
        <h1 className="mt-2 text-3xl font-semibold">Reminders</h1>
      </header>
      <form action={createReminder} className="space-y-3">
        <label className="block font-medium">
          New reminder
          <input
            name="text"
            required
            maxLength={MAX_REMINDER_LENGTH}
            className="min-h-11 w-full rounded-lg border border-zinc-400 px-3"
            placeholder="Pick up the parcel"
          />
        </label>
        {invalidReminder ? (
          <p role="alert">
            Enter a reminder between 1 and {MAX_REMINDER_LENGTH} characters.
          </p>
        ) : null}
        <button
          type="submit"
          className="min-h-11 rounded-lg bg-emerald-700 px-4 text-white"
        >
          Save reminder
        </button>
      </form>
      <section>
        <h2 className="text-xl font-semibold">Recent reminders</h2>
        {reminders.length === 0 ? (
          <p className="mt-3">No reminders yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-zinc-300 dark:divide-zinc-700">
            {reminders.map(({ id, text }) => (
              <li key={id} className="wrap-break-word py-3">
                {text}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
