// Keep the former endpoint inert for stale schedules and manual requests.
export function GET(_request: Request): Response {
  return Response.json(
    { error: "Database refresh is suspended" },
    { status: 410, headers: { "Cache-Control": "no-store" } }
  )
}
