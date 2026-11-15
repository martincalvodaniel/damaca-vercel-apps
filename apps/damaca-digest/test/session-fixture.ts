import { makeSignature } from "better-auth/crypto"
import { getAuthEnv } from "@/config/env"

export async function createFixtureSession(email: string) {
  const { getAuth } = await import("@/lib/auth/auth")
  const auth = await getAuth()
  const { internalAdapter } = await auth.$context
  const user =
    (await internalAdapter.findUserByEmail(email))?.user ??
    (await internalAdapter.createUser(
      {
        email,
        emailVerified: true,
        name: "Fixture",
      },
      { method: "test" }
    ))
  const session = await internalAdapter.createSession(user.id, false)
  if (!session) throw new Error("Fixture session could not be created")
  const signature = await makeSignature(session.token, getAuthEnv().secret)
  return {
    ownerId: user.id,
    cookie: `better-auth.session_token=${encodeURIComponent(`${session.token}.${signature}`)}`,
  }
}

export async function setFixtureEmailVerified(
  email: string,
  emailVerified: boolean
) {
  const { getAuth } = await import("@/lib/auth/auth")
  const auth = await getAuth()
  const { internalAdapter } = await auth.$context
  const account = await internalAdapter.findUserByEmail(email)
  if (!account) throw new Error("Fixture user was not found")
  await internalAdapter.updateUser(account.user.id, { emailVerified })
}
