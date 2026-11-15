import type { Metadata } from "next"
import Link from "next/link"
import { ChatGptHandoff } from "@/features/sharing/chatgpt-handoff"
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
    <main className="mx-auto max-w-lg space-y-3 px-3 py-4 sm:px-5 sm:py-8">
      <Link
        href="/"
        className="inline-flex min-h-11 items-center text-sm font-medium underline-offset-4 hover:underline"
      >
        ← Library
      </Link>
      <section className="digest-panel space-y-3 rounded-xl p-4 sm:p-6">
        <h1 className="text-3xl font-semibold tracking-tight">
          Capture a link
        </h1>
        {url ? (
          <>
            <p className="break-all text-sm font-medium text-teal-800 dark:text-teal-300">
              {url}
            </p>
            <ChatGptHandoff key={url} prompt={capturePrompt(url)} />
          </>
        ) : (
          <form action="/share" className="space-y-3">
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
                className="mt-1 block min-h-11 w-full min-w-0 rounded-lg border border-zinc-300 bg-transparent px-2.5 dark:border-zinc-700"
              />
            </label>
            <button
              type="submit"
              className="min-h-11 rounded-lg bg-teal-800 px-3 text-sm font-semibold text-white hover:bg-teal-900"
            >
              Prepare prompt
            </button>
          </form>
        )}
      </section>
    </main>
  )
}
