import Link from "next/link"
import { AccountAvatar } from "@/components/shared/account-avatar"
import { AccountSwitchButton } from "@/features/auth/components/account-switch-button"
import { OfflineSettings } from "@/features/offline/offline-settings"
import { LanguageSettings } from "@/features/settings/components/language-settings"
import { ThemeSettings } from "@/features/settings/components/theme-settings"
import { VaultSecuritySettings } from "@/features/settings/components/vault-security-settings"
import { requireAuthorizedSession } from "@/lib/auth/session"
import { messages } from "@/lib/i18n/messages"
import { getLocale } from "@/lib/i18n/server"

export async function SettingsScreen() {
  const t = messages[await getLocale()]
  const session = await requireAuthorizedSession()
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-4 sm:p-8">
      <h1 className="text-2xl font-semibold tracking-tight">{t.settings}</h1>
      <section
        aria-label={t.yourAccount}
        className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
      >
        <h2 className="mb-4 text-lg font-semibold">{t.yourAccount}</h2>
        <div className="flex min-w-0 items-center gap-3">
          <AccountAvatar
            name={session.user.name}
            email={session.user.email}
            image={session.user.image}
          />
          <div className="min-w-0">
            <p className="break-words font-medium">{session.user.name}</p>
            <p className="break-all text-sm text-zinc-600 dark:text-zinc-400">
              {session.user.email}
            </p>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
              {session.role === "admin" ? t.administrator : t.user}
            </p>
          </div>
        </div>
        <div className="mt-4">
          <AccountSwitchButton />
        </div>
      </section>
      <VaultSecuritySettings />
      <OfflineSettings ownerId={session.user.id} />
      <ThemeSettings />
      <section className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
        <LanguageSettings />
      </section>
      {session.role === "admin" ? (
        <Link
          href="/admin"
          className="inline-flex min-h-9 items-center justify-center rounded-lg border border-zinc-300 px-3 py-1 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 dark:border-zinc-700"
        >
          {t.siteAdmin}
        </Link>
      ) : null}
    </main>
  )
}
