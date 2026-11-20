"use client"

import Link from "next/link"
import { useCallback, useState } from "react"
import { z } from "zod"
import { ErrorBanner } from "@/components/ui/error-banner"
import { RecoveryConfirmation } from "@/features/vault/components/recovery-confirmation"
import { SetupForm } from "@/features/vault/components/setup-form"
import { buttonClass } from "@/features/vault/components/styles"
import { prepareVault } from "@/features/vault/crypto"
import { authClient } from "@/lib/auth/auth-client"
import { useLocale } from "@/lib/i18n/client"
import { clearOfflineVault } from "@/lib/offline/storage"
import { masterPasswordSchema } from "@/schemas/vault"

const grantSchema = z.object({
  ownerId: z.string(),
  revision: z.number().int().positive(),
})

function request(method: "POST" | "PATCH", body: unknown) {
  return fetch("/api/vault", {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

export function ResetVaultScreen({ returned }: { returned: boolean }) {
  const { t } = useLocale()
  const [grant, setGrant] = useState<z.infer<typeof grantSchema>>()
  const [prepared, setPrepared] =
    useState<Awaited<ReturnType<typeof prepareVault>>>()
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)

  const proceed = useCallback(async () => {
    setFailed(false)
    setBusy(true)
    try {
      const result = await request("POST", returned ? "claim" : "start")
      if (!result.ok) throw new Error("Reset authorization failed")
      if (returned) {
        setGrant(grantSchema.parse(await result.json()))
      } else {
        const signIn = await authClient.signIn.social({
          provider: "google",
          callbackURL: "/reset-vault?verified=1",
        })
        if (signIn.error)
          throw new Error("Could not start Google authorization")
      }
    } catch {
      setFailed(true)
    } finally {
      setBusy(false)
    }
  }, [returned])

  const prepare = useCallback(
    async (password: string) => {
      if (!grant || !masterPasswordSchema.safeParse(password).success)
        return false
      setFailed(false)
      setBusy(true)
      try {
        setPrepared(await prepareVault(grant.ownerId, password, []))
        return true
      } catch {
        setFailed(true)
        return false
      } finally {
        setBusy(false)
      }
    },
    [grant]
  )

  const confirm = useCallback(async () => {
    if (!grant || !prepared) return
    setFailed(false)
    setBusy(true)
    try {
      const result = await request("PATCH", {
        revision: grant.revision,
        encrypted: prepared.encrypted,
      })
      if (!result.ok) throw new Error("Could not replace vault")
      await clearOfflineVault().catch(() => {})
      window.location.replace("/")
    } catch {
      setFailed(true)
    } finally {
      setBusy(false)
    }
  }, [grant, prepared])

  const cancel = useCallback(async () => {
    setBusy(true)
    try {
      await request("POST", "cancel").catch(() => {})
    } finally {
      window.location.replace("/")
    }
  }, [])

  return (
    <main className="mx-auto grid max-w-3xl gap-3 p-4">
      <h1 className="text-xl font-semibold">{t.resetVault}</h1>
      <p className="text-sm">{t.resetExplanation}</p>
      {failed ? <ErrorBanner>{t.resetFailed}</ErrorBanner> : null}
      {prepared ? (
        <RecoveryConfirmation
          busy={busy}
          code={prepared.recoveryCode}
          onCancel={cancel}
          onConfirm={confirm}
        />
      ) : grant ? (
        <SetupForm
          busy={busy}
          mode="create"
          onPrepare={prepare}
          onCancel={cancel}
        />
      ) : (
        <button
          type="button"
          className={buttonClass}
          disabled={busy}
          onClick={proceed}
        >
          {returned ? t.resetContinue : t.resetVerify}
        </button>
      )}
      {returned && !grant ? (
        <Link href="/reset-vault" className="w-fit underline">
          {t.resetRestart}
        </Link>
      ) : null}
      <button
        type="button"
        className="min-h-9 w-fit underline"
        disabled={busy}
        onClick={cancel}
      >
        {t.backToVault}
      </button>
    </main>
  )
}
