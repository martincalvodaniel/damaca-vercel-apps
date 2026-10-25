import Link from "next/link"
import { AccessRequestForm } from "@/features/home/components/access-request-form"
import type { ApplicationEntry } from "@/types/access"

export function ApplicationCard({
  application,
  isAdmin,
}: {
  application: ApplicationEntry
  isAdmin: boolean
}) {
  const canUsePreproduction =
    application.publicAccess ||
    isAdmin ||
    application.accessStatus === "approved"
  const statusLabel = application.publicAccess
    ? "Public access"
    : isAdmin
      ? "Administrator"
      : application.accessStatus === "approved"
        ? "Access approved"
        : application.accessStatus === "pending"
          ? "Request pending"
          : application.accessStatus === "rejected"
            ? "Request rejected"
            : application.accessStatus === "revoked"
              ? "Access revoked"
              : "No access yet"

  return (
    <article className="flex h-full flex-col rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            {application.name}
          </h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            {application.description}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
          {statusLabel}
        </span>
      </div>
      {!application.publicAccess ? (
        <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
          This application manages access independently.
        </p>
      ) : null}
      <div className="mt-5 flex flex-wrap gap-2">
        {application.productionUrl ? (
          <Link
            href={application.productionUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center rounded-lg bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
          >
            Open production
          </Link>
        ) : (
          <span className="inline-flex min-h-11 items-center rounded-lg border border-dashed border-zinc-300 px-4 text-sm text-zinc-500 dark:border-zinc-700">
            Production link not configured
          </span>
        )}
        {canUsePreproduction ? (
          application.preproductionUrl ? (
            <Link
              href={application.preproductionUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center rounded-lg border border-zinc-300 px-4 text-sm font-medium hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              Open preproduction
            </Link>
          ) : (
            <span className="inline-flex min-h-11 items-center rounded-lg border border-dashed border-zinc-300 px-4 text-sm text-zinc-500 dark:border-zinc-700">
              Preproduction link not configured
            </span>
          )
        ) : null}
      </div>
      {!application.publicAccess &&
      !isAdmin &&
      application.accessStatus !== "approved" ? (
        <div className="mt-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
          <AccessRequestForm
            appId={application.id}
            status={application.accessStatus}
          />
        </div>
      ) : null}
    </article>
  )
}
