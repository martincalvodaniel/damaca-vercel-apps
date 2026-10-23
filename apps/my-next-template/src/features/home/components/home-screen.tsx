import Link from "next/link"
import { requireAuthorizedSession } from "@/lib/auth/session"

export async function HomeScreen() {
  const session = await requireAuthorizedSession()
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center p-4 sm:p-8">
      <section className="w-full rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
          My Next Template
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Welcome</h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400">
          Your account has access as{" "}
          {session.role === "admin" ? "an administrator" : "a user"}.
        </p>
        {session.role === "admin" ? (
          <Link
            href="/admin"
            className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
          >
            Site administration
          </Link>
        ) : null}
      </section>
    </main>
  )
}
