import "server-only"

import { betterAuth } from "better-auth"
import { mongodbAdapter } from "better-auth/adapters/mongodb"
import { APIError } from "better-auth/api"
import { getAuthEnvironment } from "@/config/auth-env"
import { getAccessRole, requestAdmission } from "@/lib/admission"
import { getDatabaseConnection } from "@/lib/database"

function denyAdmission(): never {
  throw new APIError("FORBIDDEN", {
    code: "admission_required",
    message: "Administrator approval is required",
  })
}

async function enforceAdmission(user: {
  email: string
  emailVerified: boolean
  name: string
}) {
  if (await getAccessRole(user)) return
  await requestAdmission(user)
  denyAdmission()
}

function createAuth() {
  const env = getAuthEnvironment()
  const { client, db } = getDatabaseConnection()

  return betterAuth({
    baseURL: env.baseURL,
    secret: env.secret,
    advanced: { cookiePrefix: "ebrias" },
    database: mongodbAdapter(db, { client }),
    socialProviders: {
      google: { clientId: env.clientId, clientSecret: env.clientSecret },
    },
    databaseHooks: {
      user: {
        create: {
          before: async (user) => {
            await enforceAdmission(user)
          },
        },
      },
      session: {
        create: {
          before: async (session, context) => {
            const user = await context?.context.internalAdapter.findUserById(
              session.userId
            )
            if (!user) denyAdmission()
            await enforceAdmission(user)
          },
        },
      },
    },
    onAPIError: { errorURL: "/" },
  })
}

let auth: ReturnType<typeof createAuth> | undefined

export function getAuth() {
  auth ??= createAuth()
  return auth
}
