import { cookies } from "next/headers"
import { getAuthBaseUrl } from "@/config/env"
import { notifyRecovery } from "@/features/recovery/notifications"
import { getAccessRole } from "@/lib/auth/access"
import { getAuthorizedSession } from "@/lib/auth/session"
import { readResetProof, resetCookie } from "@/lib/auth/vault-reset-proof"
import {
  completeContactRecovery,
  findContactRecovery,
  findRecoveryContact,
  findRecoveryInvitations,
  saveContactRecovery,
} from "@/lib/db/vault"
import {
  type ContactRecoveryPolicy,
  contactRecoveryAction,
} from "@/schemas/contact-recovery"
import { VAULT_BODY_LIMIT } from "@/schemas/vault"

const requestDuration = 48 * 60 * 60 * 1000

function json(body: unknown, status = 200) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  })
}

function failure(status: number) {
  return json({ error: status }, status)
}

function activeRequest(policy: ContactRecoveryPolicy | undefined) {
  const request = policy?.request
  return request && request.expiresAt > Date.now() ? request : undefined
}

export async function GET() {
  const session = await getAuthorizedSession()
  if (!session) return failure(401)
  const [own, invitations] = await Promise.all([
    findContactRecovery(session.user.id),
    findRecoveryInvitations(session.user.email.toLowerCase()),
  ])
  const policy = own?.contactRecovery
  const request = activeRequest(policy)
  return json({
    ownerId: session.user.id,
    revision: own?.revision,
    policy: policy && {
      id: policy.id,
      active: Boolean(policy.box),
      contacts: policy.contacts.map(({ id, email, publicKey }) => ({
        id,
        email,
        publicKey,
      })),
      request: request && {
        id: request.id,
        publicKey: request.publicKey,
        expiresAt: request.expiresAt,
        count: request.approvals.length,
        ...(request.approvals.length >= 2
          ? { approvals: request.approvals, box: policy.box }
          : {}),
      },
    },
    invitations: invitations.flatMap(({ _id, contactRecovery }) => {
      const contact = contactRecovery?.contacts.find(
        ({ id }) => id === session.user.id
      )
      if (!contactRecovery || !contact) return []
      const pending = activeRequest(contactRecovery)
      const approved = pending?.approvals.some(
        ({ contactId }) => contactId === contact.id
      )
      return [
        {
          ownerId: _id,
          ownerEmail: contactRecovery.ownerEmail,
          policyId: contactRecovery.id,
          publicKey: contact.publicKey,
          request:
            pending && contact.share && !approved
              ? {
                  id: pending.id,
                  publicKey: pending.publicKey,
                  share: contact.share,
                }
              : undefined,
        },
      ]
    }),
  })
}

async function parse(request: Request) {
  const reader = request.body?.getReader()
  if (!reader) return
  let size = 0
  let body = ""
  const decoder = new TextDecoder("utf-8", { fatal: true })
  try {
    for (;;) {
      const { done, value } = await reader.read()
      if (done)
        return contactRecoveryAction.safeParse(
          JSON.parse(body + decoder.decode())
        ).data
      size += value.byteLength
      if (size > VAULT_BODY_LIMIT) {
        await reader.cancel()
        return
      }
      body += decoder.decode(value, { stream: true })
    }
  } catch {
    return
  } finally {
    reader.releaseLock()
  }
}

export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(getAuthBaseUrl()).origin)
    return failure(403)
  const session = await getAuthorizedSession()
  if (!session) return failure(401)
  const action = await parse(request)
  if (!action) return failure(400)

  const ownerId = "ownerId" in action ? action.ownerId : session.user.id
  const vault = await findContactRecovery(ownerId)
  if (!vault) return failure(404)
  const previous = vault.contactRecovery
  const save = async (
    policy: ContactRecoveryPolicy,
    authorizationId?: string
  ) =>
    (await saveContactRecovery(
      ownerId,
      vault.revision,
      previous,
      policy,
      authorizationId
    ))
      ? json({})
      : failure(409)

  if (action.action === "invite") {
    if (previous?.box) return failure(409)
    const emails = action.emails.map((email) => email.toLowerCase())
    if (
      new Set(emails).size !== 3 ||
      emails.includes(session.user.email.toLowerCase())
    )
      return failure(400)
    const contacts = []
    for (const email of emails) {
      const user = await findRecoveryContact(email)
      if (
        !user ||
        !(await getAccessRole(email)) ||
        String(user._id) === ownerId
      )
        return failure(400)
      contacts.push({ id: String(user._id), email })
    }
    const id = crypto.randomUUID()
    const result = await save({
      id,
      version: 1,
      ownerEmail: session.user.email,
      contacts,
    })
    if (result.ok) notifyRecovery("invite", id, emails)
    return result
  }
  if (!previous || ("policyId" in action && action.policyId !== previous.id))
    return failure(409)

  const next = { ...previous, version: previous.version + 1 }
  const pending = activeRequest(previous)
  if (action.action === "accept" || action.action === "approve") {
    const contact = previous.contacts.find(({ id }) => id === session.user.id)
    if (!contact) return failure(403)
    if (action.action === "accept") {
      if (
        previous.box ||
        (contact.publicKey && contact.publicKey !== action.publicKey)
      )
        return failure(409)
      return save({
        ...next,
        contacts: next.contacts.map((item) =>
          item.id === contact.id
            ? { ...item, publicKey: action.publicKey }
            : item
        ),
      })
    }
    if (
      !contact.share ||
      !pending ||
      pending.id !== action.requestId ||
      pending.approvals.some(({ contactId }) => contactId === contact.id) ||
      pending.approvals.length >= 2
    )
      return failure(409)
    return save({
      ...next,
      request: {
        ...pending,
        approvals: [
          ...pending.approvals,
          { contactId: contact.id, share: action.share },
        ],
      },
    })
  }

  if (action.action === "activate") {
    if (previous.box || action.revision !== vault.revision) return failure(409)
    const contacts = []
    for (const contact of previous.contacts) {
      const envelope = action.envelopes.find(
        ({ contactId }) => contactId === contact.id
      )
      if (
        !contact.publicKey ||
        !envelope ||
        !(await getAccessRole(contact.email))
      )
        return failure(409)
      contacts.push({ ...contact, share: envelope.share })
    }
    return save({ ...next, box: action.box, contacts })
  }
  if (action.action === "cancel") {
    if (!pending || pending.id !== action.requestId) return failure(409)
    const { request: _discarded, ...remaining } = next
    const result = await save(remaining)
    if (result.ok)
      notifyRecovery("cancel", pending.id, [
        previous.ownerEmail,
        ...previous.contacts.map(({ email }) => email),
      ])
    return result
  }

  const store = await cookies()
  const proof = readResetProof(store.get(resetCookie)?.value)
  if (
    proof?.stage !== "grant" ||
    proof.purpose !== "contacts" ||
    proof.resetId !== vault.resetId ||
    proof.owner !== ownerId ||
    proof.session !== session.session.id ||
    proof.revision !== vault.revision
  )
    return failure(403)

  if (action.action === "request") {
    if (!previous.box || pending) return failure(409)
    const result = await save(
      {
        ...next,
        request: {
          id: action.requestId,
          publicKey: action.publicKey,
          expiresAt: Date.now() + requestDuration,
          approvals: [],
        },
      },
      proof.resetId
    )
    if (result.ok)
      notifyRecovery("request", action.requestId, [
        previous.ownerEmail,
        ...previous.contacts.map(({ email }) => email),
      ])
    return result
  }
  if (
    !pending ||
    pending.id !== action.requestId ||
    pending.approvals.length !== 2 ||
    action.revision !== vault.revision
  )
    return failure(409)
  for (const approval of pending.approvals) {
    const approver = previous.contacts.find(
      ({ id }) => id === approval.contactId
    )
    if (!approver || !(await getAccessRole(approver.email))) return failure(403)
  }
  return (await completeContactRecovery(
    ownerId,
    vault.revision,
    previous,
    Date.now(),
    proof.resetId,
    action.encrypted
  ))
    ? json({})
    : failure(409)
}
