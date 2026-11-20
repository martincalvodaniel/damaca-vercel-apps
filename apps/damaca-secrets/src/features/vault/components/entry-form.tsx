"use client"

import { type FormEvent, useCallback, useRef, useState } from "react"
import { IconButton } from "@/components/ui/icon-button"
import { PasswordInput } from "@/components/ui/password-input"
import { inputClass } from "@/features/vault/components/styles"
import { generatePassword } from "@/features/vault/crypto"
import { useLocale } from "@/lib/i18n/client"
import { useFormValidation } from "@/lib/i18n/form-validation"
import { entrySchema, type VaultEntry } from "@/schemas/vault"

interface EntryFormProps {
  busy: boolean
  entry?: VaultEntry
  formId: string
  onSave: (entry: VaultEntry) => void
}

export function EntryForm({ busy, entry, formId, onSave }: EntryFormProps) {
  const { t } = useLocale()
  const formValidation = useFormValidation()
  const password = useRef<HTMLInputElement>(null)
  const [generated, setGenerated] = useState(false)
  const clearGenerated = useCallback(() => setGenerated(false), [])
  const generate = useCallback(() => {
    if (password.current) {
      password.current.value = generatePassword()
      setGenerated(true)
    }
  }, [])
  const submit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      const fields = Object.fromEntries(new FormData(event.currentTarget))
      const result = entrySchema.safeParse({
        ...fields,
        id: entry?.id ?? crypto.randomUUID(),
      })
      if (result.success) onSave(result.data)
    },
    [entry, onSave]
  )

  return (
    <form
      {...formValidation}
      id={formId}
      autoComplete="off"
      onSubmit={submit}
      className="grid max-w-xl gap-2"
    >
      <label className="grid gap-1 text-sm">
        {t.title}
        <input
          className={inputClass}
          name="title"
          defaultValue={entry?.title}
          required
          pattern=".*\S.*"
          maxLength={160}
        />
      </label>
      <label className="grid gap-1 text-sm">
        {t.username}
        <input
          className={inputClass}
          name="username"
          defaultValue={entry?.username}
          autoCapitalize="none"
          maxLength={320}
        />
      </label>
      <div className="flex items-end gap-2">
        <PasswordInput
          fieldClassName="min-w-0 flex-1 text-sm"
          label={t.password}
          className={inputClass}
          ref={password}
          name="password"
          onChange={clearGenerated}
          defaultValue={entry?.password}
          maxLength={1024}
        />
        <IconButton
          type="button"
          disabled={busy}
          onClick={generate}
          icon="generate"
          tone="utility"
          label={t.generatePassword}
        />
      </div>
      <p
        role="status"
        className="text-xs text-zinc-600 empty:hidden dark:text-zinc-400"
      >
        {generated ? t.passwordGenerated : ""}
      </p>
      <label className="grid gap-1 text-sm">
        {t.url}
        <input
          className={inputClass}
          name="url"
          defaultValue={entry?.url}
          inputMode="url"
          autoCapitalize="none"
          maxLength={2048}
        />
      </label>
      <label className="grid gap-1 text-sm">
        {t.notes}
        <textarea
          className={`${inputClass} py-2`}
          name="notes"
          rows={2}
          defaultValue={entry?.notes}
          maxLength={8192}
        />
      </label>
    </form>
  )
}
