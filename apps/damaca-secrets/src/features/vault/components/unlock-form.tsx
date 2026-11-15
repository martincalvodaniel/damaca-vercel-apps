"use client"

import { type FormEvent, useCallback, useSyncExternalStore } from "react"
import {
  buttonClass,
  inputClass,
  primaryClass,
} from "@/features/vault/components/styles"
import { canUsePasskeys } from "@/features/vault/passkeys"
import type { VaultController } from "@/features/vault/use-vault"
import { useLocale } from "@/lib/i18n/client"
import { useFormValidation } from "@/lib/i18n/form-validation"

const subscribe = () => () => {}
const noPasskeys = () => false

interface UnlockFormProps {
  busy: boolean
  hasPasskey: boolean
  onRecover?: () => void
  onUnlock: VaultController["unlock"]
}

export function UnlockForm({
  busy,
  hasPasskey,
  onRecover,
  onUnlock,
}: UnlockFormProps) {
  const { t } = useLocale()
  const formValidation = useFormValidation()
  const passkeys = useSyncExternalStore(subscribe, canUsePasskeys, noPasskeys)
  const submit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      const form = event.currentTarget
      const password = String(new FormData(form).get("password") ?? "")
      form.reset()
      void onUnlock("password", password)
    },
    [onUnlock]
  )

  const unlockWithPasskey = useCallback(() => {
    void onUnlock("passkey")
  }, [onUnlock])

  return (
    <form
      {...formValidation}
      onSubmit={submit}
      autoComplete="off"
      className="flex max-w-md flex-col gap-2"
    >
      <label className="grid gap-1 text-sm font-medium">
        {t.masterPassword}
        <input
          name="password"
          type="password"
          required
          minLength={15}
          maxLength={256}
          className={inputClass}
        />
      </label>
      <div className="flex flex-wrap items-center gap-2">
        <button type="submit" disabled={busy} className={primaryClass}>
          {t.unlock}
        </button>
        {passkeys && hasPasskey ? (
          <button
            type="button"
            disabled={busy}
            onClick={unlockWithPasskey}
            className={buttonClass}
          >
            {t.unlockWithPasskey}
          </button>
        ) : null}
        {onRecover ? (
          <button
            type="button"
            disabled={busy}
            onClick={onRecover}
            className="min-h-9 px-1 text-sm underline"
          >
            {t.useRecoveryCode}
          </button>
        ) : null}
      </div>
    </form>
  )
}
