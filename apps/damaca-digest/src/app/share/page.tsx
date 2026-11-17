import type { Metadata } from "next"
import { headers } from "next/headers"
import { AppShell } from "@/components/shared/app-shell"
import { DigestIcon } from "@/components/ui/digest-icon"
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
      <section className="mx-auto max-w-3xl space-y-3 py-2 sm:space-y-4 sm:py-5">
        <h1 className="sr-only">Capture a link</h1>
        {url ? (
          <div className="digest-panel space-y-2 rounded-xl p-3">
            <p className="break-words text-sm font-medium text-teal-800 dark:text-teal-300">
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
          </div>
        ) : (
          <>
            {params.url || params.text ? (
              <p role="alert" className="text-sm">
                Share or paste a single HTTP or HTTPS link.
              </p>
            ) : null}
            <form
              action="/share"
              className="digest-panel digest-search-panel digest-search-row"
            >
              <input
                name="url"
                type="url"
                aria-label="Article URL"
                placeholder="Article URL"
                required
                maxLength={4096}
                className="digest-search-field flex-1 text-sm"
              />
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
          </>
        )}
      </section>
    </AppShell>
  )
}
