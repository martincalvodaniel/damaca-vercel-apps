import { getMcpUrls } from "@/lib/auth/mcp-config"

export function scopeRequired(scope: string) {
  const { metadata } = getMcpUrls()
  const message = "Authorize the required Digest permission to use this tool."
  return {
    isError: true as const,
    content: [{ type: "text" as const, text: message }],
    _meta: {
      "mcp/www_authenticate": [
        `Bearer resource_metadata="${metadata}", scope="${scope}", error="insufficient_scope", error_description="${message}"`,
      ],
    },
  }
}
