import { readdir } from "node:fs/promises"
import { join } from "node:path"

const build = Bun.spawn(
  ["bun", "run", "--bun", "next", "build", ...process.argv.slice(2)],
  {
    stdout: "inherit",
    stderr: "inherit",
  }
)
const exitCode = await build.exited
if (exitCode !== 0) process.exit(exitCode)

async function collectAssets(
  directory: string,
  prefix: string
): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true })
  const nested = await Promise.all(
    entries.map((entry) => {
      const path = `${prefix}/${entry.name}`
      if (entry.isDirectory())
        return collectAssets(join(directory, entry.name), path)
      return /\.(js|css|woff2?)$/u.test(entry.name) ? [path] : []
    })
  )
  return nested.flat()
}

const assets = [
  "/offline-vault",
  ...(await collectAssets(".next/static", "/_next/static")),
].sort()
const buildId = (await Bun.file(".next/BUILD_ID").text()).trim()
const worker = await Bun.build({
  entrypoints: ["src/lib/offline/service-worker.ts"],
  target: "browser",
  format: "iife",
  minify: true,
  define: {
    OFFLINE_BUILD_ID: JSON.stringify(buildId),
    OFFLINE_ASSET_URLS: JSON.stringify(assets),
  },
})
if (!worker.success || !worker.outputs[0])
  throw new Error("Offline worker build failed")
await Bun.write("public/sw.js", await worker.outputs[0].text())
console.info(`Prepared offline worker with ${assets.length} resources`)
