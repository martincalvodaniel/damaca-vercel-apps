import { expect, it, mock, spyOn } from "bun:test"
import { MongoClient } from "mongodb"

mock.module("server-only", () => ({}))

it("uses the configured MongoDB database for authentication", async () => {
  const env = {
    BETTER_AUTH_SECRET: "test-secret-with-at-least-32-characters",
    BETTER_AUTH_URL: "http://localhost:3008",
    GOOGLE_CLIENT_ID: "test-client-id",
    GOOGLE_CLIENT_SECRET: "test-client-secret",
    MONGODB_DB: "damaca-pocs-local",
    MONGODB_URI: "mongodb://127.0.0.1:27017",
  }
  const previousEnv = Object.keys(env).map(
    (key) => [key, process.env[key]] as const
  )
  const selectDatabase = spyOn(MongoClient.prototype, "db")

  try {
    Object.assign(process.env, env)
    const { getAuth } = await import("./auth")
    getAuth()

    expect(selectDatabase).toHaveBeenCalledWith("damaca-pocs-local")
  } finally {
    selectDatabase.mockRestore()
    for (const [key, value] of previousEnv) {
      if (value === undefined) delete process.env[key]
      else process.env[key] = value
    }
  }
})
