import { mkdir, readFile, writeFile } from "node:fs/promises"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import sharp from "sharp"

const rootDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const applications = [
  { name: "pocha-score", background: "#047857" },
  { name: "card-wars", background: "#213f36" },
  { name: "damaca-hub", background: "#18181b" },
  { name: "billing-poc", background: "#2563eb" },
  { name: "dalis-home-management", background: "#1d4f40" },
  {
    name: "dalis-tasks-events",
    background: "#047857",
    source: "public/dalis-icon.svg",
  },
] as const

async function createFavicon(source: Buffer): Promise<Buffer> {
  const sizes = [16, 32, 48]
  const frames = await Promise.all(
    sizes.map((size) => sharp(source).resize(size, size).png().toBuffer())
  )
  const directory = Buffer.alloc(6 + sizes.length * 16)
  directory.writeUInt16LE(1, 2)
  directory.writeUInt16LE(sizes.length, 4)
  let offset = directory.length
  for (const [index, size] of sizes.entries()) {
    const frame = frames[index]
    if (!frame) throw new Error("Missing favicon frame")
    const entry = 6 + index * 16
    directory[entry] = size
    directory[entry + 1] = size
    directory.writeUInt16LE(1, entry + 4)
    directory.writeUInt16LE(32, entry + 6)
    directory.writeUInt32LE(frame.length, entry + 8)
    directory.writeUInt32LE(offset, entry + 12)
    offset += frame.length
  }
  return Buffer.concat([directory, ...frames])
}

async function createSafeIcon(
  source: Buffer,
  size: number,
  background: string
): Promise<Buffer> {
  const artworkSize = Math.floor(size * 0.8)
  const artwork = await sharp(source)
    .resize(artworkSize, artworkSize)
    .png()
    .toBuffer()
  return sharp({
    create: { width: size, height: size, channels: 4, background },
  })
    .composite([{ input: artwork, gravity: "centre" }])
    .png()
    .toBuffer()
}

export async function generateApplicationIcons(
  names: readonly string[] = applications.map((app) => app.name)
): Promise<void> {
  for (const name of names) {
    const app = applications.find((entry) => entry.name === name)
    if (!app) throw new Error(`Unknown application: ${name}`)
    const directory = resolve(rootDirectory, "apps", app.name)
    const source = await readFile(
      resolve(directory, "source" in app ? app.source : "src/app/icon.svg")
    )
    const isTasks = app.name === "dalis-tasks-events"
    if (isTasks) {
      await writeFile(resolve(directory, "public/favicon.svg"), source)
    }
    const publicDirectory = resolve(
      directory,
      isTasks ? "public" : "public/icons"
    )
    await mkdir(publicDirectory, { recursive: true })
    await writeFile(
      resolve(directory, "src/app/favicon.ico"),
      await createFavicon(source)
    )
    for (const size of [192, 512]) {
      await sharp(source)
        .resize(size, size)
        .png()
        .toFile(resolve(publicDirectory, `icon-${size}.png`))
    }
    await writeFile(
      resolve(publicDirectory, "maskable-512.png"),
      await createSafeIcon(source, 512, app.background)
    )
    const appleIcon = await createSafeIcon(source, 180, app.background)
    const hasManifest =
      isTasks || app.name === "pocha-score" || app.name === "card-wars"
    await writeFile(
      resolve(
        directory,
        hasManifest
          ? `${isTasks ? "public" : "public/icons"}/apple-touch-icon.png`
          : "src/app/apple-icon.png"
      ),
      appleIcon
    )
    console.info(
      `Generated favicon, install icons, maskable icon and Apple icon for ${app.name}`
    )
  }
}

if (import.meta.main) {
  const names = process.argv.slice(2)
  await generateApplicationIcons(names.length > 0 ? names : undefined)
}
