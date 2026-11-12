"use client"

import { useCallback, useState } from "react"
import { ErrorBanner } from "@/components/ui/error-banner"
import { RecoveryConfirmation } from "@/features/vault/components/recovery-confirmation"
import {
  SetupForm,
  type SetupMode,
} from "@/features/vault/components/setup-form"
import { buttonClass } from "@/features/vault/components/styles"
import { UnlockForm } from "@/features/vault/components/unlock-form"
import { VaultControls } from "@/features/vault/components/vault-controls"
import { VaultEntries } from "@/features/vault/components/vault-entries"
import { useVault } from "@/features/vault/use-vault"

export function VaultScreen() {
  const vault = useVault()
  const { busy, error, open, prepared, snapshot } = vault
  const [mode, setMode] = useState<SetupMode>()
  const recover = useCallback(() => setMode("recover"), [])
  const change = useCallback(() => setMode("change"), [])
  const resetMode = useCallback(() => setMode(undefined), [])
  const cancel = useCallback(() => {
    vault.cancelPreparation()
    resetMode()
  }, [resetMode, vault.cancelPreparation])
  const lock = useCallback(() => {
    vault.lock()
    resetMode()
  }, [resetMode, vault.lock])
  const confirm = useCallback(async () => {
    if (await vault.confirm()) resetMode()
  }, [resetMode, vault.confirm])
  const setup = snapshot && !snapshot.encrypted ? "create" : mode

  return (
    <main
      className="mx-auto grid w-full max-w-3xl gap-3 px-3 py-3 sm:px-6 sm:py-5"
      aria-busy={busy}
    >
      <header className="flex min-h-11 items-center justify-between gap-2">
        <h1 className="text-xl font-semibold tracking-tight">Vault</h1>
        {open || prepared ? (
          <button type="button" className={buttonClass} onClick={lock}>
            Lock
          </button>
        ) : null}
      </header>
      {error ? <ErrorBanner>{error}</ErrorBanner> : null}
      {prepared ? (
        <RecoveryConfirmation
          busy={busy}
          code={prepared.recoveryCode}
          onCancel={cancel}
          onConfirm={confirm}
        />
      ) : null}
      {!prepared && setup && snapshot ? (
        <SetupForm
          key={setup}
          busy={busy}
          mode={setup}
          onCancel={setup === "create" ? undefined : resetMode}
          onPrepare={vault.prepare}
        />
      ) : null}
      {!prepared && !setup && open ? (
        <>
          <VaultEntries
            busy={busy}
            entries={open.entries}
            onUpdate={vault.updateEntries}
          />
          <VaultControls vault={vault} onChangePassword={change} />
        </>
      ) : null}
      {!prepared && !setup && !open && snapshot?.encrypted ? (
        <UnlockForm
          busy={busy}
          hasPasskey={snapshot.encrypted.passkeys.length > 0}
          onRecover={recover}
          onUnlock={vault.unlock}
        />
      ) : null}
      {!snapshot && !error ? (
        <p role="status" className="text-sm">
          Loading vault…
        </p>
      ) : null}
      {!snapshot && error ? (
        <button
          type="button"
          className={`${buttonClass} justify-self-start`}
          disabled={busy}
          onClick={vault.reload}
        >
          Reload vault
        </button>
      ) : null}
      {busy ? (
        <p role="status" className="text-sm text-zinc-600 dark:text-zinc-400">
          Working…
        </p>
      ) : null}
    </main>
  )
}
