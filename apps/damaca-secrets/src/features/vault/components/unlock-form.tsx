"use client"

import Link from "next/link"
import { type FormEvent, useCallback, useSyncExternalStore } from "react"
import { IconButton } from "@/components/ui/icon-button"
import { PasswordInput } from "@/components/ui/password-input"
import { buttonClass, inputClass } from "@/features/vault/components/styles"
import { canUsePasskeys } from "@/features/vault/passkeys"
import type { VaultController } from "@/features/vault/use-vault"
import { useLocale } from "@/lib/i18n/client"
import { useFormValidation } from "@/lib/i18n/form-validation"

const subscribe = () => () => {}
const noPasskeys = () => false

interface UnlockFormProps {
  busy: boolean
  hasPasskey: boolean
  onChoosePassword?: () => void
  onRecover?: () => void
  onUnlock: VaultController["unlock"]
}

export function UnlockForm({
  busy,
  hasPasskey,
  onChoosePassword,
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
      <div className="flex items-end gap-2">
        <PasswordInput
          fieldClassName="flex-1 text-sm font-medium"
          label={t.masterPassword}
          name="password"
          onFocus={onChoosePassword}
          required
          minLength={15}
          maxLength={256}
          className={inputClass}
        />
        <IconButton
          type="submit"
          disabled={busy}
          label={t.unlock}
          icon="forward"
          tone="primary"
        />
      </div>
      {passkeys && hasPasskey ? (
        <button
          type="button"
          disabled={busy}
          onClick={unlockWithPasskey}
          className={`${buttonClass} self-start`}
        >
          {t.unlockWithPasskey}
        </button>
      ) : null}
      {onRecover ? (
        <fieldset
          className="mt-1 grid min-w-0 gap-0 rounded-lg border border-zinc-200 px-2 pb-1 text-sm dark:border-zinc-800"
          disabled={busy}
        >
          <legend className="px-1 font-medium">{t.otherUnlockOptions}</legend>
          <button
            type="button"
            onClick={onRecover}
            className="min-h-9 w-fit text-start underline"
          >
            {t.useRecoveryCode}
          </button>
          <Link
            href="/trusted-contacts"
            className="flex min-h-9 w-fit items-center underline"
          >
            {t.contactsRecover}
          </Link>
          <Link
            href="/reset-vault"
            className="flex min-h-9 w-fit items-center underline"
          >
            {t.resetVault}
          </Link>
        </fieldset>
      ) : null}
    </form>
  )
}
