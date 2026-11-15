"use client"

import { useCallback, useState } from "react"

const chatGptUrl = "https://chatgpt.com/"

export function ChatGptHandoff({ prompt }: { prompt: string }) {
  const [copyFailed, setCopyFailed] = useState(false)

  const copyAndOpen = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(prompt)
      window.location.assign(chatGptUrl)
    } catch {
      setCopyFailed(true)
    }
  }, [prompt])

  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
        In ChatGPT, select <strong>@damaca-digest</strong>, paste the prompt,
        and send it.
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
      {copyFailed ? (
        <p role="status" className="text-sm">
          The browser could not copy the prompt. Select and copy it above, then
          open ChatGPT.
        </p>
      ) : null}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={copyAndOpen}
          className="min-h-11 rounded-lg bg-teal-800 px-3 text-sm font-semibold text-white hover:bg-teal-900"
        >
          Copy prompt and open ChatGPT
        </button>
        <a
          href={chatGptUrl}
          rel="noreferrer"
          className="inline-flex min-h-11 items-center px-2 text-sm underline underline-offset-4"
        >
          Open ChatGPT
        </a>
      </div>
    </div>
  )
}
