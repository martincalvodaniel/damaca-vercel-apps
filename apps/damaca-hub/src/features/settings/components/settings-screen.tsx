import { AccountAvatar } from "@/components/shared/account-avatar"
import { AccountSwitchButton } from "@/features/auth/components/account-switch-button"
import { ThemeSettings } from "@/features/settings/components/theme-settings"
import { requireVerifiedSession } from "@/lib/auth/session"

export async function SettingsScreen() {
  const session = await requireVerifiedSession()
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-4 sm:p-8">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      <section
        aria-label="Your account"
        className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
      >
        <h2 className="mb-4 text-lg font-semibold">Your account</h2>
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
              Google account
            </p>
          </div>
        </div>
        <div className="mt-4">
          <AccountSwitchButton />
        </div>
      </section>
      <ThemeSettings />
    </main>
  )
}
