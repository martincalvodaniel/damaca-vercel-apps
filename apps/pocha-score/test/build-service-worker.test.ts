import { expect, test as it } from "bun:test"
import { mkdtemp, readFile, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { buildServiceWorker } from "../scripts/build-service-worker"

it("generates a network-only worker without a static export", async () => {
  const output = await mkdtemp(join(tmpdir(), "authenticated-worker-"))
  try {
    await buildServiceWorker(output)
    const source = await readFile(join(output, "sw.js"), "utf8")
    expect(source).toContain('cache: "no-store"')
    expect(source).not.toContain("cache.match")
  } finally {
    await rm(output, { recursive: true, force: true })
  }
})
