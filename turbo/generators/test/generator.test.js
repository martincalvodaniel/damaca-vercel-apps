const { afterAll, beforeAll, describe, expect, test } = require("bun:test")
const fs = require("node:fs")
const os = require("node:os")
const path = require("node:path")
const { findNextPort, generateApplication, validateAnswers } = require("../lib")

const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "damaca-generator-"))

function readTextFiles(directory) {
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const entryPath = path.join(directory, entry.name)
      if (entry.isDirectory()) return readTextFiles(entryPath)
      if (!entry.isFile()) return []
      const content = fs.readFileSync(entryPath)
      return content.includes(0) ? [] : [content.toString("utf8")]
    })
    .join("\n")
}

beforeAll(() => {
  fs.mkdirSync(path.join(fixtureRoot, "apps"), { recursive: true })
  fs.mkdirSync(path.join(fixtureRoot, "turbo", "generators", "templates"), {
    recursive: true,
  })
  for (const mode of ["mongo-google", "local-pwa"]) {
    fs.cpSync(
      path.join(__dirname, "..", "templates", mode),
      path.join(fixtureRoot, "turbo", "generators", "templates", mode),
      { recursive: true }
    )
  }
  fs.mkdirSync(path.join(fixtureRoot, "plan"), { recursive: true })
  fs.writeFileSync(path.join(fixtureRoot, "plan", "workflow.md"), "workflow")
  fs.writeFileSync(
    path.join(
      fixtureRoot,
      "turbo/generators/templates/local-pwa",
      ".env.local"
    ),
    "LOCAL_SECRET=do-not-copy"
  )
  fs.mkdirSync(
    path.join(fixtureRoot, "turbo/generators/templates/local-pwa", ".vercel"),
    { recursive: true }
  )
  fs.writeFileSync(
    path.join(
      fixtureRoot,
      "turbo/generators/templates/local-pwa",
      ".vercel",
      "project.json"
    ),
    "{}"
  )
  fs.mkdirSync(path.join(fixtureRoot, "apps", "occupied"))
  fs.writeFileSync(
    path.join(fixtureRoot, "apps", "occupied", "package.json"),
    JSON.stringify({
      name: "@damaca/occupied",
      scripts: { dev: "next dev --port 3000" },
    })
  )
})

afterAll(() => {
  fs.rmSync(fixtureRoot, { recursive: true, force: true })
})

describe("app generator", () => {
  test("suggests the first unassigned development port", () => {
    expect(findNextPort(fixtureRoot)).toBe(3001)
  })

  test("rejects invalid identifiers, duplicate packages, ports, and destinations", () => {
    const base = { mode: "local-pwa", name: "Personal Notes", port: 3001 }
    expect(
      validateAnswers(fixtureRoot, { ...base, identifier: "Bad_Name" }).errors
    ).toContain(
      "Use a lowercase kebab-case app identifier, such as personal-notes."
    )
    expect(
      validateAnswers(fixtureRoot, {
        ...base,
        mode: "remote-db",
        identifier: "personal-notes",
      }).errors
    ).toContain("Choose mongo-google or local-pwa.")
    expect(
      validateAnswers(fixtureRoot, { ...base, identifier: "occupied" }).errors
    ).toContain("The workspace package @damaca/occupied already exists.")
    expect(
      validateAnswers(fixtureRoot, {
        ...base,
        identifier: "personal-notes",
        port: 3000,
      }).errors
    ).toContain("Development port 3000 is already assigned in apps/*.")
    expect(
      validateAnswers(fixtureRoot, {
        ...base,
        identifier: "personal-notes",
        name: "<Invalid>",
      }).errors
    ).toContain(
      "Enter a name of 1 to 80 printable characters without angle brackets."
    )
    expect(
      validateAnswers(fixtureRoot, {
        ...base,
        identifier: "personal-notes",
        port: 65536,
      }).errors
    ).toContain("Enter a port number from 1 to 65535.")
    fs.mkdirSync(path.join(fixtureRoot, "apps", "existing"))
    expect(
      validateAnswers(fixtureRoot, {
        ...base,
        identifier: "existing",
      }).errors
    ).toContain("The destination apps/existing already exists.")
  })

  test("generates the MongoDB starter with app identity, auth URL, and planning", () => {
    const result = generateApplication(fixtureRoot, {
      mode: "mongo-google",
      identifier: "family-ledger",
      name: "Family Ledger",
      port: "3002",
    })
    const appRoot = result.destination
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(appRoot, "package.json"), "utf8")
    )
    const environment = fs.readFileSync(
      path.join(appRoot, ".env.example"),
      "utf8"
    )
    const instructions = fs.readFileSync(
      path.join(appRoot, "AGENTS.md"),
      "utf8"
    )

    expect(packageJson.name).toBe("@damaca/family-ledger")
    expect(packageJson.scripts.dev).toContain("--port 3002")
    expect(environment).toContain("BETTER_AUTH_URL=http://localhost:3002")
    expect(environment).toContain("MONGODB_DB=family-ledger")
    expect(instructions).toContain("plan/master.md")
    expect(fs.existsSync(path.join(appRoot, "plan/iterations.md"))).toBe(true)
    expect(fs.existsSync(path.resolve(appRoot, "../../plan/workflow.md"))).toBe(
      true
    )
    expect(
      fs.existsSync(path.resolve(appRoot, "plan/../../../plan/workflow.md"))
    ).toBe(true)
    expect(fs.existsSync(path.join(appRoot, "src/lib/auth/AGENTS.md"))).toBe(
      true
    )
    expect(readTextFiles(appRoot)).not.toContain("@@")
    expect(
      fs.readFileSync(path.join(appRoot, "src/app/layout.tsx"), "utf8")
    ).toContain('title: "Family Ledger"')
    expect(
      fs.readFileSync(path.join(appRoot, "src/app/layout.tsx"), "utf8")
    ).toContain(
      'description: "A private app with Google sign-in and MongoDB-backed access."'
    )
  })

  test("generates an installable local starter with isolated storage and cache names", () => {
    const result = generateApplication(fixtureRoot, {
      mode: "local-pwa",
      identifier: "personal-notes",
      name: "Personal Notes",
      port: "3003",
    })
    const appRoot = result.destination
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(appRoot, "package.json"), "utf8")
    )
    const appConfig = fs.readFileSync(
      path.join(appRoot, "src/config/app.ts"),
      "utf8"
    )
    const allText = readTextFiles(appRoot)

    expect(packageJson.name).toBe("@damaca/personal-notes")
    expect(packageJson.scripts.dev).toContain("--port 3003")
    expect(packageJson.scripts.start).toContain("--port 3003")
    expect(appConfig).toContain('storageName: "personal-notes"')
    expect(appConfig).toContain('cachePrefix: "personal-notes-shell-"')
    expect(fs.existsSync(path.join(appRoot, "src/app/manifest.ts"))).toBe(true)
    expect(fs.existsSync(path.join(appRoot, "scripts/service-worker.js"))).toBe(
      true
    )
    expect(fs.existsSync(path.join(appRoot, "src/lib/storage/AGENTS.md"))).toBe(
      true
    )
    expect(fs.existsSync(path.join(appRoot, "public/icons/icon-192.png"))).toBe(
      true
    )
    expect(fs.existsSync(path.join(appRoot, ".env.local"))).toBe(false)
    expect(fs.existsSync(path.join(appRoot, ".vercel"))).toBe(false)
    expect(allText).not.toContain("@@")
    expect(allText).not.toContain("local-app")
  })

  test("keeps display names literal and safely escaped in generated code", () => {
    const result = generateApplication(fixtureRoot, {
      mode: "local-pwa",
      identifier: "quoted-notes",
      name: 'Notes "@@MISSING@@"',
      port: "3008",
    })
    const config = fs.readFileSync(
      path.join(result.destination, "src/config/app.ts"),
      "utf8"
    )
    const readme = fs.readFileSync(
      path.join(result.destination, "README.md"),
      "utf8"
    )

    expect(config).toContain(`name: ${JSON.stringify('Notes "@@MISSING@@"')}`)
    expect(readme).toContain('# Notes "@@MISSING@@"')
  })

  test("preserves an existing destination without writing into it", () => {
    const destination = path.join(fixtureRoot, "apps", "do-not-overwrite")
    fs.mkdirSync(destination)
    fs.writeFileSync(path.join(destination, "keep.txt"), "keep")

    expect(() =>
      generateApplication(fixtureRoot, {
        mode: "local-pwa",
        identifier: "do-not-overwrite",
        name: "Existing App",
        port: 3004,
      })
    ).toThrow("The destination apps/do-not-overwrite already exists.")
    expect(fs.readFileSync(path.join(destination, "keep.txt"), "utf8")).toBe(
      "keep"
    )
  })
})
