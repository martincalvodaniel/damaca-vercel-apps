import { describe, expect, test as it } from "bun:test"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import Providers from "@/components/shared/Providers"
import UserSettingsLink from "@/components/shared/UserSettingsLink"
import type { ThemeId } from "@/lib/domain/entities/user-preferences"
import ThemeSettings from "./ThemeSettings"
import { UserThemeProvider } from "./UserThemeProvider"

describe("user theme rendering", () => {
  it.each(["original", "olive"] as ThemeId[])(
    "renders the persisted %s palette and selected option in the initial HTML",
    (theme) => {
      const html = renderToStaticMarkup(
        createElement(
          Providers,
          null,
          createElement(
            UserThemeProvider,
            {
              userKey: `${theme}@example.com`,
              initialPreferences: { theme },
            },
            createElement(ThemeSettings)
          )
        )
      )
      expect(html).toContain(`data-palette="${theme}"`)
      expect(html).toContain(`value="${theme}" selected=""`)
      expect(html).toContain("Configuración de usuario")
      expect(html).toContain("Original")
      expect(html).toContain("Oliva y terracota")
      expect(html).toContain("aria-describedby=")
    }
  )

  it("links the user's visible name and email to settings", () => {
    const html = renderToStaticMarkup(
      createElement(UserSettingsLink, {
        user: { name: "Alice", email: "alice@example.com" },
        active: true,
      })
    )
    expect(html).toContain('href="/settings"')
    expect(html).toContain('aria-current="page"')
    expect(html).toContain("Configuración de usuario: Alice")
    expect(html).toContain("Alice")
    expect(html).toContain("alice@example.com")
  })
})
