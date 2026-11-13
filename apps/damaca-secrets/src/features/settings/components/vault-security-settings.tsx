"use client"

import { useCallback, useId, useState } from "react"
import { ErrorBanner } from "@/components/ui/error-banner"
import { IconButton } from "@/components/ui/icon-button"
import { RecoveryConfirmation } from "@/features/vault/components/recovery-confirmation"
import { SetupForm } from "@/features/vault/components/setup-form"
import { UnlockForm } from "@/features/vault/components/unlock-form"
import { VaultControls } from "@/features/vault/components/vault-controls"
import { useVault } from "@/features/vault/use-vault"

export function VaultSecuritySettings() {
  const headingId = useId()
  const vault = useVault()
  const { busy, error, open, prepared, snapshot } = vault
  const [changing, setChanging] = useState(false)
  const change = useCallback(() => setChanging(true), [])
  const cancel = useCallback(() => {
    vault.cancelPreparation()
    setChanging(false)
  }, [vault.cancelPreparation])
  const lock = useCallback(() => {
    vault.lock()
    setChanging(false)
  }, [vault.lock])
  const confirm = useCallback(async () => {
    if (await vault.confirm()) setChanging(false)
  }, [vault.confirm])

  return (
    <section
      aria-labelledby={headingId}
      aria-busy={busy}
      className="grid gap-2 rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <header className="flex min-h-9 items-center justify-between gap-2">
        <h2 id={headingId} className="text-lg font-semibold">
          Vault security
        </h2>
        {open || prepared ? (
          <IconButton icon="lock" label="Lock vault" onClick={lock} />
        ) : null}
      </header>
      {error ? <ErrorBanner>{error}</ErrorBanner> : null}
      {!snapshot && !error ? (
        <p role="status" className="text-sm">
          Loading vault…
        </p>
      ) : null}
      {!snapshot && error ? (
        <IconButton
          icon="refresh"
          label="Reload vault"
          onClick={vault.reload}
          disabled={busy}
        />
      ) : null}
      {snapshot && !snapshot.encrypted ? (
        <p className="text-sm">Create your vault to manage its security.</p>
      ) : null}
      {snapshot?.encrypted && !open && !prepared ? (
        <UnlockForm
          busy={busy}
          hasPasskey={snapshot.encrypted.passkeys.length > 0}
          onUnlock={vault.unlock}
        />
      ) : null}
      {prepared ? (
        <RecoveryConfirmation
          busy={busy}
          code={prepared.recoveryCode}
          onCancel={cancel}
          onConfirm={confirm}
        />
      ) : null}
      {open && !prepared ? (
        changing ? (
          <SetupForm
            busy={busy}
            mode="change"
            onCancel={cancel}
            onPrepare={vault.prepare}
          />
        ) : (
          <VaultControls vault={vault} onChangePassword={change} />
        )
      ) : null}
    </section>
  )
}
