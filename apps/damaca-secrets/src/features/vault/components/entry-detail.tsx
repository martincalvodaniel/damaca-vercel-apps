"use client"

import { useCallback, useState } from "react"
import { buttonClass } from "@/features/vault/components/styles"
import type { VaultEntry } from "@/schemas/vault"

interface EntryDetailProps {
  busy: boolean
  entry: VaultEntry
  onBack: () => void
  onEdit?: () => void
  onDelete?: () => void
}

export function EntryDetail({
  busy,
  entry,
  onBack,
  onEdit,
  onDelete,
}: EntryDetailProps) {
  const [visible, setVisible] = useState(false)
  const [feedback, setFeedback] = useState("")
  const toggle = useCallback(() => setVisible((value) => !value), [])
  const copy = useCallback(
    async (event: React.MouseEvent<HTMLButtonElement>) => {
      const field = event.currentTarget.name
      if (field !== "username" && field !== "password") return
      try {
        await navigator.clipboard.writeText(entry[field])
        setFeedback(
          field === "password" ? "Password copied." : "Username copied."
        )
      } catch {
        setFeedback("Could not copy. Select and copy the value manually.")
      }
    },
    [entry]
  )

  return (
    <section className="grid max-w-xl gap-3" aria-label="Credential details">
      <div className="flex items-start gap-2">
        <button type="button" onClick={onBack} className={buttonClass}>
          Back
        </button>
        <h2 className="min-w-0 flex-1 break-words pt-2 text-lg font-semibold">
          {entry.title}
        </h2>
        {onEdit ? (
          <button
            type="button"
            disabled={busy}
            onClick={onEdit}
            className={buttonClass}
          >
            Edit
          </button>
        ) : null}
      </div>
      <dl className="grid gap-3 rounded-xl border border-zinc-300 p-3 text-sm dark:border-zinc-700">
        {entry.username ? (
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <dt className="text-zinc-600 dark:text-zinc-400">Username</dt>
              <dd className="break-all">{entry.username}</dd>
            </div>
            <button
              type="button"
              name="username"
              onClick={copy}
              className={buttonClass}
              aria-label="Copy username"
            >
              Copy
            </button>
          </div>
        ) : null}
        {entry.password ? (
          <div className="flex flex-wrap items-center gap-2">
            <div className="min-w-0 flex-1">
              <dt className="text-zinc-600 dark:text-zinc-400">Password</dt>
              <dd className="break-all font-mono">
                {visible ? entry.password : "••••••••"}
              </dd>
            </div>
            <button
              type="button"
              onClick={toggle}
              className={buttonClass}
              aria-label={visible ? "Hide password" : "Show password"}
            >
              {visible ? "Hide" : "Show"}
            </button>
            <button
              type="button"
              name="password"
              onClick={copy}
              className={buttonClass}
              aria-label="Copy password"
            >
              Copy
            </button>
          </div>
        ) : null}
        {entry.url ? (
          <div>
            <dt className="text-zinc-600 dark:text-zinc-400">URL</dt>
            <dd className="break-all">{entry.url}</dd>
          </div>
        ) : null}
        {entry.notes ? (
          <div>
            <dt className="text-zinc-600 dark:text-zinc-400">Notes</dt>
            <dd className="break-words whitespace-pre-wrap">{entry.notes}</dd>
          </div>
        ) : null}
      </dl>
      <p role="status" className="text-sm empty:hidden">
        {feedback}
      </p>
      {onDelete ? (
        <button
          type="button"
          disabled={busy}
          onClick={onDelete}
          className="min-h-11 justify-self-start text-sm text-red-700 underline dark:text-red-400"
        >
          Delete entry
        </button>
      ) : null}
    </section>
  )
}
