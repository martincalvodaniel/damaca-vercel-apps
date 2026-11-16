import {
  createLibraryExport,
  exportHeaders,
} from "@/features/articles/library-export"
import { getAuthorizedSession } from "@/lib/auth/session"

export async function GET(request: Request) {
  const session = await getAuthorizedSession()
  if (!session) return new Response(null, { status: 401 })

  const format = new URL(request.url).searchParams.get("format")
  if (format !== "json" && format !== "md")
    return new Response(null, { status: 400 })

  const download = await createLibraryExport(session.user.id, format)
  return new Response(download, {
    headers: exportHeaders(format, "damaca-digest-library"),
  })
}
