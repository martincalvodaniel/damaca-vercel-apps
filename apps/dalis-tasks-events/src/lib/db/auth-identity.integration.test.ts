import "server-only"

import { afterAll, beforeAll, describe, expect, test as it } from "bun:test"
import { betterAuth } from "better-auth"
import { testUtils } from "better-auth/plugins"
import { getAuthDatabaseTestConfig } from "@/config/env"
import { AUTH_MODEL_NAMES } from "@/lib/db/auth-models"
import { closeDatabaseConnection, getDatabase } from "@/lib/db/client"
import { COLLECTION_NAMES, getCollection } from "@/lib/db/collections"
import { ensureIndexes } from "@/lib/db/ensure-indexes"

const testConfig = getAuthDatabaseTestConfig()

describe.skipIf(!testConfig)("Hub consumer Mongo identity", () => {
  async function createTestAuth() {
    const { auth } = await import("@/lib/auth/auth")
    return betterAuth({
      ...auth.options,
      logger: { disabled: true },
      plugins: [...(auth.options.plugins ?? []), testUtils()],
    })
  }

  beforeAll(async () => {
    const database = await getDatabase()
    if (database.databaseName !== testConfig?.databaseName)
      throw new Error("Auth test database ownership is invalid")
    await database.dropDatabase()
    await ensureIndexes(database)
  })

  afterAll(async () => {
    await (await getDatabase()).dropDatabase()
    await closeDatabaseConnection()
  })

  it("configures only the Hub provider and the established Mongo collections", async () => {
    const instance = await createTestAuth()
    const context = await instance.$context
    expect(context.socialProviders.map((provider) => provider.id)).toEqual([
      "damaca-hub",
    ])
    expect(instance.options.database).toBeDefined()
    expect(instance.options.user?.modelName).toBe(AUTH_MODEL_NAMES.user)
    expect(instance.options.account?.modelName).toBe(AUTH_MODEL_NAMES.account)
    expect(instance.options.session?.modelName).toBe(AUTH_MODEL_NAMES.session)
    expect(instance.options.verification?.modelName).toBe(
      AUTH_MODEL_NAMES.verification
    )
  })

  it("keeps the local user identity stable when the Hub account is linked", async () => {
    const instance = await createTestAuth()
    const context = await instance.$context
    const email = `hub-link-${crypto.randomUUID()}@example.test`
    const user = await context.test.saveUser(
      context.test.createUser({
        email,
        emailVerified: true,
        name: "Existing Tasks user",
      })
    )
    await context.internalAdapter.linkAccount({
      accountId: `legacy-google-${crypto.randomUUID()}`,
      providerId: "google",
      userId: user.id,
    })
    await context.internalAdapter.linkAccount({
      accountId: `hub-subject-${crypto.randomUUID()}`,
      providerId: "damaca-hub",
      userId: user.id,
    })

    await closeDatabaseConnection()
    const restarted = await createTestAuth()
    const reopened = await restarted.$context
    const found = await reopened.internalAdapter.findUserByEmail(email)
    expect(found?.user.id).toBe(user.id)
    expect(found?.accounts.map((account) => account.providerId).sort()).toEqual(
      ["damaca-hub", "google"]
    )
    expect(
      await (await getCollection(COLLECTION_NAMES.authUser)).countDocuments({
        email,
      })
    ).toBe(1)
  }, 20000)
})
