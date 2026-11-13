"use client"

import { useCallback } from "react"
import { OfflineSettings } from "@/features/offline/offline-settings"
import { buttonClass } from "@/features/vault/components/styles"
import { canUsePasskeys } from "@/features/vault/passkeys"
import type { VaultController } from "@/features/vault/use-vault"
import { MAX_PASSKEYS } from "@/schemas/vault"

interface VaultControlsProps {
  vault: VaultController
  onChangePassword: () => void
}

export function VaultControls({ vault, onChangePassword }: VaultControlsProps) {
  const { addPasskey, busy, removePasskeys } = vault
  const count = vault.snapshot?.encrypted?.passkeys.length ?? 0
  const remove = useCallback(() => {
    if (window.confirm("Remove all passkeys from this vault?"))
      void removePasskeys()
  }, [removePasskeys])

  return (
    <details className="border-t border-zinc-200 text-sm dark:border-zinc-800">
      <summary className="flex min-h-9 cursor-pointer items-center font-medium">
        Vault security
      </summary>
      <div className="flex flex-wrap gap-2 pb-2">
        <button
          type="button"
          onClick={onChangePassword}
          disabled={busy}
          className={buttonClass}
        >
          Change master password
        </button>
        {canUsePasskeys() && count < MAX_PASSKEYS ? (
          <button
            type="button"
            onClick={addPasskey}
            disabled={busy}
            className={buttonClass}
          >
            Add passkey
          </button>
        ) : null}
        {count > 0 ? (
          <button
            type="button"
            onClick={remove}
            disabled={busy}
            className={buttonClass}
          >
            Remove passkeys ({count})
          </button>
        ) : null}
      </div>
      {vault.snapshot ? (
        <OfflineSettings ownerId={vault.snapshot.ownerId} />
      ) : null}
    </details>
  )
}
