import assert from "node:assert/strict"

function decodeHtml(value: string) {
  return value
    .replaceAll("&quot;", '"')
    .replaceAll("&#x27;", "'")
    .replaceAll("&amp;", "&")
}

export function serverActionForm(form: string) {
  const data = new FormData()
  for (const input of form.matchAll(/<input[^>]*>/g)) {
    const name = input[0].match(/name="([^"]+)"/)?.[1]
    const value = input[0].match(/value="([^"]*)"/)?.[1] ?? ""
    if (name?.startsWith("$ACTION"))
      data.append(decodeHtml(name), decodeHtml(value))
  }
  assert.ok(
    [...data.keys()].length > 0,
    "Rendered Server Action metadata is required"
  )
  return data
}
