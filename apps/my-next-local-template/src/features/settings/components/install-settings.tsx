"use client"

import { useId, useState } from "react"
import { usePwa } from "@/lib/pwa/context"

const offlineMessages = {
  preparing:
    "Preparing offline access… Keep this app open until setup is ready.",
  ready: "Offline ready. You can reopen this app without a connection.",
  error: "Offline setup failed. Reopen the app while online to retry.",
  unsupported:
    "Offline setup requires a supported browser and HTTPS or localhost.",
  development:
    "Offline setup is available in the production preview, not the development server.",
} as const

export function InstallSettings() {
  const headingId = useId()
  const pwa = usePwa()
  const [installFailed, setInstallFailed] = useState(false)
  return (
    <section
      aria-labelledby={headingId}
      className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <h2 id={headingId} className="text-lg font-semibold">
        Install & offline
      </h2>
      <p
        role="status"
        className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400"
      >
        {offlineMessages[pwa.status]}
      </p>
      {pwa.installed ? (
        <p className="mt-3 text-sm">This app is installed on your device.</p>
      ) : (
        <>
          <p className="mt-3 text-sm leading-6">
            Use your browser’s install option. On iPhone or iPad, open in
            Safari, tap Share, then Add to Home Screen. On desktop, look for
            Install app in the address bar or browser menu.
          </p>
          {pwa.canInstall ? (
            <button
              type="button"
              onClick={() => {
                setInstallFailed(false)
                void pwa.install().catch(() => setInstallFailed(true))
              }}
              className="mt-4 min-h-11 rounded-lg bg-emerald-700 px-4 py-2 font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              Install app
            </button>
          ) : null}
          {installFailed ? (
            <p role="alert" className="mt-3 text-sm">
              Installation could not start. Try your browser’s install option.
            </p>
          ) : null}
        </>
      )}
      {pwa.updateAvailable ? (
        <div className="mt-5 border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <p className="text-sm">
            An update is ready. Finish your work before reloading. Your local
            data will be kept.
          </p>
          <button
            type="button"
            onClick={pwa.update}
            className="mt-3 min-h-11 rounded-lg border border-zinc-400 px-4 py-2 font-medium focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            Update and reload
          </button>
        </div>
      ) : null}
    </section>
  )
}
