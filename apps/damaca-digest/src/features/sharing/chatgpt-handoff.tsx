"use client"

import { type MouseEvent, useCallback, useState } from "react"
import { DigestIcon } from "@/components/ui/digest-icon"

import { chatGptWebUrl } from "./chatgpt-link"

export function ChatGptHandoff({
  connector,
  openUrl,
  prompt,
}: {
  connector: string
  openUrl: string
  prompt: string
}) {
  const [copyStatus, setCopyStatus] = useState<
    "copied" | "tap-to-open" | "failed" | null
  >(null)

  const copyPrompt = useCallback(
    async (event: MouseEvent<HTMLButtonElement>) => {
      const openChatGpt = event.currentTarget.value === "open"
      try {
        await navigator.clipboard.writeText(prompt)
        if (!openChatGpt) {
          setCopyStatus("copied")
        } else if (
          openUrl !== chatGptWebUrl &&
          navigator.userActivation?.isActive === false
        ) {
          setCopyStatus("tap-to-open")
        } else {
          window.location.assign(openUrl)
        }
      } catch {
        setCopyStatus("failed")
      }
    },
    [openUrl, prompt]
  )

  return (
    <div className="space-y-2">
      <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
        In your ChatGPT session, select <strong>{`@${connector}`}</strong>,
        paste the prompt, and send it.
      </p>
      <label className="block text-sm font-medium">
        <textarea
          className="digest-search-field mt-1 resize-y py-1.5 text-sm"
          aria-label="Prompt"
          readOnly
          rows={5}
          value={prompt}
        />
      </label>
      <p role="status" className={copyStatus ? "text-sm" : "sr-only"}>
        {copyStatus === "copied"
          ? "Prompt copied. Paste it into your ChatGPT conversation."
          : copyStatus === "tap-to-open"
            ? "Prompt copied. Tap Open ChatGPT to continue."
            : copyStatus === "failed"
              ? "The browser could not copy the prompt. Select and copy it above."
              : ""}
      </p>
      <div className="flex flex-wrap items-center gap-1">
        <button
          type="button"
          onClick={copyPrompt}
          value="copy"
          aria-label="Copy prompt"
          title="Copy prompt"
          className="group digest-icon-button text-white"
        >
          <span className="grid size-8 place-items-center rounded-lg bg-teal-800 group-hover:bg-teal-900">
            <DigestIcon name="copy" />
          </span>
        </button>
        <button
          type="button"
          onClick={copyPrompt}
          value="open"
          aria-label="Copy prompt and open ChatGPT"
          title="Copy prompt and open ChatGPT"
          className="digest-icon-button"
        >
          <span aria-hidden="true" className="relative block size-7">
            <span className="digest-chatgpt-mark absolute start-0 top-0 size-5" />
            <span className="absolute -end-0.5 -bottom-0.5 grid size-4 place-items-center rounded-sm bg-(--surface) ring-1 ring-current [&>svg]:size-3">
              <DigestIcon name="copy" />
            </span>
          </span>
        </button>
        <a
          href={openUrl}
          rel="noreferrer"
          aria-label="Open ChatGPT"
          title="Open ChatGPT"
          className="digest-icon-button"
        >
          <span aria-hidden="true" className="digest-chatgpt-mark size-5" />
          <span className="sr-only">Open ChatGPT</span>
        </a>
      </div>
    </div>
  )
}
