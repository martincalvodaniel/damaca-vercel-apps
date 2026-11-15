"use client"

import { useActionState, useId } from "react"
import { ErrorBanner } from "@/components/ui/error-banner"
import { IconButton } from "@/components/ui/icon-button"
import { changeUserAccess } from "@/features/admin/actions"
import { useLocale } from "@/lib/i18n/client"
import { useFormValidation } from "@/lib/i18n/form-validation"
import { formatMessage } from "@/lib/i18n/messages"
import type { AccessActionState } from "@/types/access"

interface AccessFormProps {
  email?: string
}

const initialState: AccessActionState = { status: "idle" }

export function AccessForm({ email }: AccessFormProps) {
  const { t } = useLocale()
  const formValidation = useFormValidation()
  const [state, action, pending] = useActionState(
    changeUserAccess,
    initialState
  )
  const emailId = useId()
  const isRevoke = email !== undefined

  return (
    <form
      {...formValidation}
      action={action}
      className="flex min-w-0 flex-col gap-3"
    >
      <input
        type="hidden"
        name="operation"
        value={isRevoke ? "revoke" : "grant"}
      />
      {isRevoke ? (
        <input type="hidden" name="email" value={email} />
      ) : (
        <div className="flex flex-col gap-2">
          <label htmlFor={emailId} className="text-sm font-medium">
            {t.googleEmail}
          </label>
          <input
            id={emailId}
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            placeholder="user@example.com"
            className="min-h-9 min-w-0 rounded-lg border border-zinc-300 bg-transparent px-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:border-zinc-700"
          />
        </div>
      )}
      <IconButton
        type="submit"
        disabled={pending}
        icon={isRevoke ? "close" : "check"}
        label={
          isRevoke ? formatMessage(t.revokeAccessFor, { email }) : t.grantAccess
        }
        tone={isRevoke ? "danger" : "primary"}
        className="self-start"
      />
      {pending ? (
        <p role="status" className="text-sm">
          {t.saving}
        </p>
      ) : null}
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
