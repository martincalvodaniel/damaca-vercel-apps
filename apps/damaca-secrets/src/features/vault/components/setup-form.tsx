"use client"

import { type FormEvent, useCallback, useState } from "react"
import { IconButton } from "@/components/ui/icon-button"
import { PasswordInput } from "@/components/ui/password-input"
import { inputClass, primaryClass } from "@/features/vault/components/styles"
import type { VaultController } from "@/features/vault/use-vault"
import { useLocale } from "@/lib/i18n/client"
import { useFormValidation } from "@/lib/i18n/form-validation"

export type SetupMode = "create" | "change" | "recover"

interface SetupFormProps {
  busy: boolean
  mode: SetupMode
  onCancel?: () => void
  onPrepare: VaultController["prepare"]
}

export function SetupForm({ busy, mode, onCancel, onPrepare }: SetupFormProps) {
  const { t } = useLocale()
  const formValidation = useFormValidation()
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
    <form
      {...formValidation}
      onSubmit={submit}
      autoComplete="off"
      className="grid max-w-md gap-3"
    >
      {mode === "recover" ? (
        <PasswordInput
          fieldClassName="text-sm font-medium"
          label={t.recoveryCode}
          name="code"
          required
          maxLength={64}
          className={inputClass}
        />
      ) : null}
      {mode === "change" ? (
        <PasswordInput
          fieldClassName="text-sm font-medium"
          label={t.currentMasterPassword}
          name="previous"
          required
          maxLength={256}
          className={inputClass}
        />
      ) : null}
      <PasswordInput
        fieldClassName="text-sm font-medium"
        label={t.newMasterPassword}
        name="password"
        required
        minLength={15}
        maxLength={256}
        className={inputClass}
      />
      <PasswordInput
        fieldClassName="text-sm font-medium"
        label={t.confirmMasterPassword}
        name="confirm"
        required
        minLength={15}
        maxLength={256}
        className={inputClass}
      />
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        {t.passwordLengthHelp}
      </p>
      {mode !== "create" ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {t.rekeyHelp}
        </p>
      ) : null}
      {mismatch ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {t.passwordMismatch}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={busy} className={primaryClass}>
          {t.continue}
        </button>
        {onCancel ? (
          <IconButton
            type="button"
            disabled={busy}
            onClick={onCancel}
            icon="close"
            label={t.cancelSetup}
            tone="danger"
          />
        ) : null}
      </div>
    </form>
  )
}
