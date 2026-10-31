import { afterEach, describe, expect, it } from "bun:test"
import { GET } from "./route"

const originalEnvironment = { ...process.env }

afterEach(() => {
  for (const name of [
    "CRON_SECRET",
    "VERCEL_ENV",
    "DATABASE_REFRESH_ENABLED",
  ]) {
    const value = originalEnvironment[name]
    if (value === undefined) delete process.env[name]
    else process.env[name] = value
  }
})

describe("suspended Hub database refresh route", () => {
  for (const environment of ["production", "preview", "development"]) {
    for (const action of ["refresh", "restore"]) {
      it(`cannot ${action} in ${environment} even with legacy enablement`, async () => {
        process.env.CRON_SECRET = "refresh-test-secret"
        process.env.VERCEL_ENV = environment
        process.env.DATABASE_REFRESH_ENABLED = "true"

        const response = GET(
          new Request(
            `https://hub.example/api/cron/refresh-int?action=${action}`,
            {
              headers: { authorization: "Bearer refresh-test-secret" },
            }
          )
        )

        expect(response.status).toBe(410)
        expect(await response.json()).toEqual({
          error: "Database refresh is suspended",
        })
        expect(response.headers.get("Cache-Control")).toBe("no-store")
      })
    }
  }
})
