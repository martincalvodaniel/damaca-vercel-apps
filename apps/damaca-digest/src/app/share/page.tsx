import type { Metadata } from "next"
import { headers } from "next/headers"
import { AppShell } from "@/components/shared/app-shell"
import { installName } from "@/config/install-name"
import { CaptureLinkForm } from "@/features/sharing/capture-link-form"
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
            <CaptureLinkForm />
          </>
        )}
      </section>
    </AppShell>
  )
}
