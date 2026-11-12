import { decodeBytes, encodeBytes } from "@/features/vault/crypto"
import type { EncryptedVault } from "@/schemas/vault"

type Passkey = EncryptedVault["passkeys"][number]

export function canUsePasskeys() {
  return typeof PublicKeyCredential !== "undefined" && !!navigator.credentials
}

function credentialResult(credential: Credential | null) {
  if (!(credential instanceof PublicKeyCredential)) {
    throw new Error("No passkey was selected")
  }
  const result = credential.getClientExtensionResults().prf?.results?.first
  if (!(result instanceof ArrayBuffer) || result.byteLength !== 32) {
    throw new Error("This passkey does not support vault encryption")
  }
  return { id: encodeBytes(new Uint8Array(credential.rawId)), result }
}

export async function authenticatePasskey(
  passkeys: Pick<Passkey, "id" | "salt">[]
) {
  if (!canUsePasskeys()) throw new Error("Passkeys are unavailable")
  return credentialResult(
    await navigator.credentials.get({
      publicKey: {
        challenge: crypto.getRandomValues(new Uint8Array(32)),
        allowCredentials: passkeys.map(({ id }) => ({
          id: decodeBytes(id),
          type: "public-key",
        })),
        userVerification: "required",
        extensions: {
          prf: {
            evalByCredential: Object.fromEntries(
              passkeys.map(({ id, salt }) => [id, { first: decodeBytes(salt) }])
            ),
          },
        },
      },
    })
  )
}

export async function registerPasskey(ownerId: string, existing: Passkey[]) {
  if (!canUsePasskeys()) throw new Error("Passkeys are unavailable")
  const salt = crypto.getRandomValues(new Uint8Array(32))
  const credential = await navigator.credentials.create({
    publicKey: {
      challenge: crypto.getRandomValues(new Uint8Array(32)),
      rp: { name: "Damaca Secrets" },
      user: {
        id: new TextEncoder().encode(ownerId),
        name: ownerId,
        displayName: "Damaca Secrets vault",
      },
      pubKeyCredParams: [
        { alg: -7, type: "public-key" },
        { alg: -257, type: "public-key" },
      ],
      authenticatorSelection: {
        residentKey: "preferred",
        userVerification: "required",
      },
      excludeCredentials: existing.map(({ id }) => ({
        id: decodeBytes(id),
        type: "public-key",
      })),
      attestation: "none",
      extensions: { prf: { eval: { first: salt } } },
    },
  })
  if (!(credential instanceof PublicKeyCredential))
    throw new Error("No passkey was created")
  const id = encodeBytes(new Uint8Array(credential.rawId))
  const encodedSalt = encodeBytes(salt)
  const prf = credential.getClientExtensionResults().prf
  if (prf?.results?.first)
    return { ...credentialResult(credential), salt: encodedSalt }
  if (!prf?.enabled)
    throw new Error("This passkey does not support vault encryption")
  const result = await authenticatePasskey([{ id, salt: encodedSalt }])
  if (result.id !== id) throw new Error("The registered passkey did not match")
  return { ...result, salt: encodedSalt }
}
