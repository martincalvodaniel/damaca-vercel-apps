import { ApplicationEditor } from "@/features/admin/components/application-editor"
import { ApplicationGrantForm } from "@/features/admin/components/application-grant-form"
import { ApplicationRequestReviewForm } from "@/features/admin/components/application-request-review-form"
import { OidcClientManager } from "@/features/admin/components/oidc-client-manager"
import type { ApplicationAdminData } from "@/types/access"

export function ApplicationAdminCard({ data }: { data: ApplicationAdminData }) {
  return (
    <section className="flex flex-col gap-5 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <ApplicationEditor application={data.app} />
      {data.app.publicAccess ? (
        <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100">
          Public application. Access requests, grants, and OIDC clients are
          disabled.
        </p>
      ) : (
        <OidcClientManager application={data.app} clients={data.oidcClients} />
      )}
      {!data.app.publicAccess ? (
        <div className="contents">
          <section
            aria-label={`Pending requests for ${data.app.name}`}
            className="border-t border-zinc-100 pt-4 dark:border-zinc-800"
          >
            <h3 className="text-base font-semibold">
              Pending requests{" "}
              <span className="text-sm font-normal text-zinc-500">
                ({data.requests.length})
              </span>
            </h3>
            {data.requests.length === 0 ? (
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                No pending requests.
              </p>
            ) : (
              <ul className="mt-3 flex flex-col gap-3">
                {data.requests.map((request) => (
                  <li
                    key={request.requestId}
                    className="grid min-w-0 gap-3 rounded-xl border border-zinc-200 p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center dark:border-zinc-700"
                  >
                    <div className="min-w-0">
                      <p className="break-all text-sm font-medium">
                        {request.email}
                      </p>
                      <time
                        className="text-xs text-zinc-500"
                        dateTime={request.requestedAt}
                      >
                        {new Date(request.requestedAt).toLocaleString("en")}
                      </time>
                    </div>
                    <ApplicationRequestReviewForm request={request} />
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section
            aria-label={`Access grants for ${data.app.name}`}
            className="border-t border-zinc-100 pt-4 dark:border-zinc-800"
          >
            <h3 className="text-base font-semibold">
              Authorized accounts{" "}
              <span className="text-sm font-normal text-zinc-500">
                ({data.grants.length})
              </span>
            </h3>
            <ApplicationGrantForm appId={data.app.id} />
            {data.grants.length === 0 ? (
              <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
                No user grants.
              </p>
            ) : (
              <ul className="mt-3 flex flex-col gap-2">
                {data.grants.map((grant) => (
                  <li
                    key={grant.email}
                    className="flex min-w-0 flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-200 px-3 py-2 dark:border-zinc-700"
                  >
                    <span className="break-all text-sm">{grant.email}</span>
                    <ApplicationGrantForm
                      appId={data.app.id}
                      email={grant.email}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      ) : null}
    </section>
  )
}
