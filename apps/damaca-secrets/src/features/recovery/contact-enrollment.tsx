"use client"

import { type FormEvent, useCallback, useEffect, useState } from "react"
import { buttonClass, inputClass } from "@/features/vault/components/styles"
import { useLocale } from "@/lib/i18n/client"
import {
  type ContactRecoveryView,
  readContacts,
  updateContacts,
} from "./contact-client"
import { createContactRecovery, recoveryKeyFingerprint } from "./contact-crypto"

export function ContactEnrollment({
  vaultKey,
  revision,
}: {
  vaultKey: CryptoKey
  revision: number
}) {
  const { t } = useLocale()
  const [data, setData] = useState<ContactRecoveryView>()
  const [fingerprints, setFingerprints] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(false)
  const policy = data?.policy

  const reload = useCallback(async (signal?: AbortSignal) => {
    const view = await readContacts(signal)
    const fingerprints = await Promise.all(
      (view.policy?.contacts ?? []).map(({ publicKey }) =>
        publicKey ? recoveryKeyFingerprint(publicKey) : Promise.resolve("")
      )
    )
    if (!signal?.aborted) {
      setData(view)
      setFingerprints(fingerprints)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    void reload(controller.signal).catch(() => {
      if (!controller.signal.aborted) setError(true)
    })
    return () => controller.abort()
  }, [reload])

  const submit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      const fields = new FormData(event.currentTarget)
      setBusy(true)
      setError(false)
      try {
        if (fields.get("confirm") && policy && data?.revision) {
          if (data.revision !== revision)
            throw new Error(
              "Unlock the current vault revision before enrolling contacts"
            )
          const contacts = policy.contacts.flatMap(({ id, publicKey }) =>
            publicKey ? [{ id, publicKey }] : []
          )
          const [first, second, third] = contacts
          if (!first || !second || !third)
            throw new Error("Three verified contacts are required")
          const encrypted = await createContactRecovery(
            { ownerId: data.ownerId, policyId: policy.id },
            vaultKey,
            [first, second, third]
          )
          await updateContacts({
            action: "activate",
            ...encrypted,
            policyId: policy.id,
            revision: data.revision,
          })
        } else {
          const emails: [string, string, string] = [
            String(fields.get("first") ?? ""),
            String(fields.get("second") ?? ""),
            String(fields.get("third") ?? ""),
          ]
          await updateContacts({ action: "invite", emails })
        }
        await reload()
      } catch {
        setError(true)
      } finally {
        setBusy(false)
      }
    },
    [data, policy, reload, revision, vaultKey]
  )

  const refresh = useCallback(() => {
    setError(false)
    void reload().catch(() => setError(true))
  }, [reload])

  return (
    <div className="mt-3 grid gap-2 border-t pt-3 text-sm">
      <h3 className="font-medium">{t.trustedContacts}</h3>
      {error ? <p role="alert">{t.contactError}</p> : null}
      {!data ? (
        <button type="button" onClick={refresh} className={buttonClass}>
          {t.tryAgain}
        </button>
      ) : policy?.active ? (
        <p>{t.contactsActive}</p>
      ) : (
        <form className="grid gap-2" onSubmit={submit}>
          {policy ? (
            <>
              <ul className="grid gap-1">
                {policy.contacts.map((contact, index) => (
                  <li key={contact.id} className="break-all">
                    {contact.email} · {fingerprints[index] || t.contactPending}
                  </li>
                ))}
              </ul>
              <button className={buttonClass} type="button" onClick={refresh}>
                {t.contactsRefresh}
              </button>
              {fingerprints.length === 3 && fingerprints.every(Boolean) ? (
                <>
                  <label className="flex gap-2">
                    <input type="checkbox" name="confirm" required />
                    {t.contactsConfirmKeys}
                  </label>
                  <button className={buttonClass} disabled={busy} type="submit">
                    {t.contactsActivate}
                  </button>
                </>
              ) : null}
            </>
          ) : (
            <>
              <p>{t.contactsInviteHelp}</p>
              {(["first", "second", "third"] as const).map((slot, index) => (
                <input
                  aria-label={`${t.contactEmail} ${index + 1}`}
                  className={inputClass}
                  key={slot}
                  name={slot}
                  type="email"
                  required
                />
              ))}
              <button className={buttonClass} disabled={busy} type="submit">
                {t.contactsInvite}
              </button>
            </>
          )}
        </form>
      )}
    </div>
  )
}
