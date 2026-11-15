import { expect, test as it } from "bun:test"
import { renderToStaticMarkup } from "react-dom/server"
import { GuideText } from "./guide-text"

it("renders Markdown, preserves simple line breaks and links bare addresses", () => {
  const html = renderToStaticMarkup(
    <GuideText
      text={
        "**Bold** and *italic*\nNext line\n\n[Directions](https://example.org/map) and https://example.org/."
      }
    />
  )
  expect(html).toContain("<strong>Bold</strong>")
  expect(html).toContain("<em>italic</em>")
  expect(html).toContain("<br/>")
  expect(html).toContain(
    'href="https://example.org/map" target="_blank" rel="noopener noreferrer"'
  )
  expect(html).toContain('href="https://example.org/"')
})

it("keeps unsafe links and embedded media from rendering", () => {
  const html = renderToStaticMarkup(
    <GuideText
      text={
        '[Unsafe](javascript:alert(1)) [Relative](/path) ![Photo](https://example.org/photo.png) <img src="https://example.org/other.png">'
      }
    />
  )
  expect(html).toContain("Unsafe")
  expect(html).toContain("Relative")
  expect(html).toContain("Photo")
  expect(html).not.toContain("href=")
  expect(html).not.toContain("<img")
})
