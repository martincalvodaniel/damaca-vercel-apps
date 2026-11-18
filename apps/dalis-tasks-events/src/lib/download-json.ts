"use client"

export function downloadJson(json: string, filename: string): void {
  const url = URL.createObjectURL(
    new Blob([json], { type: "application/json;charset=utf-8" })
  )
  const link = document.createElement("a")
  let requested = false
  try {
    link.href = url
    link.download = filename
    document.body.append(link)
    link.click()
    requested = true
  } finally {
    link.remove()
    // Allow the browser to consume the object URL before releasing it.
    if (requested) setTimeout(() => URL.revokeObjectURL(url), 30000)
    else URL.revokeObjectURL(url)
  }
}
