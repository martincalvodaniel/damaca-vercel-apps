import { expect, it } from "bun:test"
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { buildServiceWorker } from "../scripts/build-service-worker"

it("generates a complete deterministic shell, changes its version with content and rejects incomplete exports", async () => {
  const output = await mkdtemp(join(tmpdir(), "local-template-build-"))
  try {
    await writeFile(join(output, "index.html"), "Home")
    await expect(buildServiceWorker(output)).rejects.toThrow(
      "Missing required app routes"
    )
    await mkdir(join(output, "settings"))
    await writeFile(join(output, "settings/index.html"), "Settings")
    await writeFile(join(output, "settings/index.txt"), "RSC payload")
    await writeFile(join(output, "app.js"), "console.info('app')")
    await writeFile(join(output, "app.js.map"), "source map")
    await buildServiceWorker(output)
    const source = await readFile(join(output, "sw.js"), "utf8")
    expect(source).toContain('"/settings/"')
    expect(source).toContain('"/settings/index.txt"')
    expect(source).toContain('"/app.js"')
    expect(source).not.toContain("app.js.map")
    expect(source).not.toContain("__PRECACHE_ASSETS__")
    await buildServiceWorker(output)
    expect(await readFile(join(output, "sw.js"), "utf8")).toBe(source)
    await writeFile(join(output, "app.js"), "console.info('updated app')")
    await buildServiceWorker(output)
    expect(await readFile(join(output, "sw.js"), "utf8")).not.toBe(source)
  } finally {
    await rm(output, { recursive: true, force: true })
  }
})
