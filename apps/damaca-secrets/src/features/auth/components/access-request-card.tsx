import { AccountSwitchButton } from "@/features/auth/components/account-switch-button"
import { RequestAccessForm } from "@/features/auth/components/request-access-form"
import type { AccessRequestStatus } from "@/types/access"

interface AccessRequestCardProps {
  email: string
  status: AccessRequestStatus | null
}

export function AccessRequestCard({ email, status }: AccessRequestCardProps) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg items-center p-4">
      <section className="flex w-full min-w-0 flex-col gap-5 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight">
            Your account does not have access
          </h1>
          <p className="mt-2 break-all text-sm text-zinc-600 dark:text-zinc-400">
            {email}
          </p>
        </header>
        {status === "pending" ? (
          <p role="status" className="text-sm">
            Your request is pending review. An administrator must approve it
            before you can sign in.
          </p>
        ) : (
          <>
            <p className="text-sm">
              {status === "rejected"
                ? "Your request was rejected. You can submit a new request for another review."
                : "You can request access from the site administrators."}
            </p>
            <RequestAccessForm />
          </>
        )}
        <a
          href="/"
          className="inline-flex min-h-11 items-center justify-center rounded-lg px-4 py-2 text-sm underline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Check access
        </a>
        <AccountSwitchButton />
      </section>
    </main>
  )
}
