import { randomBytes } from "node:crypto"
import {
  createPayment,
  getSandboxConfig,
  sandboxUrl,
  signatureVersion,
} from "@/lib/redsys"

export function POST(request: Request) {
  const config = getSandboxConfig()
  if (!config) return new Response(null, { status: 404 })

  const origin = new URL(request.url).origin
  if (request.headers.get("origin") !== origin) {
    return new Response(null, { status: 403 })
  }

  const returnUrl = new URL("/pruebas/pago/retorno/", origin).href
  const { order, parameters, signature } = createPayment(config, returnUrl)
  console.info("Redsys sandbox payment started", { order })

  const nonce = randomBytes(16).toString("base64")
  return new Response(
    `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Ir a Redsys</title>
</head>
<body>
  <form method="post" action="${sandboxUrl}">
    <input type="hidden" name="Ds_SignatureVersion" value="${signatureVersion}">
    <input type="hidden" name="Ds_MerchantParameters" value="${parameters}">
    <input type="hidden" name="Ds_Signature" value="${signature}">
    <button type="submit">Continuar a Redsys</button>
  </form>
  <script nonce="${nonce}">document.forms[0].submit()</script>
</body>
</html>`,
    {
      headers: {
        "Cache-Control": "no-store",
        "Content-Security-Policy": `default-src 'none'; form-action ${new URL(sandboxUrl).origin}; script-src 'nonce-${nonce}'; base-uri 'none'; frame-ancestors 'none'`,
        "Content-Type": "text/html; charset=utf-8",
      },
    }
  )
}
