const trackingParameters = new Set([
  "utm",
  "fbclid",
  "gclid",
  "msclkid",
  "mc_cid",
  "mc_eid",
])

export function normalizeArticleUrl(input: string): string {
  const url = new URL(input)
  const tracking = [...url.searchParams.keys()].filter((name) => {
    const lower = name.toLowerCase()
    return lower.startsWith("utm_") || trackingParameters.has(lower)
  })
  if (!tracking.length) return url.href

  const functional = url.search
    .slice(1)
    .split("&")
    .filter((part) => {
      const [name] = new URLSearchParams(part).keys()
      return name === undefined || !tracking.includes(name)
    })
  url.search = functional.join("&")
  return url.href
}
