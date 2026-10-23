import { spawnSync } from "node:child_process"
import { existsSync, readdirSync } from "node:fs"
import { resolve } from "node:path"

const root = resolve(import.meta.dir, "..")
const supportedExtensions = new Set([
  ".astro",
  ".css",
  ".graphql",
  ".gql",
  ".html",
  ".htm",
  ".js",
  ".jsx",
  ".json",
  ".jsonc",
  ".json5",
  ".md",
  ".mdx",
  ".svelte",
  ".ts",
  ".tsx",
  ".vue",
])

function gitOutput(args: string[]): string[] {
  const result = spawnSync("git", args, { cwd: root, encoding: "utf8" })
  if (result.status !== 0) {
    process.stderr.write(result.stderr)
    process.exit(result.status ?? 1)
  }
  return result.stdout.split("\0").filter(Boolean)
}

const argumentsFromCli = process.argv.slice(2)
const baseArgumentIndex = argumentsFromCli.indexOf("--base")
const configuredBase =
  baseArgumentIndex === -1 ? undefined : argumentsFromCli[baseArgumentIndex + 1]
if (baseArgumentIndex !== -1 && !configuredBase) {
  throw new Error("The --base option requires a Git revision.")
}
const biomeArguments =
  baseArgumentIndex === -1
    ? argumentsFromCli
    : argumentsFromCli.filter(
        (_, index) =>
          index !== baseArgumentIndex && index !== baseArgumentIndex + 1
      )
const base = configuredBase
  ? [configuredBase]
  : gitOutput(["rev-list", "--max-parents=0", "HEAD"]).map((ref) => ref.trim())
const baseRef = base[0]
if (!baseRef) throw new Error("Unable to find the import baseline commit.")

const committedAndTracked = gitOutput(["diff", "--name-only", "-z", baseRef])
const untracked = gitOutput([
  "ls-files",
  "--others",
  "--exclude-standard",
  "-z",
])
const changed = [...new Set([...committedAndTracked, ...untracked])].filter(
  (file) =>
    existsSync(resolve(root, file)) &&
    supportedExtensions.has(file.slice(file.lastIndexOf(".")))
)

if (changed.length === 0) {
  console.info("No changed files supported by Biome.")
  process.exit(0)
}

const biomeLink = resolve(root, "node_modules/.bin/biome")
const platform = `${process.platform}-${process.arch}`
const biomePackagePrefix = `@biomejs+cli-${platform}@`
const biomePackageDirectory = resolve(root, "node_modules/.bun")
const biomePackage = readdirSync(biomePackageDirectory).find((entry) =>
  entry.startsWith(biomePackagePrefix)
)
const biome = existsSync(biomeLink)
  ? biomeLink
  : biomePackage
    ? resolve(
        biomePackageDirectory,
        biomePackage,
        "node_modules/@biomejs",
        `cli-${platform}`,
        "biome"
      )
    : ""
if (!biome || !existsSync(biome)) {
  throw new Error("Biome is not installed for the current platform.")
}

const result = spawnSync(biome, biomeArguments.concat(changed), {
  cwd: root,
  stdio: "inherit",
})
process.exit(result.status ?? 1)
