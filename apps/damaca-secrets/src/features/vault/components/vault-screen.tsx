"use client"

import { useCallback, useState } from "react"
import { ErrorBanner } from "@/components/ui/error-banner"
import { IconButton } from "@/components/ui/icon-button"
import { RecoveryConfirmation } from "@/features/vault/components/recovery-confirmation"
import {
  SetupForm,
  type SetupMode,
} from "@/features/vault/components/setup-form"
import { UnlockForm } from "@/features/vault/components/unlock-form"
import { VaultEntries } from "@/features/vault/components/vault-entries"
import { useVault } from "@/features/vault/use-vault"
import { useLocale } from "@/lib/i18n/client"

export function VaultScreen() {
  const { t } = useLocale()
  const vault = useVault(true)
  const { busy, error, open, prepared, snapshot } = vault
  const [mode, setMode] = useState<Extract<SetupMode, "recover">>()
  const recover = useCallback(() => {
    vault.dismissAutomaticPasskey()
    setMode("recover")
  }, [vault.dismissAutomaticPasskey])
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
      <h1 className="sr-only">{t.vault}</h1>
      {prepared ? (
        <header className="flex min-h-9 items-center gap-2">
          {open || prepared ? (
            <IconButton
              icon="lock"
              tone="security"
              label={t.lockVault}
              onClick={lock}
            />
          ) : null}
        </header>
      ) : null}
      {error ? <ErrorBanner>{t[error]}</ErrorBanner> : null}
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
        <VaultEntries
          busy={busy}
          entries={open.entries}
          onLock={lock}
          onUpdate={vault.updateEntries}
        />
      ) : null}
      {!prepared && !setup && !open && snapshot?.encrypted ? (
        <UnlockForm
          busy={busy}
          hasPasskey={snapshot.encrypted.passkeys.length > 0}
          onChoosePassword={vault.dismissAutomaticPasskey}
          onRecover={recover}
          onUnlock={vault.unlock}
        />
      ) : null}
      {!snapshot && !error ? (
        <p role="status" className="text-sm">
          {t.loadingVault}
        </p>
      ) : null}
      {!snapshot && error ? (
        <IconButton
          type="button"
          disabled={busy}
          onClick={vault.reload}
          icon="refresh"
          label={t.reloadVault}
          className="justify-self-start"
        />
      ) : null}
      {busy ? (
        <p role="status" className="text-sm text-zinc-600 dark:text-zinc-400">
          {t.working}
        </p>
      ) : null}
    </main>
  )
}
