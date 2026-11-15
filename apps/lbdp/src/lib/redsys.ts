import {
  createCipheriv,
  createHmac,
  randomInt,
  timingSafeEqual,
} from "node:crypto"

export const sandboxUrl = "https://sis-t.redsys.es:25443/sis/realizarPago"
export const signatureVersion = "HMAC_SHA512_V2"

const amount = "100"
const currency = "978"
const transactionType = "0"
const orderPattern = /^\d{4}[A-Z0-9]{8}$/

export function getSandboxConfig() {
  if (
    process.env.NODE_ENV !== "development" ||
    process.env.VERCEL_ENV === "production" ||
    process.env.LBDP_REDSYS_SANDBOX !== "1"
  ) {
    return null
  }

  const merchantCode = process.env.LBDP_REDSYS_MERCHANT_CODE ?? ""
  const terminal = process.env.LBDP_REDSYS_TERMINAL ?? ""
  const key = process.env.LBDP_REDSYS_SIGNING_KEY ?? ""
  const callback = URL.parse(process.env.LBDP_REDSYS_CALLBACK_URL ?? "")
  if (
    !/^\d{9}$/.test(merchantCode) ||
    !/^\d{1,3}$/.test(terminal) ||
    !/^[!-~]+$/.test(key) ||
    callback?.protocol !== "https:" ||
    callback.pathname !== "/api/redsys/notification/" ||
    callback.search ||
    callback.hash ||
    callback.username ||
    callback.password
  ) {
    return null
  }

  return { merchantCode, terminal, key, callback: callback.href }
}

type SandboxConfig = NonNullable<ReturnType<typeof getSandboxConfig>>

export function signParameters(parameters: string, order: string, key: string) {
  const aesKey = key.slice(0, 16).padEnd(16, "0")
  const cipher = createCipheriv("aes-128-cbc", aesKey, Buffer.alloc(16))
  const orderKey = Buffer.concat([cipher.update(order, "utf8"), cipher.final()])
  return createHmac("sha512", orderKey.toString("base64"))
    .update(parameters)
    .digest("base64url")
}

export function createPayment(config: SandboxConfig, returnUrl: string) {
  const prefix = randomInt(10_000).toString().padStart(4, "0")
  const suffix = randomInt(36 ** 8)
    .toString(36)
    .padStart(8, "0")
    .toUpperCase()
  const order = prefix + suffix
  const parameters = Buffer.from(
    JSON.stringify({
      DS_MERCHANT_AMOUNT: amount,
      DS_MERCHANT_CURRENCY: currency,
      DS_MERCHANT_TRANSACTIONTYPE: transactionType,
      DS_MERCHANT_ORDER: order,
      DS_MERCHANT_MERCHANTCODE: config.merchantCode,
      DS_MERCHANT_TERMINAL: config.terminal,
      DS_MERCHANT_PRODUCTDESCRIPTION: "Producto de prueba",
      DS_MERCHANT_MERCHANTURL: config.callback,
      DS_MERCHANT_URLOK: returnUrl,
      DS_MERCHANT_URLKO: returnUrl,
    })
  ).toString("base64url")

  return {
    order,
    parameters,
    signature: signParameters(parameters, order, config.key),
  }
}

export function verifyNotification(
  form: URLSearchParams,
  config: SandboxConfig
) {
  const [version] = form.getAll("Ds_SignatureVersion")
  const [parameters] = form.getAll("Ds_MerchantParameters")
  const [signature] = form.getAll("Ds_Signature")
  if (
    form.size !== 3 ||
    version !== signatureVersion ||
    !parameters ||
    !/^[A-Za-z0-9+/_-]+={0,2}$/.test(parameters) ||
    !signature ||
    !/^[A-Za-z0-9_-]{86}(?:==)?$/.test(signature)
  ) {
    return null
  }

  try {
    const payload: unknown = JSON.parse(
      Buffer.from(parameters, "base64").toString("utf8")
    )
    if (typeof payload !== "object" || !payload || !("Ds_Order" in payload)) {
      return null
    }

    const order = payload.Ds_Order
    if (typeof order !== "string" || !orderPattern.test(order)) return null

    const expected = Buffer.from(
      signParameters(parameters, order, config.key),
      "base64url"
    )
    const received = Buffer.from(signature, "base64url")
    if (!timingSafeEqual(expected, received)) return null

    const fields = payload as Record<string, unknown>
    const response = fields.Ds_Response
    const terminal = fields.Ds_Terminal
    if (
      fields.Ds_MerchantCode !== config.merchantCode ||
      typeof terminal !== "string" ||
      !/^\d{1,3}$/.test(terminal) ||
      Number(terminal) !== Number(config.terminal) ||
      typeof fields.Ds_Amount !== "string" ||
      !/^0*100$/.test(fields.Ds_Amount) ||
      fields.Ds_Currency !== currency ||
      fields.Ds_TransactionType !== transactionType ||
      typeof response !== "string" ||
      !/^\d{4}$/.test(response)
    ) {
      return null
    }

    return { order, response, authorized: Number(response) < 100 }
  } catch {
    return null
  }
}
