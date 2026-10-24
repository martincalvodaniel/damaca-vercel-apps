import { resolve, sep } from "node:path"
import { parseArgs } from "node:util"
import { z } from "zod"

const { values } = parseArgs({
  args: Bun.argv.slice(2),
  options: { port: { type: "string", default: "@@APP_PORT@@" } },
})
const port = z.coerce.number().int().min(1).max(65535).parse(values.port)

const root = resolve("out")
const server = Bun.serve({
  hostname: "127.0.0.1",
  port,
  async fetch(request) {
    const url = new URL(request.url)
    let pathname: string
    try {
      pathname = decodeURIComponent(url.pathname)
    } catch {
      return new Response("Invalid path", { status: 400 })
    }
    const path = resolve(
      root,
      `.${pathname}`,
      pathname.endsWith("/") ? "index.html" : ""
    )
    if (!path.startsWith(`${root}${sep}`))
      return new Response("Not found", { status: 404 })
    const file = Bun.file(path)
    if (await file.exists())
      return new Response(file, { headers: { "Cache-Control": "no-cache" } })
    const index = Bun.file(resolve(path, "index.html"))
    if (!pathname.includes(".") && (await index.exists()))
      return Response.redirect(`${url.origin}${pathname}/${url.search}`, 308)
    return new Response(Bun.file(resolve(root, "404.html")), { status: 404 })
  },
})
console.info(`Static preview: ${server.url}`)
