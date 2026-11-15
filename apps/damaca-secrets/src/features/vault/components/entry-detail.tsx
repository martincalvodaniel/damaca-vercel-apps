"use client"

import { useCallback, useState } from "react"
import { IconButton } from "@/components/ui/icon-button"
import { useLocale } from "@/lib/i18n/client"
import type { MessageKey } from "@/lib/i18n/messages"
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
  const { t } = useLocale()
  const [visible, setVisible] = useState(false)
  const [feedback, setFeedback] = useState<MessageKey>()
  const toggle = useCallback(() => setVisible((value) => !value), [])
  const copy = useCallback(
    async (event: React.MouseEvent<HTMLButtonElement>) => {
      const field = event.currentTarget.name
      if (field !== "username" && field !== "password") return
      try {
        await navigator.clipboard.writeText(entry[field])
        setFeedback(field === "password" ? "passwordCopied" : "usernameCopied")
      } catch {
        setFeedback("copyFailed")
      }
    },
    [entry]
  )

  return (
    <section className="grid max-w-xl gap-3" aria-label={t.credentialDetails}>
      <div className="flex items-center gap-1">
        <IconButton
          type="button"
          onClick={onBack}
          icon="back"
          label={t.backToVault}
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
            tone="edit"
            label={t.editEntry}
          />
        ) : null}
        {onDelete ? (
          <IconButton
            disabled={busy}
            onClick={onDelete}
            icon="delete"
            label={t.deleteEntry}
            tone="danger"
          />
        ) : null}
      </div>
      <dl className="grid gap-3 rounded-xl border border-zinc-300 p-3 text-sm dark:border-zinc-700">
        {entry.username ? (
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <dt className="text-zinc-600 dark:text-zinc-400">{t.username}</dt>
              <dd className="break-all">{entry.username}</dd>
            </div>
            <IconButton
              type="button"
              name="username"
              onClick={copy}
              icon="copy"
              tone="utility"
              label={t.copyUsername}
            />
          </div>
        ) : null}
        {entry.password ? (
          <div className="flex flex-wrap items-center gap-2">
            <div className="min-w-0 flex-1">
              <dt className="text-zinc-600 dark:text-zinc-400">{t.password}</dt>
              <dd className="break-all font-mono">
                {visible ? entry.password : "••••••••"}
              </dd>
            </div>
            <IconButton
              type="button"
              onClick={toggle}
              icon={visible ? "hide" : "show"}
              tone="visibility"
              label={visible ? t.hidePassword : t.showPassword}
              aria-pressed={visible}
            />
            <IconButton
              type="button"
              name="password"
              onClick={copy}
              icon="copy"
              tone="utility"
              label={t.copyPassword}
            />
          </div>
        ) : null}
        {entry.url ? (
          <div>
            <dt className="text-zinc-600 dark:text-zinc-400">{t.url}</dt>
            <dd className="break-all">{entry.url}</dd>
          </div>
        ) : null}
        {entry.notes ? (
          <div>
            <dt className="text-zinc-600 dark:text-zinc-400">{t.notes}</dt>
            <dd className="break-words whitespace-pre-wrap">{entry.notes}</dd>
          </div>
        ) : null}
      </dl>
      <p role="status" className="text-sm empty:hidden">
        {feedback ? t[feedback] : null}
      </p>
    </section>
  )
}
