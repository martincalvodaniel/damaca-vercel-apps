const control =
  /^(?:(?:play|pause|replay|close|mute|unmute)(?: video| audio)?|current time\s*[:\d].*|duration\s*[:\d].*|remaining time\s*[:\d].*|loaded:?\s*\d.*|playback rate\s*[:\d].*|(?:captions|subtitles)(?: off| on| settings)?|picture.in.picture|fullscreen|exit full.?screen|advertisement|advertising|skip (?:ad|advertisement)|share(?: this article)?|copy link|sign in|log in|subscribe|accept all cookies|reject all cookies|manage cookies|cookie settings|\d{1,2}:\d{2}(?:\s*\/\s*\d{1,2}:\d{2})?)$/i

function visibleText(value: string) {
  return value
    .replace(/!\[[^\]]*\]\([^\n]*?\)/g, "")
    .replace(/\[([^\]]+)\]\([^\n]*?\)/g, "$1")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/<[^>]*>/g, "")
    .replace(/[*_~`]/g, "")
    .trim()
}

function interfaceCopy(visible: string) {
  return /^(?:this is a modal window|beginning of dialog window|end of dialog window|we (?:and our partners )?use cookies|by (?:clicking|selecting) (?:accept|agree)|your (?:privacy|consent) (?:is|choices)|you (?:can|may) (?:manage|withdraw) your consent)\b/i.test(
    visible
  )
}

function editorialParagraph(block: string) {
  if (/^\s*(?:#{1,6}\s|\x60{3}|~{3}|\|)/.test(block)) return ""
  const visible = visibleText(block)
  // A title, link menu or player transcript must not establish article access.
  const linked = [...block.matchAll(/\[([^\]]+)\]\([^\n]*?\)/g)]
    .map((match) => match[1])
    .join(" ")
  if (linked.length > visible.length / 2) return ""
  if (control.test(visible)) return ""
  if (interfaceCopy(visible)) return ""
  const words = visible.match(/[\p{L}\p{N}]+/gu) ?? []
  const sentence = /[\p{L}\p{N}][.!?。！？](?:\s|$)/u.test(visible)
  const prose = words.length >= 8 && sentence
  const unpunctuated = words.length >= 25 && /[,;:，]/.test(visible)
  return prose || unpunctuated ? visible : ""
}

export function editorialContent(markdown: string) {
  const lines = markdown
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, "")
    .split("\n")
    .filter((line) => {
      const visible = visibleText(line)
      const linkOnly = /^\s*(?:[-*+]\s+)?!?\[[^\]]*\]\([^\n]*\)\s*$/.test(line)
      return !control.test(visible) && !interfaceCopy(visible) && !linkOnly
    })
  const content = lines
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
  const paragraphs = content.split(/\n\s*\n/)
  const editorial = paragraphs.map(editorialParagraph).filter(Boolean)
  return { content, score: editorial.join("\n").length }
}
