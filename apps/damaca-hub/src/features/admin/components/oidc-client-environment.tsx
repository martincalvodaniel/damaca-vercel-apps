"use client"

import { useActionState } from "react"
import { manageHubOidcClient } from "@/features/hub/actions"
import type { OidcActionState } from "@/schemas/oidc"
import type { OidcClientSummary } from "@/types/access"

const initialState: OidcActionState = { status: "idle", message: "" }
const callbackPath = "/api/auth/callback/damaca-hub"

function suggestedCallback(url: string | null) {
  if (!url) return ""
  try {
    return `${new URL(url).origin}${callbackPath}`
  } catch {
    return ""
  }
}

export function OidcClientEnvironment({
  appId,
  environment,
  suggestedUrl,
  client,
}: {
  appId: string
  environment: "production" | "int"
  suggestedUrl: string | null
  client?: OidcClientSummary
}) {
  const [state, action, pending] = useActionState(
    manageHubOidcClient,
    initialState
  )
  const callback = client?.redirectUri ?? suggestedCallback(suggestedUrl)
  return (
    <form
      action={action}
      className="min-w-0 rounded-xl border border-zinc-200 p-4 dark:border-zinc-700"
    >
      <input type="hidden" name="appId" value={appId} />
      <input type="hidden" name="environment" value={environment} />
      <input type="hidden" name="clientId" value={client?.clientId ?? ""} />
      <input type="hidden" name="revision" value={client?.revision ?? 0} />
      <h4 className="font-medium">
        {environment === "int" ? "int preview" : "Production"}
      </h4>
      {client ? (
        <p className="mt-1 break-all text-xs text-zinc-500">
          Client ID: {client.clientId}
        </p>
      ) : null}
      <label
        className="mt-3 block text-sm font-medium"
        htmlFor={`${appId}-${environment}-redirect`}
      >
        Exact callback URL
      </label>
      <input
        id={`${appId}-${environment}-redirect`}
        name="redirectUri"
        type="url"
        required
        defaultValue={callback}
        placeholder={`https://app.example.com${callbackPath}`}
        className="mt-1 min-h-11 w-full rounded-lg border border-zinc-300 bg-transparent px-3 text-sm dark:border-zinc-700"
      />
      <p className="mt-1 text-xs text-zinc-500">
        The callback must match the deployed app URL and end in {callbackPath}.
        Stable branch aliases work; per-commit preview URLs require separate
        registration.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="submit"
          name="operation"
          value={client ? "update" : "create"}
          disabled={pending}
          className="min-h-10 rounded-lg bg-emerald-700 px-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {client ? "Save callback" : "Create client"}
        </button>
        {client ? (
          <>
            <button
              type="submit"
              name="operation"
              value={client.enabled ? "disable" : "enable"}
              disabled={pending}
              className="min-h-10 rounded-lg border px-3 text-sm disabled:opacity-60"
            >
              {client.enabled ? "Disable" : "Enable"}
            </button>
            <button
              type="submit"
              name="operation"
              value="rotate"
              disabled={pending}
              className="min-h-10 rounded-lg border px-3 text-sm disabled:opacity-60"
            >
              Rotate secret
            </button>
          </>
        ) : null}
      </div>
      {state.message ? (
        <p
          role={state.status === "error" ? "alert" : "status"}
          className="mt-3 text-sm"
        >
          {state.message}
        </p>
      ) : null}
      {state.clientSecret ? (
        <label className="mt-3 block text-sm font-medium">
          Copy this client secret now
          <input
            readOnly
            value={state.clientSecret}
            className="mt-1 min-h-11 w-full select-all rounded-lg border border-zinc-300 bg-zinc-50 px-3 font-mono text-xs dark:border-zinc-700 dark:bg-zinc-950"
          />
        </label>
      ) : null}
    </form>
  )
}
