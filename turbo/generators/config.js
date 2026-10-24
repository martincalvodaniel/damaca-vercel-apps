const { findNextPort, generateApplication, validateAnswers } = require("./lib")

const root = process.cwd()

function validateField(field) {
  return (value, answers) => {
    const result = validateAnswers(root, { ...answers, [field]: value })
    const fieldError = result.errors.find((error) => {
      if (field === "identifier") {
        return (
          error.includes("kebab-case") ||
          error.includes("destination") ||
          error.includes("workspace package")
        )
      }
      if (field === "name") return error.startsWith("Enter a name")
      if (field === "port")
        return (
          error.startsWith("Enter a port") || error.includes("already assigned")
        )
      return false
    })
    return fieldError ?? true
  }
}

module.exports = function configureGenerators(plop) {
  plop.setGenerator("app", {
    description: "Create a new app from one of the monorepo starters.",
    prompts: [
      {
        type: "list",
        name: "mode",
        message: "Choose an app mode",
        choices: [
          { name: "Google login and MongoDB", value: "mongo-google" },
          { name: "Installable PWA with local IndexedDB", value: "local-pwa" },
        ],
      },
      {
        type: "input",
        name: "identifier",
        message: "App identifier (kebab-case)",
        validate: validateField("identifier"),
      },
      {
        type: "input",
        name: "name",
        message: "Display name",
        validate: validateField("name"),
      },
      {
        type: "input",
        name: "port",
        message: "Development port",
        default: String(findNextPort(root)),
        validate: validateField("port"),
      },
    ],
    actions: [
      async (answers) => {
        const result = generateApplication(
          answers.turbo?.paths?.root ?? root,
          answers
        )
        console.info(`Created ${result.packageName} at ${result.destination}.`)
        console.info(`Install dependencies with: bun install`)
        console.info(`Run it with: bun run dev --filter=${result.packageName}`)
        console.info(
          `Build it with: bun run build --filter=${result.packageName}`
        )
        if (answers.mode === "mongo-google") {
          console.info(`Local URL: http://localhost:${result.port}`)
          console.info(
            `Configure the values in apps/${answers.identifier}/.env.example before running.`
          )
        }
        return `Created ${result.packageName}.`
      },
    ],
  })
}
