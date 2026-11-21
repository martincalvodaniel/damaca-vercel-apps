import { expect, test as it } from "bun:test"
import type { IncomingMessage } from "node:http"
import { Readable } from "node:stream"
import { gzipSync } from "node:zlib"
import {
  decode,
  directRequest,
  providerUrl,
  publicAddress,
  readBounded,
  recoveryUrl,
  selectPublicAddress,
} from "./network"
import { extractHtml, fetchCandidate } from "./providers"
import { classify, recoverArticle } from "./recover"

const url = "https://www.xda-developers.com/article"
const excerpt =
  "The city's new reading room opened on Tuesday, restoring public access to a collection of historic maps."
const config = {
  enabled: { direct: true, jina: true, firecrawl: true },
  hosts: new Set(["www.xda-developers.com"]),
  totalMs: 300,
  providerMs: { direct: 100, jina: 100, firecrawl: 100 },
  jinaKey: undefined,
  firecrawlKey: "test-fixture",
  firecrawlDailyLimit: 10,
}
const signal = new AbortController().signal

it("rejects private destinations, mixed DNS, signed queries and non-approved provider hosts", () => {
  for (const address of [
    "0.0.0.0",
    "10.0.0.1",
    "100.64.0.1",
    "169.254.169.254",
    "192.0.2.1",
    "224.0.0.1",
    "::1",
    "::ffff:127.0.0.1",
    "fe80::1",
    "2001:db8::1",
  ]) {
    expect(publicAddress(address)).toBe(false)
  }
  expect(publicAddress("2606:4700::1111")).toBe(true)
  expect(() => selectPublicAddress(["8.8.8.8", "::ffff:127.0.0.1"])).toThrow(
    "policy"
  )
  expect(selectPublicAddress(["8.8.8.8", "2606:4700::1111"])).toBe("8.8.8.8")
  for (const input of [
    "http://2852039166",
    "https://abc.local/path",
    "https://example.org/%70review/post",
    `${url}?signature=secret`,
    "https://user@example.org/path",
    "https://example.org:444/",
  ]) {
    expect(() => recoveryUrl(input)).toThrow("policy")
  }
  expect(providerUrl(`${url}?utm_source=fixture`, config.hosts).href).toBe(url)
  for (const input of [
    `${url}?page=2`,
    `${url}#section`,
    url.replace("www.", "sibling."),
  ]) {
    expect(() => providerUrl(input, config.hosts)).toThrow("policy")
  }
})

it("enforces the body limit after decompression", async () => {
  const compressed = gzipSync("x".repeat(10_000))
  await expect(
    readBounded(decode(Readable.from([compressed]), "gzip"), 1000)
  ).rejects.toThrow("too_large")
})

it("extracts a short article, preserves source links and identifies challenge and paywall", () => {
  const html = `<html lang="en"><head><title>A reading room</title><meta name="author" content="Jane Doe"></head><body><main><article><h1>A reading room</h1><p>${excerpt} <a href="/maps">Maps</a></p><script>throw new Error()</script></article></main></body></html>`
  const candidate = extractHtml(html, url, 200)
  expect(candidate.authors).toEqual(["Jane Doe"])
  expect(candidate.relatedLinks?.[0]?.url).toBe(new URL("/maps", url).href)
  expect(classify(candidate).status).toBe("full")
  expect(
    classify(
      extractHtml(
        html.replace(
          "<head>",
          '<head><script type="application/ld+json">{"isAccessibleForFree":false}</script>'
        ),
        url,
        200
      )
    ).protectedPage
  ).toBe(true)
  expect(
    classify({
      finalUrl: url,
      title: "Just a moment",
      content: excerpt.repeat(10),
    }).status
  ).toBe("failed")
  expect(
    classify({ finalUrl: url, title: "502 Bad Gateway", content: excerpt })
      .status
  ).toBe("failed")
  expect(
    classify({ finalUrl: url, content: excerpt.repeat(400) })
  ).toMatchObject({ status: "partial", truncated: true })
})

it("selects the longest partial, breaks ties by order and stops after denial", async () => {
  const result = await recoverArticle(
    url,
    config,
    signal,
    async () => true,
    async (provider) => ({
      finalUrl: url,
      content: provider === "firecrawl" ? excerpt : excerpt.repeat(4),
      partial: true,
    })
  )
  expect("provider" in result && result.provider).toBe("direct")
  expect(result.attempts.map(({ provider }) => provider)).toEqual([
    "direct",
    "jina",
    "firecrawl",
  ])

  const blocked = await recoverArticle(
    url,
    config,
    signal,
    async () => true,
    async () => ({
      finalUrl: url,
      content: excerpt.repeat(5),
      evidence: "Subscribe to continue reading",
    })
  )
  expect(blocked.accessStatus).toBe("partial")
  expect(blocked.attempts).toHaveLength(1)

  const full = await recoverArticle(
    url,
    config,
    signal,
    async () => true,
    async () => ({
      finalUrl: url,
      content: excerpt,
    })
  )
  expect(full.accessStatus).toBe("full")
  expect(full.attempts).toHaveLength(1)
})

it("limits individual attempts and skips paid extraction without a reservation", async () => {
  const result = await recoverArticle(
    url,
    {
      ...config,
      enabled: { ...config.enabled, jina: false },
      providerMs: { ...config.providerMs, direct: 5 },
    },
    signal,
    async () => false,
    async (_provider, _url, _config, pending) => {
      await new Promise<void>((resolve) => {
        const timer = setTimeout(resolve, 1000)
        pending.addEventListener(
          "abort",
          () => {
            clearTimeout(timer)
            resolve()
          },
          { once: true }
        )
      })
      pending.throwIfAborted()
      return { finalUrl: url }
    }
  )
  expect(result.attempts.map(({ reason }) => reason)).toEqual([
    "timeout",
    "disabled",
    "quota",
  ])
  const controller = new AbortController()
  controller.abort()
  await expect(
    recoverArticle(url, config, controller.signal, async () => true)
  ).rejects.toThrow()
})

it("adapts provider JSON and handles malformed, redirected and exhausted responses", async () => {
  const dns = async () => "8.8.8.8"
  const request = (response: Response) => async () => response
  const jina = await fetchCandidate(
    "jina",
    url,
    config,
    signal,
    request(Response.json({ code: 200, data: { url, content: excerpt } })),
    dns
  )
  expect(jina.content).toBe(excerpt)
  const firecrawlReferences = await fetchCandidate(
    "firecrawl",
    url,
    config,
    signal,
    request(
      Response.json({
        success: true,
        data: {
          markdown:
            "[Navigation](/nav)\n\nThe archive links to [a map](/maps?utm_source=fixture#room) and [a copy](/maps#room) for visitors.",
          metadata: { statusCode: 200, url },
          links: ["/nav"],
        },
      })
    ),
    dns
  )
  expect(firecrawlReferences.relatedLinks).toEqual([
    { url: new URL("/maps#room", url).href, title: "a map", origin: "source" },
  ])

  await expect(
    fetchCandidate(
      "jina",
      url,
      config,
      signal,
      request(new Response("bad json")),
      dns
    )
  ).rejects.toThrow("invalid_response")
  await expect(
    fetchCandidate(
      "jina",
      url,
      config,
      signal,
      request(
        Response.json({ data: { url: "https://other.org", content: excerpt } })
      ),
      dns
    )
  ).rejects.toThrow("policy")
  for (const [status, reason] of [
    [402, "credits"],
    [429, "rate_limited"],
  ] as const) {
    await expect(
      fetchCandidate(
        "firecrawl",
        url,
        config,
        signal,
        request(new Response(null, { status })),
        dns
      )
    ).rejects.toThrow(reason)
  }
  const firecrawl = await fetchCandidate(
    "firecrawl",
    url,
    config,
    signal,
    async (_endpoint, init) => {
      expect(JSON.parse(String(init?.body))).toMatchObject({
        proxy: "basic",
        storeInCache: false,
      })
      return Response.json({
        success: true,
        data: { markdown: excerpt, metadata: { url, statusCode: 200 } },
      })
    },
    dns
  )
  expect(firecrawl.content).toBe(excerpt)
})

it("pins the vetted address and revalidates redirects before opening another connection", async () => {
  const visited: string[] = []
  const dns: string[] = []
  const response = (statusCode: number, headers: IncomingMessage["headers"]) =>
    Object.assign(Readable.from([]), { statusCode, headers }) as IncomingMessage

  await expect(
    directRequest(
      url,
      signal,
      async (host) => {
        dns.push(host)
        return dns.length === 1 ? "8.8.8.8" : "127.0.0.1"
      },
      async (target, options) => {
        visited.push(target.hostname)
        assertPinned(options.lookup)
        return response(302, {
          location: "https://redirect.example.org/article",
        })
      }
    )
  ).rejects.toThrow("policy")
  expect(dns).toEqual(["www.xda-developers.com", "redirect.example.org"])
  expect(visited).toEqual(["www.xda-developers.com"])

  await expect(
    directRequest(
      url,
      signal,
      async () => "8.8.8.8",
      async () =>
        response(302, { location: "https://169.254.169.254/latest/meta-data/" })
    )
  ).rejects.toThrow("policy")
})

function assertPinned(lookup: import("node:http").RequestOptions["lookup"]) {
  expect(lookup).toBeDefined()
  lookup?.(
    "www.xda-developers.com",
    { family: 4 },
    (error, address, family) => {
      expect(error).toBeNull()
      expect(address).toBe("8.8.8.8")
      expect(family).toBe(4)
    }
  )
}

it("rejects player controls and retains a useful partial from the previous provider", async () => {
  const controls = [
    "# I asked VS Code, Claude Code, and Google Antigravity to build an app",
    "Play Video",
    "Pause",
    "Mute",
    "Current Time 0:00 / Duration 1:23",
    "Loaded: 0%",
    "Playback Rate 1x",
    "Captions",
    "Picture-in-Picture",
    "Fullscreen",
    "Advertisement",
    "This is a modal window. Beginning of dialog window. Escape will cancel and close the window.",
    "We and our partners use cookies to personalize advertisements and analyse the traffic on this website.",
    "[Home](https://www.xda-developers.com/)",
    "[News](https://www.xda-developers.com/news/)",
    "[Sign in](https://www.xda-developers.com/login/)",
  ].join("\n\n")
  expect(
    classify({ finalUrl: url, title: "An article", content: controls }).status
  ).toBe("failed")
  const recovered = await recoverArticle(
    url,
    config,
    signal,
    async () => true,
    async (provider) => ({
      finalUrl: url,
      content: provider === "jina" ? excerpt.repeat(4) : controls,
      partial: provider === "jina",
    })
  )
  expect(recovered.accessStatus).toBe("partial")
  expect("provider" in recovered && recovered.provider).toBe("jina")
  expect(recovered.attempts.map(({ status }) => status)).toEqual([
    "failed",
    "partial",
    "failed",
  ])
})

it("ignores headlines and linked menus while retaining brief prose and inline references", () => {
  const menu = Array.from(
    { length: 50 },
    (_, index) =>
      `[An interesting article number ${index}](https://example.org/${index})`
  ).join("\n\n")
  expect(classify({ finalUrl: url, content: menu }).status).toBe("failed")
  expect(
    classify({
      finalUrl: url,
      content:
        "# The city's new reading room opened on Tuesday, restoring access to historic maps.",
    }).status
  ).toBe("failed")
  const article = `Play Video\n\n# A reading room\n\n${excerpt} Readers can [browse the maps](https://example.org/maps).\n\nFullscreen`
  const result = classify({ finalUrl: url, content: article })
  expect(result.status).toBe("full")
  expect("content" in result && result.content).toContain("[browse the maps]")
  expect("content" in result && result.content).not.toContain("Play Video")
  expect("content" in result && result.content).not.toContain("Fullscreen")
  expect(
    classify({
      finalUrl: url,
      content: "El museo abrió hoy sus puertas tras las obras de restauración.",
    }).status
  ).toBe("full")
})

it("removes navigation before applying the output limit", () => {
  const navigation = Array.from(
    { length: 1000 },
    (_, index) =>
      `[Another related article number ${index}](https://example.org/article-${index})`
  ).join("\n\n")
  const result = classify({
    finalUrl: url,
    content: `${navigation}\n\n${excerpt}`,
  })
  expect(result.status).toBe("full")
  expect("content" in result && result.content).toBe(excerpt)
})

it("only sends an unlisted URL to the enabled providers covered by one consent", async () => {
  const unlisted = { ...config, hosts: new Set<string>() }
  const calls: string[] = []
  const candidateFetcher: Parameters<typeof recoverArticle>[4] = async (
    provider,
    input,
    providerConfig
  ) => {
    calls.push(provider)
    if (provider === "direct") return { finalUrl: input }
    expect(providerConfig.hosts.has(new URL(input).hostname)).toBe(true)
    return { finalUrl: input, content: excerpt }
  }
  let reservations = 0
  const reserve = async () => {
    reservations++
    return true
  }
  const offered = await recoverArticle(
    url,
    unlisted,
    signal,
    reserve,
    candidateFetcher
  )
  expect(offered.attempts.map(({ reason }) => reason)).toEqual([
    "no_content",
    "policy",
    "policy",
  ])
  expect(calls).toEqual(["direct"])
  let uses = 0
  const externalConsent = {
    host: new URL(url).hostname,
    providers: ["jina"] as const,
    consume: async () => ++uses === 1,
  }
  const confirmed = await recoverArticle(
    url,
    unlisted,
    signal,
    reserve,
    candidateFetcher,
    externalConsent
  )
  expect(confirmed.accessStatus).toBe("full")
  expect(calls).toEqual(["direct", "direct", "jina"])
  await expect(
    recoverArticle(
      url,
      unlisted,
      signal,
      reserve,
      candidateFetcher,
      externalConsent
    )
  ).rejects.toThrow()
  expect(calls).toEqual(["direct", "direct", "jina", "direct"])
  const disabled = {
    ...unlisted,
    enabled: { ...unlisted.enabled, jina: false },
  }
  const ignored = await recoverArticle(
    url,
    disabled,
    signal,
    reserve,
    candidateFetcher,
    externalConsent
  )
  expect(ignored.attempts.map(({ reason }) => reason)).toEqual([
    "no_content",
    "disabled",
    "policy",
  ])
  expect(uses).toBe(2)
  expect(reservations).toBe(0)
  const denied = await recoverArticle(
    url,
    unlisted,
    signal,
    reserve,
    async () => ({ finalUrl: url, challenge: true }),
    externalConsent
  )
  expect(denied.attempts).toHaveLength(1)
  expect(uses).toBe(2)
})
