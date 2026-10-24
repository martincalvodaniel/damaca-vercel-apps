import Link from "next/link"
import { appConfig } from "@/config/app"

export function HomeScreen() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-4 py-12 sm:p-8 sm:py-20">
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-10 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
          {appConfig.name}
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          Your space. On your device.
        </h1>
        <p className="mt-5 leading-7 text-zinc-600 dark:text-zinc-400">
          A local starting point for your next app. No account needed. Your
          preferences stay in this browser.
        </p>
        <Link
          href="/settings/"
          className="mt-8 inline-flex min-h-11 items-center rounded-lg bg-emerald-700 px-5 py-3 font-medium text-white hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-600"
        >
          Open settings
        </Link>
      </section>
      <p className="px-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
        Install from Settings for quick access. Once offline setup is ready, you
        can reopen this app without a connection.
      </p>
    </main>
  )
}
