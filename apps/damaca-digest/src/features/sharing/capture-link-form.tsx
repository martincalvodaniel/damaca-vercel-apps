"use client"

import { useCallback, useRef, useState } from "react"
import { DigestIcon } from "@/components/ui/digest-icon"
import { resolveSharedLink } from "./shared-link"

export function CaptureLinkForm() {
  const input = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState("")
  const [pasting, setPasting] = useState(false)
  const clearMessage = useCallback(() => setMessage(""), [])
  const paste = useCallback(async () => {
    const field = input.current
    if (!field) return
    const original = field.value
    setPasting(true)
    setMessage("")
    try {
      const text = await navigator.clipboard.readText()
      if (input.current !== field || field.value !== original) return
      const url = resolveSharedLink({ url: text })
      if (!url || url.length > field.maxLength) {
        setMessage(
          text.trim()
            ? "Copy a single HTTP or HTTPS link."
            : "The clipboard is empty."
        )
        return
      }
      field.value = url
      setMessage("Link pasted.")
    } catch {
      setMessage(
        "Clipboard unavailable. Touch and hold the link field, then choose Paste."
      )
    } finally {
      setPasting(false)
    }
  }, [])

  return (
    <>
      <form
        action="/share"
        autoComplete="off"
        className="digest-panel digest-search-panel digest-search-row"
      >
        <input
          ref={input}
          onInput={clearMessage}
          name="url"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          type="url"
          aria-label="Article URL"
          placeholder="Article URL"
          required
          maxLength={4096}
          className="digest-search-field flex-1 text-sm"
        />
        <button
          type="button"
          aria-label="Paste link"
          title="Paste link"
          className="group grid size-11 shrink-0 place-items-center rounded-lg sm:hidden"
          disabled={pasting}
          onClick={paste}
        >
          <span className="digest-panel grid size-8 place-items-center rounded-lg group-hover:border-teal-600">
            <DigestIcon name="clipboard" />
          </span>
        </button>
        <button
          type="submit"
          aria-label="Prepare prompt"
          title="Prepare prompt"
          className="group grid size-11 shrink-0 place-items-center rounded-lg text-white"
        >
          <span className="grid size-8 place-items-center rounded-lg bg-teal-800 group-hover:bg-teal-900">
            <DigestIcon name="forward" />
          </span>
        </button>
      </form>
      <p role="status" className={message ? "text-sm" : "sr-only"}>
        {message}
      </p>
    </>
  )
}
