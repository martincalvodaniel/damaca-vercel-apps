"use client"

import { type FormEvent, useCallback, useState } from "react"
import { IconButton } from "@/components/ui/icon-button"
import { inputClass, primaryClass } from "@/features/vault/components/styles"
import type { VaultController } from "@/features/vault/use-vault"

export type SetupMode = "create" | "change" | "recover"

interface SetupFormProps {
  busy: boolean
  mode: SetupMode
  onCancel?: () => void
  onPrepare: VaultController["prepare"]
}

export function SetupForm({ busy, mode, onCancel, onPrepare }: SetupFormProps) {
  const [mismatch, setMismatch] = useState(false)
  const submit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      const form = event.currentTarget
      const fields = new FormData(form)
      const password = String(fields.get("password") ?? "")
      const same = password === fields.get("confirm")
      setMismatch(!same)
      if (!same) return
      form.reset()
      void onPrepare(
        password,
        String(fields.get("previous") ?? ""),
        String(fields.get("code") ?? "")
      )
    },
    [onPrepare]
  )

  return (
    <form onSubmit={submit} autoComplete="off" className="grid max-w-md gap-3">
      {mode === "recover" ? (
        <label className="grid gap-1 text-sm font-medium">
          Recovery code
          <input
            name="code"
            type="password"
            required
            maxLength={64}
            className={inputClass}
          />
        </label>
      ) : null}
      {mode === "change" ? (
        <label className="grid gap-1 text-sm font-medium">
          Current master password
          <input
            name="previous"
            type="password"
            required
            maxLength={256}
            className={inputClass}
          />
        </label>
      ) : null}
      <label className="grid gap-1 text-sm font-medium">
        New master password
        <input
          name="password"
          type="password"
          required
          minLength={15}
          maxLength={256}
          className={inputClass}
        />
      </label>
      <label className="grid gap-1 text-sm font-medium">
        Confirm master password
        <input
          name="confirm"
          type="password"
          required
          minLength={15}
          maxLength={256}
          className={inputClass}
        />
      </label>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Use at least 15 characters. A generated passphrase is a good choice.
      </p>
      {mode !== "create" ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          You will get a new recovery code and need to set up your passkeys
          again.
        </p>
      ) : null}
      {mismatch ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          The passwords do not match.
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={busy} className={primaryClass}>
          Continue
        </button>
        {onCancel ? (
          <IconButton
            type="button"
            disabled={busy}
            onClick={onCancel}
            icon="close"
            label="Cancel setup"
          />
        ) : null}
      </div>
    </form>
  )
}
