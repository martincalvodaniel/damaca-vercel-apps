import { createHash } from "node:crypto"
import { readdir, readFile, stat, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { appConfig } from "../src/config/app"

export async function buildServiceWorker(outputDirectory = "out") {
  const files = (await readdir(outputDirectory, { recursive: true }))
    .filter((file) => !file.endsWith(".map") && file !== "sw.js")
    .sort()
  const assets: string[] = []
  const hash = createHash("sha256")
  const template = await readFile(
    new URL("./service-worker.js", import.meta.url),
    "utf8"
  )
  hash.update(template)
  for (const file of files) {
    const path = join(outputDirectory, file)
    const entry = await stat(path)
    if (!entry.isFile()) continue
    hash.update(file).update(await readFile(path))
    assets.push(`/${file.replace(/(^|\/)index\.html$/, "$1")}`)
  }
  if (!assets.includes("/") || !assets.includes("/settings/"))
    throw new Error("Missing required app routes in static export.")
  const version = hash.digest("hex").slice(0, 16)
  const source = template
    .replace("__CACHE_PREFIX__", JSON.stringify(appConfig.cachePrefix))
    .replace(
      "__CACHE_NAME__",
      JSON.stringify(`${appConfig.cachePrefix}${version}`)
    )
    .replace("__PRECACHE_ASSETS__", JSON.stringify(assets))
  await writeFile(join(outputDirectory, "sw.js"), source)
  console.info(`Offline shell: ${assets.length} files, version ${version}`)
}

if (import.meta.main) await buildServiceWorker()
