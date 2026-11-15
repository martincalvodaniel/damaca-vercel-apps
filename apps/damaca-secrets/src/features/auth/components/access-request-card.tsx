import { AccountSwitchButton } from "@/features/auth/components/account-switch-button"
import { RequestAccessForm } from "@/features/auth/components/request-access-form"
import { LanguageSettings } from "@/features/settings/components/language-settings"
import { messages } from "@/lib/i18n/messages"
import { getLocale } from "@/lib/i18n/server"
import type { AccessRequestStatus } from "@/types/access"

interface AccessRequestCardProps {
  email: string
  status: AccessRequestStatus | null
}

export async function AccessRequestCard({
  email,
  status,
}: AccessRequestCardProps) {
  const t = messages[await getLocale()]
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg items-center p-4">
      <section className="flex w-full min-w-0 flex-col gap-5 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t.accountWithoutAccess}
          </h1>
          <p className="mt-2 break-all text-sm text-zinc-600 dark:text-zinc-400">
            {email}
          </p>
        </header>
        {status === "pending" ? (
          <p role="status" className="text-sm">
            {t.requestPending}
          </p>
        ) : (
          <>
            <p className="text-sm">
              {status === "rejected" ? t.requestWasRejected : t.requestHelp}
            </p>
            <RequestAccessForm />
          </>
        )}
        <a
          href="/"
          className="inline-flex min-h-9 items-center justify-center rounded-lg px-3 py-1 text-sm underline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          {t.checkAccess}
        </a>
        <AccountSwitchButton />
        <div className="mt-4">
          <LanguageSettings />
        </div>
      </section>
    </main>
  )
}
