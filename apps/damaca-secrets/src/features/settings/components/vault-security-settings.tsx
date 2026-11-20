"use client"

import Link from "next/link"
import { useCallback, useId, useState } from "react"
import { ErrorBanner } from "@/components/ui/error-banner"
import { IconButton } from "@/components/ui/icon-button"
import { ContactEnrollment } from "@/features/recovery/contact-enrollment"
import { RecoveryConfirmation } from "@/features/vault/components/recovery-confirmation"
import { SetupForm } from "@/features/vault/components/setup-form"
import { UnlockForm } from "@/features/vault/components/unlock-form"
import { VaultControls } from "@/features/vault/components/vault-controls"
import { useVault } from "@/features/vault/use-vault"
import { useLocale } from "@/lib/i18n/client"

export function VaultSecuritySettings() {
  const { t } = useLocale()
  const headingId = useId()
  const vault = useVault()
  const { busy, error, open, prepared, snapshot } = vault
  const [mode, setMode] = useState<"change" | "recover">()
  const change = useCallback(() => setMode("change"), [])
  const recover = useCallback(() => setMode("recover"), [])
  const cancel = useCallback(() => {
    vault.cancelPreparation()
    setMode(undefined)
  }, [vault.cancelPreparation])
  const lock = useCallback(() => {
    vault.lock()
    setMode(undefined)
  }, [vault.lock])
  const confirm = useCallback(async () => {
    if (await vault.confirm()) setMode(undefined)
  }, [vault.confirm])

  return (
    <section
      aria-labelledby={headingId}
      aria-busy={busy}
      className="grid gap-2 rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <header className="flex min-h-9 items-center justify-between gap-2">
        <h2 id={headingId} className="text-lg font-semibold">
          {t.vaultSecurity}
        </h2>
        {open || prepared ? (
          <IconButton
            icon="lock"
            tone="security"
            label={t.lockVault}
            onClick={lock}
          />
        ) : null}
      </header>
      {error ? <ErrorBanner>{t[error]}</ErrorBanner> : null}
      {!snapshot && !error ? (
        <p role="status" className="text-sm">
          {t.loadingVault}
        </p>
      ) : null}
      {!snapshot && error ? (
        <IconButton
          icon="refresh"
          label={t.reloadVault}
          onClick={vault.reload}
          disabled={busy}
        />
      ) : null}
      {snapshot && !snapshot.encrypted ? (
        <p className="text-sm">{t.createForSecurity}</p>
      ) : null}
      {snapshot?.encrypted && !open && !prepared && !mode ? (
        <UnlockForm
          busy={busy}
          hasPasskey={snapshot.encrypted.passkeys.length > 0}
          onRecover={recover}
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
      {!prepared && mode ? (
        <SetupForm
          busy={busy}
          mode={mode}
          onCancel={cancel}
          onPrepare={vault.prepare}
        />
      ) : null}
      {open && !prepared && !mode ? (
        <VaultControls vault={vault} onChangePassword={change} />
      ) : null}
      {open && !mode && !prepared ? (
        <Link
          href="/trusted-contacts"
          className="min-h-9 w-fit text-sm underline"
        >
          {t.trustedContacts}
        </Link>
      ) : null}
      {open && snapshot && !mode && !prepared ? (
        <ContactEnrollment vaultKey={open.key} revision={snapshot.revision} />
      ) : null}
    </section>
  )
}
