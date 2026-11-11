import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import type { CaptureInput } from "./captures"

type ChatCapture = Extract<CaptureInput, { source: "chatgpt" }>

const title = z.string().trim().min(1).max(200)
export const webUrl = z
  .string()
  .trim()
  .max(4096)
  .refine((input) => {
    const url = URL.parse(input)
    return (
      !!url &&
      !url.username &&
      !url.password &&
      (url.protocol === "https:" || url.protocol === "http:")
    )
  }, "Use an HTTP or HTTPS URL without credentials")
  .transform((input) => new URL(input).href)

export function createCaptureServer(
  save: (entry: ChatCapture) => Promise<string>
) {
  const server = new McpServer(
    { name: "Damaca", version: "1.0.0" },
    {
      instructions:
        "Save content only when requested by the user. If several links could match the request, ask which URL to save.",
    }
  )

  const annotations = {
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: false,
  }
  const meta = {
    securitySchemes: [{ type: "oauth2", scopes: ["captures:write"] }],
  }

  async function store(entry: ChatCapture) {
    try {
      const id = await save(entry)
      return {
        content: [{ type: "text" as const, text: JSON.stringify({ id }) }],
      }
    } catch {
      return {
        isError: true,
        content: [
          { type: "text" as const, text: "Damaca could not save the entry." },
        ],
      }
    }
  }

  server.registerTool(
    "save_conversation_summary",
    {
      description:
        "Save a summary of the current conversation when the user asks to export or save it to Damaca. Summarize the available context and send the summary rather than a transcript.",
      inputSchema: { title, summary: z.string().trim().min(1).max(20_000) },
      annotations,
      _meta: meta,
    },
    ({ title, summary }) =>
      store({ source: "chatgpt", kind: "summary", title, text: summary })
  )

  server.registerTool(
    "save_link",
    {
      description:
        "Save an HTTP or HTTPS link when the user asks to bookmark it in Damaca. If there are several candidates, ask the user to identify the link first.",
      inputSchema: { url: webUrl, title: title.optional() },
      annotations,
      _meta: meta,
    },
    ({ url, title }) => store({ source: "chatgpt", kind: "link", url, title })
  )

  return server
}
