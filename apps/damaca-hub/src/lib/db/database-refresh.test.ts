import "server-only"

import { afterEach, expect, it } from "bun:test"
import {
  refreshHubIntDatabase,
  restoreHubIntDatabase,
} from "./database-refresh"

const originalEnabled = process.env.DATABASE_REFRESH_ENABLED

afterEach(() => {
  if (originalEnabled === undefined) delete process.env.DATABASE_REFRESH_ENABLED
  else process.env.DATABASE_REFRESH_ENABLED = originalEnabled
})

it("blocks retained refresh and restore functions before opening database connections", async () => {
  process.env.DATABASE_REFRESH_ENABLED = "true"
  await expect(refreshHubIntDatabase()).rejects.toThrow(
    "Hub database refresh is suspended"
  )
  await expect(restoreHubIntDatabase()).rejects.toThrow(
    "Hub database refresh is suspended"
  )
})
