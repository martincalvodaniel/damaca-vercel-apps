import { expect, test as it } from "bun:test"
import {
  createPayment,
  signatureVersion,
  signParameters,
  verifyNotification,
} from "../src/lib/redsys"

const config = {
  merchantCode: "999008881",
  terminal: "001",
  key: "test-signing-key",
  callback: "https://example.com/api/redsys/notification/",
}
const returnUrl = "http://localhost:3006/pruebas/pago/retorno/"
const order = "1234A1B2C3D4"
const notification = {
  Ds_Order: order,
  Ds_MerchantCode: config.merchantCode,
  Ds_Terminal: "1",
  Ds_Amount: "100",
  Ds_Currency: "978",
  Ds_TransactionType: "0",
  Ds_Response: "0000",
}

function signedNotification(fields) {
  const parameters = Buffer.from(JSON.stringify(fields)).toString("base64")
  return new URLSearchParams({
    Ds_SignatureVersion: signatureVersion,
    Ds_MerchantParameters: parameters,
    Ds_Signature: signParameters(parameters, order, config.key),
  })
}

it("matches the official Redsys signature vector", () => {
  const example = String.raw`{"DS_MERCHANT_AMOUNT":"999","DS_MERCHANT_ORDER":"1234567890","DS_MERCHANT_MERCHANTCODE":"999008881","DS_MERCHANT_CURRENCY":"978","DS_MERCHANT_TRANSACTIONTYPE":"0","DS_MERCHANT_TERMINAL":"1","DS_MERCHANT_MERCHANTURL":"http:\/\/www.prueba.com\/urlNotificacion.php","DS_MERCHANT_URLOK":"http:\/\/www.prueba.com\/urlOK.php","DS_MERCHANT_URLKO":"http:\/\/www.prueba.com\/urlKO.php"}`
  const parameters = Buffer.from(example).toString("base64url")
  const publicSandboxKey = "sq7HjrUOBfKmC576ILgskD5srU870gJ7"
  expect(signParameters(parameters, "1234567890", publicSandboxKey)).toBe(
    "Vjo02eSWq249IeZZp3R-ArFnGLhKY0OuzDDlx1BuVtZDC2yhczA7_11uZhsYzLZBCMFAz8u8uzGDX3AErHKmmw"
  )
})

it("signs a fixed EUR 1 authorization with a new reference", () => {
  const payment = createPayment(config, returnUrl)
  const parameters = JSON.parse(
    Buffer.from(payment.parameters, "base64url").toString("utf8")
  )
  expect(payment.order).toMatch(/^\d{4}[A-Z0-9]{8}$/)
  expect(createPayment(config, returnUrl).order).not.toBe(payment.order)
  expect(parameters).toMatchObject({
    DS_MERCHANT_AMOUNT: "100",
    DS_MERCHANT_CURRENCY: "978",
    DS_MERCHANT_ORDER: payment.order,
    DS_MERCHANT_TRANSACTIONTYPE: "0",
    DS_MERCHANT_URLOK: returnUrl,
    DS_MERCHANT_URLKO: returnUrl,
    DS_MERCHANT_MERCHANTURL: config.callback,
  })
})

it("reports signed authorization and denial and tolerates repeated delivery", () => {
  const approved = signedNotification(notification)
  const denied = signedNotification({ ...notification, Ds_Response: "0172" })
  expect(verifyNotification(approved, config)).toEqual({
    order,
    response: "0000",
    authorized: true,
  })
  expect(verifyNotification(approved, config)).toEqual(
    verifyNotification(approved, config)
  )
  expect(verifyNotification(denied, config)).toEqual({
    order,
    response: "0172",
    authorized: false,
  })
})

it("rejects a tampered signature and mismatched signed fields", () => {
  const form = signedNotification(notification)
  form.set("Ds_Signature", "A".repeat(86))
  expect(verifyNotification(form, config)).toBeNull()

  for (const overrides of [
    { Ds_Amount: "101" },
    { Ds_Currency: "840" },
    { Ds_MerchantCode: "999999999" },
    { Ds_Terminal: "002" },
    { Ds_Order: "1234A1B2C3D5" },
    { Ds_TransactionType: "3" },
  ]) {
    expect(
      verifyNotification(
        signedNotification({ ...notification, ...overrides }),
        config
      )
    ).toBeNull()
  }
})
