import type { Metadata } from "next"
import { headers } from "next/headers"
import { AppShell } from "@/components/shared/app-shell"
import { installName } from "@/config/install-name"
import { ChatGptHandoff } from "@/features/sharing/chatgpt-handoff"
import { chatGptOpenUrl } from "@/features/sharing/chatgpt-link"
import {
  capturePrompt,
  resolveSharedLink,
} from "@/features/sharing/shared-link"

// biome-ignore lint/style/useComponentExportOnlyModules: Next.js requires this page export.
export const metadata: Metadata = {
  title: "Capture a link · Damaca Digest",
  referrer: "no-referrer",
  robots: { index: false, follow: false },
}

export default async function SharePage({
  searchParams,
}: {
  searchParams: Promise<{ url?: string | string[]; text?: string | string[] }>
}) {
  const params = await searchParams
  const url = resolveSharedLink(params)

  return (
    <AppShell>
      <section className="digest-panel mx-auto mt-2 max-w-lg space-y-2 rounded-xl p-2 sm:p-3">
        <h1 className="text-3xl font-semibold tracking-tight">
          Capture a link
        </h1>
        {url ? (
          <>
            <p className="break-all text-sm font-medium text-teal-800 dark:text-teal-300">
              {url}
            </p>
            <ChatGptHandoff
              key={url}
              connector={installName}
              openUrl={chatGptOpenUrl(
                (await headers()).get("user-agent") ?? ""
              )}
              prompt={capturePrompt(url, installName)}
            />
          </>
        ) : (
          <form action="/share" className="space-y-2">
            {params.url || params.text ? (
              <p role="alert" className="text-sm">
                Share or paste a single HTTP or HTTPS link.
              </p>
            ) : null}
            <label className="block text-sm font-medium">
              Article URL
              <input
                name="url"
                type="url"
                required
                maxLength={4096}
                className="mt-1 block min-h-8 w-full min-w-0 rounded-lg border border-zinc-300 bg-transparent px-2 dark:border-zinc-700"
              />
            </label>
            <button
              type="submit"
              className="min-h-8 rounded-lg bg-teal-800 px-2 text-sm font-semibold text-white hover:bg-teal-900"
            >
              Prepare prompt
            </button>
          </form>
        )}
      </section>
    </AppShell>
  )
}
