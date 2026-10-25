import { writeFile } from "node:fs/promises"
import { join } from "node:path"
import { createAuthenticatedWorker } from "@damaca/identity/service-worker"
import { appConfig } from "../src/config/app"

export async function buildServiceWorker(outputDirectory = "public") {
  await writeFile(
    join(outputDirectory, "sw.js"),
    createAuthenticatedWorker(appConfig.cachePrefix)
  )
}

if (import.meta.main) await buildServiceWorker()
