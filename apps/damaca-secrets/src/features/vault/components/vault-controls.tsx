"use client"

import { useCallback } from "react"
import { buttonClass } from "@/features/vault/components/styles"
import { canUsePasskeys } from "@/features/vault/passkeys"
import type { VaultController } from "@/features/vault/use-vault"
import { useLocale } from "@/lib/i18n/client"
import { formatMessage } from "@/lib/i18n/messages"
import { MAX_PASSKEYS } from "@/schemas/vault"

interface VaultControlsProps {
  vault: VaultController
  onChangePassword: () => void
}

export function VaultControls({ vault, onChangePassword }: VaultControlsProps) {
  const { t } = useLocale()
  const { addPasskey, busy, removePasskeys } = vault
  const count = vault.snapshot?.encrypted?.passkeys.length ?? 0
  const remove = useCallback(() => {
    if (window.confirm(t.confirmRemovePasskeys)) void removePasskeys()
  }, [removePasskeys, t.confirmRemovePasskeys])

  return (
    <div className="flex flex-wrap gap-2 pb-2">
      <button
        type="button"
        onClick={onChangePassword}
        disabled={busy}
        className={buttonClass}
      >
        {t.changeMasterPassword}
      </button>
      {canUsePasskeys() && count < MAX_PASSKEYS ? (
        <button
          type="button"
          onClick={addPasskey}
          disabled={busy}
          className={buttonClass}
        >
          {t.addPasskey}
        </button>
      ) : null}
      {count > 0 ? (
        <button
          type="button"
          onClick={remove}
          disabled={busy}
          className={buttonClass}
        >
          {formatMessage(t.removePasskeys, { count })}
        </button>
      ) : null}
    </div>
  )
}
