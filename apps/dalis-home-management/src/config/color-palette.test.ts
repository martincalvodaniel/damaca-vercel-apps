import { describe, expect, it } from "bun:test"
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"

const stylesheet = readFileSync(
  new URL("../app/globals.css", import.meta.url),
  "utf8"
)
const themes = [...stylesheet.matchAll(/:root\s*\{([\s\S]*?)\}/g)].map(
  ([, declarations]) =>
    Object.fromEntries(
      [...declarations.matchAll(/--([\w-]+):\s*(#[\da-f]{6});/gi)].map(
        ([, name, value]) => [name, value]
      )
    )
)

function luminance(hex: string) {
  const channels = [1, 3, 5].map((index) => {
    const value = Number.parseInt(hex.slice(index, index + 2), 16) / 255
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  })
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722
}

function contrast(foreground: string, background: string) {
  const values = [luminance(foreground), luminance(background)].sort(
    (left, right) => left - right
  )
  return (values[1] + 0.05) / (values[0] + 0.05)
}

const textPairs = [
  ...[
    "canvas",
    "surface",
    "surface-raised",
    "field",
    "primary-soft",
    "accent-soft",
    "success-soft",
    "danger-soft",
    "warning-soft",
  ].map((surface) => ["ink", surface]),
  ...["canvas", "surface", "surface-raised", "field", "primary-soft"].map(
    (surface) => ["muted", surface]
  ),
  ["placeholder", "field"],
  ["primary", "primary-soft"],
  ["accent", "accent-soft"],
  ["success", "success-soft"],
  ["danger", "danger-soft"],
  ["warning", "warning-soft"],
  ["on-primary", "primary"],
  ["on-primary", "primary-hover"],
  ["on-success", "success"],
  ["on-danger", "danger"],
  ["on-warning", "warning"],
]

describe("semantic color palette", () => {
  it("keeps application color literals in the shared palette", () => {
    const sourceRoot = fileURLToPath(new URL("../", import.meta.url))
    const files = new Bun.Glob("**/*.tsx").scanSync({ cwd: sourceRoot })
    const externalBrandColors = new Set([
      "#4285f4",
      "#34a853",
      "#fbbc05",
      "#ea4335",
    ])
    for (const path of files) {
      const source = readFileSync(`${sourceRoot}/${path}`, "utf8")
      const colors = [...source.matchAll(/#[\da-f]{6}/gi)].map(([color]) =>
        color.toLowerCase()
      )
      const permitted = path.endsWith("sign-in-card.tsx")
        ? externalBrandColors
        : new Set<string>()
      expect(colors.filter((color) => !permitted.has(color))).toEqual([])
    }
  })

  it("defines both light and dark themes", () => {
    expect(themes).toHaveLength(2)
  })

  for (const [index, theme] of themes.entries()) {
    const name = index === 0 ? "light" : "dark"
    for (const [foreground, background] of textPairs) {
      it(`${name}: ${foreground} on ${background} meets normal-text contrast`, () => {
        expect(theme[foreground]).toBeDefined()
        expect(theme[background]).toBeDefined()
        expect(
          contrast(theme[foreground], theme[background])
        ).toBeGreaterThanOrEqual(4.5)
      })
    }
    for (const background of ["field", "canvas", "surface"]) {
      it(`${name}: field boundaries on ${background} remain identifiable`, () => {
        expect(
          contrast(theme["control-border"], theme[background])
        ).toBeGreaterThanOrEqual(3)
      })
    }
  }
})
