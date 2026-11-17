import "server-only"

import { Resolver } from "node:dns/promises"
import {
  request as http,
  type IncomingMessage,
  type RequestOptions,
} from "node:http"
import { request as https } from "node:https"
import type { Readable } from "node:stream"
import { createBrotliDecompress, createGunzip, createInflate } from "node:zlib"
import ipaddr from "ipaddr.js"
import { normalizeArticleUrl } from "@/features/articles/normalize-url"
import type { FetchAttempt } from "@/schemas/article-fetch"

export class RecoveryError extends Error {
  constructor(
    readonly reason: NonNullable<FetchAttempt["reason"]>,
    readonly status?: number
  ) {
    super(reason)
  }
}

export function publicAddress(address: string) {
  if (!ipaddr.isValid(address)) return false
  const ip = ipaddr.process(address)
  if (ip.kind() === "ipv6") {
    return ip.range() === "unicast" && (ip.toByteArray()[0] & 0xe0) === 0x20
  }
  const [a, b] = ip.toByteArray()
  return (
    ip.range() === "unicast" &&
    a > 0 &&
    a < 224 &&
    !(a === 192 && b === 0 && ip.toByteArray()[2] === 0)
  )
}

export function recoveryUrl(input: string) {
  const url = URL.parse(input)
  let path: string
  try {
    path = decodeURIComponent(url?.pathname ?? "").replaceAll("\\", "/")
  } catch {
    throw new RecoveryError("policy")
  }
  if (
    !url ||
    !["https:", "http:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.port ||
    !url.hostname.includes(".") ||
    url.hostname.endsWith(".") ||
    /(?:^|\.)(?:localhost|local|internal|test|invalid|example|onion)$/.test(
      url.hostname
    ) ||
    [...url.searchParams.keys()].some((key) =>
      /token|secret|signature|api[-_]?key|credential|^x-amz-|^x-goog-|^auth$|^sig$|^expires$/i.test(
        key
      )
    ) ||
    /(?:^|\/)(?:private|preview|draft|login|signin|admin|account)(?:\/|$)/i.test(
      path
    )
  )
    throw new RecoveryError("policy")
  if (ipaddr.isValid(url.hostname) && !publicAddress(url.hostname))
    throw new RecoveryError("policy")
  url.hash = ""
  return url
}

export function providerUrl(input: string, hosts: ReadonlySet<string>) {
  const original = URL.parse(input)
  const url = recoveryUrl(normalizeArticleUrl(input))
  if (
    url.protocol !== "https:" ||
    !hosts.has(url.hostname) ||
    url.search ||
    original?.hash
  ) {
    throw new RecoveryError("policy")
  }
  return url
}

export function selectPublicAddress(addresses: string[]) {
  if (!addresses.length) throw new RecoveryError("network")
  if (addresses.some((address) => !publicAddress(address)))
    throw new RecoveryError("policy")
  return addresses[0]
}

export async function resolvePublic(host: string, signal: AbortSignal) {
  signal.throwIfAborted()
  if (ipaddr.isValid(host)) return selectPublicAddress([host])
  const resolver = new Resolver()
  const cancel = () => resolver.cancel()
  signal.addEventListener("abort", cancel, { once: true })
  try {
    const queries = await Promise.allSettled([
      resolver.resolve4(host),
      resolver.resolve6(host),
    ])
    signal.throwIfAborted()
    for (const answer of queries) {
      if (
        answer.status === "rejected" &&
        !["ENODATA", "ENOTFOUND"].includes(answer.reason?.code)
      ) {
        throw new RecoveryError("network")
      }
    }
    return selectPublicAddress(
      queries.flatMap((answer) =>
        answer.status === "fulfilled" ? answer.value : []
      )
    )
  } finally {
    signal.removeEventListener("abort", cancel)
  }
}

export async function readBounded(
  body: AsyncIterable<Uint8Array>,
  max: number
) {
  let bytes = 0
  const chunks: Uint8Array[] = []
  for await (const chunk of body) {
    bytes += chunk.byteLength
    if (bytes > max) throw new RecoveryError("too_large")
    chunks.push(chunk)
  }
  return Buffer.concat(chunks)
}

export function decode(stream: Readable, encoding?: string) {
  switch (encoding?.trim().toLowerCase()) {
    case undefined:
    case "identity":
      return stream
    case "gzip":
      return stream.pipe(createGunzip())
    case "deflate":
      return stream.pipe(createInflate())
    case "br":
      return stream.pipe(createBrotliDecompress())
    default:
      throw new RecoveryError("unsupported")
  }
}

function openSource(url: URL, options: RequestOptions) {
  const request = url.protocol === "https:" ? https : http
  return new Promise<IncomingMessage>((resolve, reject) => {
    const outgoing = request(url, options, resolve)
    outgoing.on("error", reject)
    outgoing.end()
  })
}

export async function directRequest(
  input: string,
  signal: AbortSignal,
  resolveHost = resolvePublic,
  open = openSource,
  redirects = 0
): Promise<{ url: string; html: string; status: number }> {
  const url = recoveryUrl(input)
  const ip = selectPublicAddress([await resolveHost(url.hostname, signal)])
  const family = ipaddr.parse(ip).kind() === "ipv4" ? 4 : 6
  const response = await open(url, {
    signal,
    agent: false,
    family,
    lookup: (_host, _options, callback) => callback(null, ip, family),
    headers: {
      accept: "text/html, application/xhtml+xml",
      "accept-encoding": "identity",
    },
  })
  const status = response.statusCode ?? 502
  let decoded: Readable | undefined
  const destroyBody = () => {
    decoded?.destroy()
    response.destroy()
  }
  signal.addEventListener("abort", destroyBody, { once: true })
  try {
    signal.throwIfAborted()
    if (
      [301, 302, 303, 307, 308].includes(status) &&
      response.headers.location
    ) {
      if (redirects >= 3) throw new RecoveryError("http_error", status)
      const next = URL.parse(response.headers.location, url)
      if (!next || (url.protocol === "https:" && next.protocol !== "https:"))
        throw new RecoveryError("policy")
      response.destroy()
      return await directRequest(
        next.href,
        signal,
        resolveHost,
        open,
        redirects + 1
      )
    }
    if ([401, 403, 451].includes(status))
      throw new RecoveryError("blocked", status)
    if (status < 200 || status >= 300)
      throw new RecoveryError(
        status === 429 ? "rate_limited" : "http_error",
        status
      )
    if (
      !/^(text\/html|application\/xhtml\+xml)(?:\s*;|$)/i.test(
        response.headers["content-type"] ?? ""
      )
    )
      throw new RecoveryError("unsupported", status)
    decoded = decode(response, response.headers["content-encoding"])
    if (decoded !== response)
      response.on("error", (error) => decoded?.destroy(error))
    const html = (await readBounded(decoded, 5 * 1024 * 1024)).toString("utf8")
    signal.throwIfAborted()
    return { url: url.href, html, status }
  } finally {
    signal.removeEventListener("abort", destroyBody)
    destroyBody()
  }
}
