"use client"

import { useActionState } from "react"
import { ErrorBanner } from "@/components/ui/error-banner"
import { sendAccessRequest } from "@/features/auth/actions"
import { useLocale } from "@/lib/i18n/client"
import type { AccessActionState } from "@/types/access"

const initialState: AccessActionState = { status: "idle" }

export function RequestAccessForm() {
  const { t } = useLocale()
  const [state, action, pending] = useActionState(
    sendAccessRequest,
    initialState
  )
  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="operation" value="request" />
      <button
        type="submit"
        disabled={pending}
        className="min-h-9 rounded-lg bg-emerald-700 px-3 py-1 text-sm font-medium text-white hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:opacity-60"
      >
        {pending ? t.sending : t.requestAccess}
      </button>
      {state.status === "error" ? (
        <ErrorBanner>{t[state.code]}</ErrorBanner>
      ) : null}
      {state.status === "success" ? (
        <p
          role="status"
          className="text-sm text-emerald-700 dark:text-emerald-400"
        >
          {t[state.code]}
        </p>
      ) : null}
    </form>
  )
}
