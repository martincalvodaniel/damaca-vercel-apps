import { expect, it, mock } from "bun:test"
import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js"
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js"
import { createCaptureServer } from "./capture-tools"
import type { CaptureInput } from "./captures"

it("discovers both write tools over HTTP and only persists valid input", async () => {
  const save = mock(async (_entry: CaptureInput) => "capture-1")
  const client = new Client({ name: "test", version: "1.0.0" })
  await client.connect(
    new StreamableHTTPClientTransport(
      new URL("https://example.com/api/integrations/mcp"),
      {
        fetch: async (input, init) => {
          const request = new Request(input, init)
          if (request.method !== "POST")
            return new Response(null, { status: 405 })
          const server = createCaptureServer(save)
          const transport = new WebStandardStreamableHTTPServerTransport({
            enableJsonResponse: true,
          })
          await server.connect(transport)
          try {
            return await transport.handleRequest(request)
          } finally {
            await server.close()
          }
        },
      }
    )
  )

  try {
    const { tools } = await client.listTools()
    expect(tools.map((tool) => tool.name)).toEqual([
      "save_conversation_summary",
      "save_link",
    ])
    expect(
      tools.every((tool) => tool.annotations?.readOnlyHint === false)
    ).toBe(true)
    const invalid = await client.callTool({
      name: "save_link",
      arguments: { url: "javascript:alert(1)" },
    })
    expect(invalid.isError).toBe(true)
    expect(save).not.toHaveBeenCalled()

    const link = await client.callTool({
      name: "save_link",
      arguments: { url: "https://example.com", title: "Example" },
    })
    expect(link.content).toEqual([{ type: "text", text: '{"id":"capture-1"}' }])
    expect(save).toHaveBeenCalledWith({
      source: "chatgpt",
      kind: "link",
      title: "Example",
      url: "https://example.com/",
    })

    const summary = await client.callTool({
      name: "save_conversation_summary",
      arguments: { title: "Test", summary: "A saved summary." },
    })
    expect(summary.isError).toBeUndefined()
    expect(save).toHaveBeenCalledWith({
      source: "chatgpt",
      kind: "summary",
      title: "Test",
      text: "A saved summary.",
    })
  } finally {
    await client.close()
  }
})
