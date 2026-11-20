"use client"

import Link from "next/link"
import { type MouseEvent, useCallback, useEffect, useState } from "react"
import { loadVault } from "@/features/vault/api"
import { RecoveryConfirmation } from "@/features/vault/components/recovery-confirmation"
import { SetupForm } from "@/features/vault/components/setup-form"
import { buttonClass } from "@/features/vault/components/styles"
import { decryptEntries, prepareVault } from "@/features/vault/crypto"
import { authClient } from "@/lib/auth/auth-client"
import { useLocale } from "@/lib/i18n/client"
import { clearOfflineVault } from "@/lib/offline/storage"
import {
  authorizeRecovery,
  type ContactRecoveryView,
  readContacts,
  updateContacts,
} from "./contact-client"
import {
  recoverWithContacts,
  recoveryKeyFingerprint,
  transferContactShare,
} from "./contact-crypto"
import {
  createRecoveryDeviceKey,
  getRecoveryDeviceKey,
  removeRecoveryDeviceKey,
} from "./device-keys"

interface PreparedRecovery {
  requestId: string
  revision: number
  vault: Awaited<ReturnType<typeof prepareVault>>
}

export function ContactRecoveryScreen({ returned }: { returned: boolean }) {
  const { t } = useLocale()
  const [view, setView] = useState<ContactRecoveryView>()
  const [identifiers, setIdentifiers] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(false)
  const [prepared, setPrepared] = useState<PreparedRecovery>()
  const ownRequest = view?.policy?.request

  const reload = useCallback(async (signal?: AbortSignal) => {
    const data = await readContacts(signal)
    const pairs: [string, string][] = []
    if (data.policy?.request) {
      const request = data.policy.request
      pairs.push([request.id, await recoveryKeyFingerprint(request.publicKey)])
    }
    for (const invitation of data.invitations) {
      if (invitation.publicKey)
        pairs.push([
          invitation.policyId,
          await recoveryKeyFingerprint(invitation.publicKey),
        ])
      if (invitation.request)
        pairs.push([
          invitation.request.id,
          await recoveryKeyFingerprint(invitation.request.publicKey),
        ])
    }
    if (!signal?.aborted) {
      setView(data)
      setIdentifiers(Object.fromEntries(pairs))
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    void reload(controller.signal).catch(() => {
      if (!controller.signal.aborted) setError(true)
    })
    return () => controller.abort()
  }, [reload])

  const run = useCallback(async (operation: () => Promise<void>) => {
    setBusy(true)
    setError(false)
    try {
      await operation()
    } catch {
      setError(true)
    } finally {
      setBusy(false)
    }
  }, [])

  const refresh = useCallback(() => void run(() => reload()), [reload, run])

  const verify = useCallback(
    () =>
      void run(async () => {
        await authorizeRecovery("start")
        const result = await authClient.signIn.social({
          provider: "google",
          callbackURL: "/trusted-contacts?verified=1",
        })
        if (result.error) throw new Error("Google verification failed")
      }),
    [run]
  )

  const request = useCallback(
    () =>
      void run(async () => {
        if (!view?.policy?.active) return
        await authorizeRecovery("claim")
        const requestId = crypto.randomUUID()
        const key = await createRecoveryDeviceKey(
          view.ownerId,
          "request",
          requestId
        )
        try {
          await updateContacts({
            action: "request",
            requestId,
            publicKey: key.publicKey,
          })
        } catch (error) {
          await removeRecoveryDeviceKey(view.ownerId, "request", requestId)
          throw error
        }
        await reload()
      }),
    [reload, run, view]
  )

  const cancel = useCallback(
    () =>
      void run(async () => {
        if (!view || !ownRequest) return
        await updateContacts({ action: "cancel", requestId: ownRequest.id })
        await removeRecoveryDeviceKey(view.ownerId, "request", ownRequest.id)
        await reload()
      }),
    [ownRequest, reload, run, view]
  )

  const actForContact = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      const { index, operation } = event.currentTarget.dataset
      void run(async () => {
        if (!view || !index) return
        const invitation = view.invitations[Number(index)]
        if (!invitation) return
        const { ownerId, policyId } = invitation
        if (operation === "accept") {
          const key = await createRecoveryDeviceKey(
            view.ownerId,
            "contact",
            policyId
          )
          await updateContacts({
            action: "accept",
            ownerId,
            policyId,
            publicKey: key.publicKey,
          })
        } else if (invitation.request) {
          const current = invitation.request
          const key = await getRecoveryDeviceKey(
            view.ownerId,
            "contact",
            policyId
          )
          if (!key || key.publicKey !== invitation.publicKey)
            throw new Error("The registered contact device is required")
          const approved = window.confirm(
            `${t.contactApprovalHelp}\n\n${identifiers[current.id]}`
          )
          if (!approved) return
          const share = await transferContactShare(
            {
              ownerId,
              policyId,
              requestId: current.id,
              publicKey: current.publicKey,
            },
            view.ownerId,
            current.share,
            key.privateKey
          )
          await updateContacts({
            action: "approve",
            ownerId,
            policyId,
            requestId: current.id,
            share,
          })
        }
        await reload()
      })
    },
    [identifiers, reload, run, t.contactApprovalHelp, view]
  )

  const prepare = useCallback(
    async (password: string) => {
      const policy = view?.policy
      const request = policy?.request
      const [first, second] = request?.approvals ?? []
      if (!view || !policy || !request?.box || !first || !second) return false
      const box = request.box
      let success = false
      await run(async () => {
        await authorizeRecovery("claim")
        const device = await getRecoveryDeviceKey(
          view.ownerId,
          "request",
          request.id
        )
        if (!device || device.publicKey !== request.publicKey)
          throw new Error("The requesting device is required")
        const snapshot = await loadVault()
        if (
          !snapshot.encrypted ||
          snapshot.ownerId !== view.ownerId ||
          snapshot.revision !== view.revision
        )
          throw new Error("The vault revision changed")
        const key = await recoverWithContacts(
          {
            ownerId: view.ownerId,
            policyId: policy.id,
            requestId: request.id,
            publicKey: request.publicKey,
          },
          device.privateKey,
          box,
          [first, second]
        )
        const entries = await decryptEntries(
          view.ownerId,
          key,
          snapshot.encrypted.entries
        )
        const vault = await prepareVault(view.ownerId, password, entries)
        setPrepared({
          requestId: request.id,
          revision: snapshot.revision,
          vault,
        })
        success = true
      })
      return success
    },
    [run, view]
  )

  const confirm = useCallback(
    () =>
      void run(async () => {
        if (!prepared || !view) return
        await updateContacts({
          action: "complete",
          requestId: prepared.requestId,
          revision: prepared.revision,
          encrypted: prepared.vault.encrypted,
        })
        await Promise.allSettled([
          clearOfflineVault(),
          removeRecoveryDeviceKey(view.ownerId, "request", prepared.requestId),
        ])
        window.location.replace("/")
      }),
    [prepared, run, view]
  )

  const cancelPrepared = useCallback(() => setPrepared(undefined), [])

  return (
    <main className="mx-auto grid max-w-3xl gap-3 p-4 text-sm">
      <h1 className="text-xl font-semibold">{t.trustedContacts}</h1>
      {error ? <p role="alert">{t.contactError}</p> : null}
      <button
        className={buttonClass}
        type="button"
        disabled={busy}
        onClick={refresh}
      >
        {t.contactsRefresh}
      </button>
      {prepared ? (
        <RecoveryConfirmation
          busy={busy}
          code={prepared.vault.recoveryCode}
          onConfirm={confirm}
          onCancel={cancelPrepared}
        />
      ) : null}
      {!prepared && view?.policy?.active ? (
        <section className="grid gap-2 rounded-lg border p-3">
          <h2 className="font-medium">{t.contactsRecover}</h2>
          {ownRequest ? (
            <>
              <p>{t.contactsShareRequest}</p>
              <p className="break-all font-mono">
                {identifiers[ownRequest.id]}
              </p>
              <p>{ownRequest.count} / 2</p>
              <p>{new Date(ownRequest.expiresAt).toLocaleString()}</p>
              {ownRequest.approvals ? (
                <>
                  <button
                    type="button"
                    className={buttonClass}
                    disabled={busy}
                    onClick={verify}
                  >
                    {t.resetVerify}
                  </button>
                  {returned ? (
                    <SetupForm busy={busy} mode="create" onPrepare={prepare} />
                  ) : null}
                </>
              ) : null}
              <button
                type="button"
                className={buttonClass}
                disabled={busy}
                onClick={cancel}
              >
                {t.contactCancelRequest}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className={buttonClass}
                disabled={busy}
                onClick={verify}
              >
                {t.resetVerify}
              </button>
              {returned ? (
                <button
                  type="button"
                  className={buttonClass}
                  disabled={busy}
                  onClick={request}
                >
                  {t.contactRequest}
                </button>
              ) : null}
            </>
          )}
        </section>
      ) : null}
      {view?.invitations.map((invitation, index) => (
        <section
          key={invitation.policyId}
          className="grid gap-2 rounded-lg border p-3"
        >
          <h2 className="font-medium">
            {invitation.ownerEmail ?? invitation.ownerId}
          </h2>
          {invitation.publicKey ? (
            <p className="break-all">
              {t.contactFingerprint} {identifiers[invitation.policyId]}
            </p>
          ) : (
            <button
              type="button"
              className={buttonClass}
              data-index={index}
              data-operation="accept"
              disabled={busy}
              onClick={actForContact}
            >
              {t.contactAccept}
            </button>
          )}
          {invitation.request ? (
            <button
              type="button"
              className={buttonClass}
              data-index={index}
              data-operation="approve"
              disabled={busy}
              onClick={actForContact}
            >
              {t.contactApprove}
            </button>
          ) : null}
        </section>
      ))}
      {view && !view.policy?.active && view.invitations.length === 0 ? (
        <p>{t.contactNothing}</p>
      ) : null}
      <Link href="/" className="w-fit underline">
        {t.backToVault}
      </Link>
    </main>
  )
}
