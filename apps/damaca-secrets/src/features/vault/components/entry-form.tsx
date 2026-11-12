"use client"

import { type FormEvent, useCallback, useRef } from "react"
import {
  buttonClass,
  inputClass,
  primaryClass,
} from "@/features/vault/components/styles"
import { generatePassword } from "@/features/vault/crypto"
import { entrySchema, type VaultEntry } from "@/schemas/vault"

interface EntryFormProps {
  busy: boolean
  entry?: VaultEntry
  onCancel: () => void
  onSave: (entry: VaultEntry) => void
}

export function EntryForm({ busy, entry, onCancel, onSave }: EntryFormProps) {
  const password = useRef<HTMLInputElement>(null)
  const generate = useCallback(() => {
    if (password.current) {
      password.current.value = generatePassword()
      password.current.focus()
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
    <form autoComplete="off" onSubmit={submit} className="grid max-w-xl gap-2">
      <label className="grid gap-1 text-sm">
        Title
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
        Username
        <input
          className={inputClass}
          name="username"
          defaultValue={entry?.username}
          autoCapitalize="none"
          maxLength={320}
        />
      </label>
      <div className="flex items-end gap-2">
        <label className="grid min-w-0 flex-1 gap-1 text-sm">
          Password
          <input
            className={inputClass}
            ref={password}
            name="password"
            type="password"
            defaultValue={entry?.password}
            maxLength={1024}
          />
        </label>
        <button
          type="button"
          disabled={busy}
          onClick={generate}
          className={buttonClass}
        >
          Generate
        </button>
      </div>
      <label className="grid gap-1 text-sm">
        URL
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
        Notes
        <textarea
          className={`${inputClass} py-2`}
          name="notes"
          rows={2}
          defaultValue={entry?.notes}
          maxLength={8192}
        />
      </label>
      <div className="flex gap-2 pt-1">
        <button type="submit" disabled={busy} className={primaryClass}>
          Save
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onCancel}
          className={buttonClass}
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
