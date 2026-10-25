"use client"

import { useActionState, useId } from "react"
import { ErrorBanner } from "@/components/ui/error-banner"
import { saveHubApplication } from "@/features/hub/actions"
import type { AccessActionState, ApplicationEntry } from "@/types/access"

const initialState: AccessActionState = { status: "idle", message: "" }

export function ApplicationEditor({
  application,
}: {
  application: ApplicationEntry
}) {
  const [state, action, pending] = useActionState(
    saveHubApplication,
    initialState
  )
  const id = useId()
  return (
    <form action={action} className="grid gap-3 sm:grid-cols-2">
      <input type="hidden" name="id" value={application.id} />
      <label
        htmlFor={`${id}-name`}
        className="flex flex-col gap-1 text-sm font-medium"
      >
        Application name
        <input
          id={`${id}-name`}
          name="name"
          required
          maxLength={80}
          defaultValue={application.name}
          className="min-h-11 rounded-lg border border-zinc-300 bg-transparent px-3 font-normal dark:border-zinc-700"
        />
      </label>
      <label
        htmlFor={`${id}-description`}
        className="flex flex-col gap-1 text-sm font-medium"
      >
        Description
        <input
          id={`${id}-description`}
          name="description"
          required
          maxLength={240}
          defaultValue={application.description}
          className="min-h-11 rounded-lg border border-zinc-300 bg-transparent px-3 font-normal dark:border-zinc-700"
        />
      </label>
      <label
        htmlFor={`${id}-production`}
        className="flex flex-col gap-1 text-sm font-medium"
      >
        Production URL
        <input
          id={`${id}-production`}
          name="productionUrl"
          type="url"
          placeholder="https://example.com"
          defaultValue={application.productionUrl ?? ""}
          className="min-h-11 rounded-lg border border-zinc-300 bg-transparent px-3 font-normal dark:border-zinc-700"
        />
      </label>
      <label
        htmlFor={`${id}-preproduction`}
        className="flex flex-col gap-1 text-sm font-medium"
      >
        Preproduction URL
        <input
          id={`${id}-preproduction`}
          name="preproductionUrl"
          type="url"
          placeholder="https://preview.example.com"
          defaultValue={application.preproductionUrl ?? ""}
          className="min-h-11 rounded-lg border border-zinc-300 bg-transparent px-3 font-normal dark:border-zinc-700"
        />
      </label>
      <label
        htmlFor={`${id}-order`}
        className="flex flex-col gap-1 text-sm font-medium"
      >
        Display order
        <input
          id={`${id}-order`}
          name="order"
          type="number"
          min={0}
          max={999}
          required
          defaultValue={application.order}
          className="min-h-11 rounded-lg border border-zinc-300 bg-transparent px-3 font-normal dark:border-zinc-700"
        />
      </label>
      <input type="hidden" name="active" value="false" />
      <label
        htmlFor={`${id}-active`}
        className="flex items-center gap-2 text-sm font-medium"
      >
        <input
          id={`${id}-active`}
          name="active"
          type="checkbox"
          value="true"
          defaultChecked={application.active}
          className="size-5 accent-emerald-700"
        />
        Application is active
      </label>
      <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="min-h-11 rounded-lg bg-zinc-900 px-4 text-sm font-semibold text-white hover:bg-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60 dark:bg-white dark:text-zinc-900"
        >
          {pending ? "Saving…" : "Save application"}
        </button>
        {state.status === "success" ? (
          <p
            role="status"
            className="text-sm text-emerald-700 dark:text-emerald-400"
          >
            {state.message}
          </p>
        ) : null}
        {state.status === "error" ? (
          <ErrorBanner>{state.message}</ErrorBanner>
        ) : null}
      </div>
    </form>
  )
}
