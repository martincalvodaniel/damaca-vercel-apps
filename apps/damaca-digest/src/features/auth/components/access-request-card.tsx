import { AccountSwitchButton } from "@/features/auth/components/account-switch-button"
import { RequestAccessForm } from "@/features/auth/components/request-access-form"
import type { AccessRequestStatus } from "@/types/access"

interface AccessRequestCardProps {
  email: string
  status: AccessRequestStatus | null
}

export function AccessRequestCard({ email, status }: AccessRequestCardProps) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg items-center p-3 sm:p-6">
      <section className="digest-panel flex w-full min-w-0 flex-col gap-3 rounded-2xl p-4 sm:gap-4 sm:p-6">
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
