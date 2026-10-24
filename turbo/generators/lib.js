const fs = require("node:fs")
const path = require("node:path")

const MODES = new Set(["mongo-google", "local-pwa"])
const APP_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u
const EXCLUDED_DIRECTORIES = new Set([
  ".git",
  ".next",
  ".turbo",
  ".vercel",
  "build",
  "coverage",
  "node_modules",
  "out",
])

function getApplications(root) {
  const applicationsDirectory = path.join(root, "apps")
  if (!fs.existsSync(applicationsDirectory)) return []

  return fs
    .readdirSync(applicationsDirectory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .map((entry) => ({
      directory: path.join(applicationsDirectory, entry.name),
      identifier: entry.name,
    }))
}

function getAssignedDevelopmentPorts(root) {
  const ports = new Set()
  const portPattern = /--port(?:\s+|=)(\d+)/gu

  for (const application of getApplications(root)) {
    const packagePath = path.join(application.directory, "package.json")
    if (!fs.existsSync(packagePath)) continue

    const manifest = JSON.parse(fs.readFileSync(packagePath, "utf8"))
    const devScript = manifest.scripts?.dev ?? ""
    for (const match of devScript.matchAll(portPattern)) {
      ports.add(Number(match[1]))
    }
  }

  return ports
}

function findNextPort(root, start = 3000) {
  const assignedPorts = getAssignedDevelopmentPorts(root)
  let port = start
  while (assignedPorts.has(port) && port < 65535) port += 1
  return port
}

function validateAnswers(root, answers) {
  const errors = []
  const mode = answers.mode
  const identifier =
    typeof answers.identifier === "string" ? answers.identifier.trim() : ""
  const name = typeof answers.name === "string" ? answers.name.trim() : ""
  const port = Number(answers.port)
  const hasUnsafeNameCharacters = [...name].some((character) => {
    const codePoint = character.codePointAt(0)
    return codePoint < 32 || codePoint === 127
  })

  if (!MODES.has(mode)) errors.push("Choose mongo-google or local-pwa.")
  if (!APP_SLUG_PATTERN.test(identifier)) {
    errors.push(
      "Use a lowercase kebab-case app identifier, such as personal-notes."
    )
  }
  if (
    name.length === 0 ||
    name.length > 80 ||
    name.includes("<") ||
    name.includes(">") ||
    hasUnsafeNameCharacters
  ) {
    errors.push(
      "Enter a name of 1 to 80 printable characters without angle brackets."
    )
  }
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    errors.push("Enter a port number from 1 to 65535.")
  }

  const applicationsDirectory = path.join(root, "apps")
  const destination = path.join(applicationsDirectory, identifier)
  if (identifier && fs.existsSync(destination)) {
    errors.push(`The destination apps/${identifier} already exists.`)
  }

  const packageName = `@damaca/${identifier}`
  if (
    identifier &&
    getApplications(root).some((application) => {
      const packagePath = path.join(application.directory, "package.json")
      if (!fs.existsSync(packagePath)) return false
      return (
        JSON.parse(fs.readFileSync(packagePath, "utf8")).name === packageName
      )
    })
  ) {
    errors.push(`The workspace package ${packageName} already exists.`)
  }

  if (Number.isInteger(port) && getAssignedDevelopmentPorts(root).has(port)) {
    errors.push(`Development port ${port} is already assigned in apps/*.`)
  }

  return { errors, values: { identifier, mode, name, port } }
}

function copyTemplate(source, destination) {
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    if (EXCLUDED_DIRECTORIES.has(entry.name)) continue
    if (entry.name === "dalis-sw.js" || entry.name.endsWith(".tsbuildinfo"))
      continue
    if (entry.name === "next-env.d.ts") continue
    if (entry.name.startsWith(".env") && entry.name !== ".env.example") continue

    const sourcePath = path.join(source, entry.name)
    const destinationPath = path.join(destination, entry.name)
    if (entry.isDirectory()) {
      fs.mkdirSync(destinationPath, { recursive: true })
      copyTemplate(sourcePath, destinationPath)
    } else if (entry.isFile()) {
      fs.copyFileSync(sourcePath, destinationPath)
    }
  }
}

function renderTemplate(directory, values) {
  const replacements = {
    APP_PORT: String(values.port),
    APP_SLUG: values.identifier,
    PACKAGE_NAME: `@damaca/${values.identifier}`,
  }

  function render(currentDirectory) {
    for (const entry of fs.readdirSync(currentDirectory, {
      withFileTypes: true,
    })) {
      const filePath = path.join(currentDirectory, entry.name)
      if (entry.isDirectory()) {
        render(filePath)
        continue
      }
      if (!entry.isFile()) continue

      const source = fs.readFileSync(filePath)
      if (source.includes(0)) continue
      const content = source.toString("utf8")
      if (!Buffer.from(content, "utf8").equals(source)) continue
      const rendered = content
        .replace(/@@([A-Z_]+)@@/gu, (token, key) => {
          if (key === "APP_NAME") return token
          if (!(key in replacements))
            throw new Error(`Unknown template token ${token}.`)
          return replacements[key]
        })
        .replaceAll('"__APP_NAME_JSON__"', JSON.stringify(values.name))
        .replaceAll("@@APP_NAME@@", values.name)
      fs.writeFileSync(filePath, rendered)
    }
  }

  render(directory)
}

function generateApplication(root, answers) {
  const { errors, values } = validateAnswers(root, answers)
  if (errors.length > 0) throw new Error(errors.join("\n"))

  const applicationsDirectory = path.join(root, "apps")
  const templateDirectory = path.join(
    root,
    "turbo",
    "generators",
    "templates",
    values.mode
  )
  if (!fs.existsSync(templateDirectory)) {
    throw new Error(`The ${values.mode} app template was not found.`)
  }

  const destination = path.join(applicationsDirectory, values.identifier)
  fs.mkdirSync(destination)
  try {
    copyTemplate(templateDirectory, destination)
    renderTemplate(destination, values)
  } catch (error) {
    fs.rmSync(destination, { recursive: true, force: true })
    throw error
  }

  return {
    destination,
    packageName: `@damaca/${values.identifier}`,
    port: values.port,
  }
}

module.exports = {
  findNextPort,
  generateApplication,
  getAssignedDevelopmentPorts,
  validateAnswers,
}
