import { afterEach, describe, expect, it } from "bun:test"
import { GET } from "./route"

const originalCronSecret = process.env.CRON_SECRET
const originalVercelEnv = process.env.VERCEL_ENV
const originalRefreshEnabled = process.env.DATABASE_REFRESH_ENABLED

afterEach(() => {
  if (originalCronSecret === undefined) delete process.env.CRON_SECRET
  else process.env.CRON_SECRET = originalCronSecret

  if (originalVercelEnv === undefined) delete process.env.VERCEL_ENV
  else process.env.VERCEL_ENV = originalVercelEnv

  if (originalRefreshEnabled === undefined)
    delete process.env.DATABASE_REFRESH_ENABLED
  else process.env.DATABASE_REFRESH_ENABLED = originalRefreshEnabled
})

describe("Hub database refresh route", () => {
  it("rejects requests without the cron bearer secret", async () => {
    process.env.CRON_SECRET = "refresh-test-secret"
    process.env.VERCEL_ENV = "production"

    const response = await GET(
      new Request("https://hub.example/api/cron/refresh-int")
    )

    expect(response.status).toBe(401)
  })

  it("rejects authenticated requests outside production", async () => {
    process.env.CRON_SECRET = "refresh-test-secret"
    process.env.VERCEL_ENV = "preview"

    const response = await GET(
      new Request("https://hub.example/api/cron/refresh-int", {
        headers: { authorization: "Bearer refresh-test-secret" },
      })
    )

    expect(response.status).toBe(403)
  })

  it("requires explicit enablement before refreshing data", async () => {
    process.env.CRON_SECRET = "refresh-test-secret"
    process.env.VERCEL_ENV = "production"
    delete process.env.DATABASE_REFRESH_ENABLED

    const response = await GET(
      new Request("https://hub.example/api/cron/refresh-int", {
        headers: { authorization: "Bearer refresh-test-secret" },
      })
    )

    expect(response.status).toBe(503)
  })
})
