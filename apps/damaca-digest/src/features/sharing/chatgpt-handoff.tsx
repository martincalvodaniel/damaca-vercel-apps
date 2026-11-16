"use client"

import { type MouseEvent, useCallback, useState } from "react"

import { chatGptOpenUrl, chatGptUniversalUrl } from "./chatgpt-link"

export function ChatGptHandoff({
  connector,
  prompt,
}: {
  connector: string
  prompt: string
}) {
  const [copyStatus, setCopyStatus] = useState<"copied" | "failed" | null>(null)

  const copyPrompt = useCallback(
    async (event: MouseEvent<HTMLButtonElement>) => {
      const openChatGpt = event.currentTarget.value === "open"
      try {
        await navigator.clipboard.writeText(prompt)
        if (openChatGpt)
          window.location.assign(chatGptOpenUrl(navigator.userAgent))
        else setCopyStatus("copied")
      } catch {
        setCopyStatus("failed")
      }
    },
    [prompt]
  )

  const openChatGpt = useCallback((event: MouseEvent<HTMLAnchorElement>) => {
    const target = chatGptOpenUrl(navigator.userAgent)
    if (!target.startsWith("intent:")) return
    event.preventDefault()
    window.location.assign(target)
  }, [])

  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
        In your ChatGPT session, select <strong>{`@${connector}`}</strong>,
        paste the prompt, and send it.
      </p>
      <label className="block text-sm font-medium">
        Prompt
        <textarea
          className="mt-1 block w-full min-w-0 resize-y rounded-lg border border-zinc-300 bg-transparent p-2.5 text-sm dark:border-zinc-700"
          readOnly
          rows={5}
          value={prompt}
        />
      </label>
      <p role="status" className={copyStatus ? "text-sm" : "sr-only"}>
        {copyStatus === "copied"
          ? "Prompt copied. Paste it into your ChatGPT conversation."
          : copyStatus === "failed"
            ? "The browser could not copy the prompt. Select and copy it above."
            : ""}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={copyPrompt}
          value="copy"
          className="min-h-11 rounded-lg bg-teal-800 px-3 text-sm font-semibold text-white hover:bg-teal-900"
        >
          Copy prompt
        </button>
        <button
          type="button"
          onClick={copyPrompt}
          value="open"
          className="digest-panel min-h-11 rounded-lg px-3 text-sm font-semibold hover:border-teal-600"
        >
          Copy prompt and open ChatGPT
        </button>
        <a
          href={chatGptUniversalUrl}
          onClick={openChatGpt}
          rel="noreferrer"
          className="inline-flex min-h-11 items-center px-2 text-sm underline underline-offset-4"
        >
          Open ChatGPT
        </a>
      </div>
    </div>
  )
}
