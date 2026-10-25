const http = require("node:http")

const server = http.createServer((request, response) => {
  const pathname = new URL(request.url, "http://localhost").pathname
  // The simulation removes the /api route key before dispatching this contract.
  if (request.method !== "GET" || pathname !== "/auth/oauth2/userinfo") {
    response.writeHead(501)
    response.end()
    return
  }
  const token = request.headers.authorization
  if (token === "Bearer expired") {
    response.writeHead(401)
    response.end()
    return
  }
  if (token === "Bearer unavailable") {
    response.writeHead(500, { "Content-Type": "text/html" })
    response.end("<h1>Unavailable</h1>")
    return
  }
  response.writeHead(200, {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  })
  response.end(
    JSON.stringify({
      sub: "test-user",
      email: "player@example.com",
      email_verified: true,
      damaca_app_id: "pocha-score",
      damaca_access: token !== "Bearer revoked",
    })
  )
})
// biome-ignore lint/suspicious/noUndeclaredEnvVars: Postman assigns the mock runtime port outside Turbo tasks.
server.listen(process.env.PORT || 4500)
