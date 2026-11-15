"use client"

import { type FormEvent, useCallback, useState } from "react"
import { IconButton } from "@/components/ui/icon-button"
import { primaryClass } from "@/features/vault/components/styles"
import { useLocale } from "@/lib/i18n/client"
import { useFormValidation } from "@/lib/i18n/form-validation"
import type { MessageKey } from "@/lib/i18n/messages"

interface RecoveryConfirmationProps {
  busy: boolean
  code: string
  onCancel: () => void
  onConfirm: () => void
}

export function RecoveryConfirmation({
  busy,
  code,
  onCancel,
  onConfirm,
}: RecoveryConfirmationProps) {
  const { t } = useLocale()
  const formValidation = useFormValidation()
  const [copyStatus, setCopyStatus] = useState<MessageKey>()
  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopyStatus("recoveryCodeCopied")
    } catch {
      setCopyStatus("recoveryCopyFailed")
    }
  }, [code])

  const submit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      onConfirm()
    },
    [onConfirm]
  )

  return (
    <form {...formValidation} className="grid max-w-md gap-3" onSubmit={submit}>
      <p className="text-sm">{t.recoverySaveHelp}</p>
      <code className="break-all rounded-lg border border-zinc-300 p-3 text-base select-all dark:border-zinc-700">
        {code}
      </code>
      <div className="flex items-center gap-2">
        <IconButton
          type="button"
          onClick={copy}
          icon="copy"
          tone="utility"
          label={t.copyRecoveryCode}
        />
        <span role="status" className="text-sm">
          {copyStatus ? t[copyStatus] : null}
        </span>
      </div>
      <label className="flex min-h-9 items-center gap-2 text-sm">
        <input name="saved" type="checkbox" required className="size-5" />
        {t.recoverySaved}
      </label>
      <div className="flex gap-2">
        <button type="submit" disabled={busy} className={primaryClass}>
          {t.saveVault}
        </button>
        <IconButton
          type="button"
          disabled={busy}
          onClick={onCancel}
          icon="close"
          label={t.cancelSetup}
          tone="danger"
        />
      </div>
    </form>
  )
}
