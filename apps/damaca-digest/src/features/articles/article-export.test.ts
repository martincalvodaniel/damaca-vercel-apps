import { expect, test as it } from "bun:test"
import { articleExport, articleMarkdown } from "./article-export"

it("renders captured text literally and excludes unsafe Markdown links", () => {
  const time = new Date("2026-11-15T11:20:00Z")
  const snapshot = articleExport(
    {
      id: "0123456789abcdef01234567",
      url: "https://example.com/article?chapter=2",
      canonicalUrl: "https://example.com/article?chapter=2",
      sourceDomain: "example.com",
      title: "# A literal title",
      summary: "<script>untrusted</script>",
      relatedLinks: [
        { title: "Unsafe link", url: "javascript:alert(1)", origin: "source" },
      ],
      capturedAt: time,
      updatedAt: time,
      accessStatus: "full",
      provenance: { method: "chatgpt", processedAt: time },
      readingStatus: "unread",
      favorite: false,
      revision: 3,
      topicIds: [],
    },
    ["Research"]
  )
  const markdown = articleMarkdown(snapshot)
  expect(markdown).toContain("# \\# A literal title")
  expect(markdown).toContain("\\<script\\>")
  expect(markdown).toContain("(<https://example.com/article?chapter=2>)")
  expect(markdown).not.toContain("javascript:")
  expect(snapshot).not.toHaveProperty("revision")
})
