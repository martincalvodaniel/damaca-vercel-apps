"use client"

import { type FormEvent, useCallback, useSyncExternalStore } from "react"
import {
  buttonClass,
  inputClass,
  primaryClass,
} from "@/features/vault/components/styles"
import { canUsePasskeys } from "@/features/vault/passkeys"
import type { VaultController } from "@/features/vault/use-vault"

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
      onSubmit={submit}
      autoComplete="off"
      className="flex max-w-md flex-col gap-3"
    >
      <label className="grid gap-1 text-sm font-medium">
        Master password
        <input
          name="password"
          type="password"
          required
          minLength={15}
          maxLength={256}
          className={inputClass}
        />
      </label>
      <button type="submit" disabled={busy} className={primaryClass}>
        Unlock
      </button>
      {passkeys && hasPasskey ? (
        <button
          type="button"
          disabled={busy}
          onClick={unlockWithPasskey}
          className={buttonClass}
        >
          Unlock with a passkey
        </button>
      ) : null}
      {onRecover ? (
        <button
          type="button"
          disabled={busy}
          onClick={onRecover}
          className="min-h-11 self-start text-sm underline"
        >
          Use recovery code
        </button>
      ) : null}
    </form>
  )
}
