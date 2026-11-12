"use client"

import { type FormEvent, useCallback, useState } from "react"
import { buttonClass, primaryClass } from "@/features/vault/components/styles"

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
  const [copyStatus, setCopyStatus] = useState("")
  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopyStatus("Recovery code copied.")
    } catch {
      setCopyStatus("Select and copy the recovery code manually.")
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
    <form className="grid max-w-md gap-3" onSubmit={submit}>
      <p className="text-sm">
        Save this code somewhere safe outside Damaca Secrets. It lets you regain
        access if you forget your master password.
      </p>
      <code className="break-all rounded-lg border border-zinc-300 p-3 text-base select-all dark:border-zinc-700">
        {code}
      </code>
      <div className="flex items-center gap-2">
        <button type="button" onClick={copy} className={buttonClass}>
          Copy code
        </button>
        <span role="status" className="text-sm">
          {copyStatus}
        </span>
      </div>
      <label className="flex min-h-11 items-center gap-2 text-sm">
        <input name="saved" type="checkbox" required className="size-5" />I
        saved my recovery code.
      </label>
      <div className="flex gap-2">
        <button type="submit" disabled={busy} className={primaryClass}>
          Save vault
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
