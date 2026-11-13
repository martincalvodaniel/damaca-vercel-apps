"use client"

import { useCallback, useState } from "react"
import { IconButton } from "@/components/ui/icon-button"
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
      <div className="flex items-center gap-1">
        <IconButton
          type="button"
          onClick={onBack}
          icon="back"
          label="Back to vault"
        />
        <h2 className="min-w-0 flex-1 break-words text-lg font-semibold">
          {entry.title}
        </h2>
        {onEdit ? (
          <IconButton
            type="button"
            disabled={busy}
            onClick={onEdit}
            icon="edit"
            label="Edit entry"
          />
        ) : null}
        {onDelete ? (
          <IconButton
            disabled={busy}
            onClick={onDelete}
            icon="delete"
            label="Delete entry"
            tone="danger"
          />
        ) : null}
      </div>
      <dl className="grid gap-3 rounded-xl border border-zinc-300 p-3 text-sm dark:border-zinc-700">
        {entry.username ? (
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <dt className="text-zinc-600 dark:text-zinc-400">Username</dt>
              <dd className="break-all">{entry.username}</dd>
            </div>
            <IconButton
              type="button"
              name="username"
              onClick={copy}
              icon="copy"
              label="Copy username"
            />
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
            <IconButton
              type="button"
              onClick={toggle}
              icon={visible ? "hide" : "show"}
              label={visible ? "Hide password" : "Show password"}
              aria-pressed={visible}
            />
            <IconButton
              type="button"
              name="password"
              onClick={copy}
              icon="copy"
              label="Copy password"
            />
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
    </section>
  )
}
