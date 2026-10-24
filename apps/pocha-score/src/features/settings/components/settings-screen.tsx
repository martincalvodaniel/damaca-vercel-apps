import { InstallSettings } from "@/features/settings/components/install-settings"
import { ThemeSettings } from "@/features/settings/components/theme-settings"

export function SettingsScreen() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-5 p-4 sm:p-8">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      <ThemeSettings />
      <InstallSettings />
      <section
        aria-label="On this device"
        className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
      >
        <h2 className="text-lg font-semibold">On this device</h2>
        <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          Preferences are saved in this browser using IndexedDB. There is no
          account or cloud sync. Clearing site data or using private browsing
          can remove your local data. Installing the app does not create a
          backup.
        </p>
      </section>
    </main>
  )
}
