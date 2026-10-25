import { OidcClientEnvironment } from "@/features/admin/components/oidc-client-environment"
import type { ApplicationEntry, OidcClientSummary } from "@/types/access"

export function OidcClientManager({
  application,
  clients,
}: {
  application: ApplicationEntry
  clients: OidcClientSummary[]
}) {
  return (
    <section
      aria-label={`OIDC clients for ${application.name}`}
      className="border-t border-zinc-100 pt-4 dark:border-zinc-800"
    >
      <h3 className="text-base font-semibold">OIDC clients</h3>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Each environment has one client. The secret is shown only at creation or
        rotation and must be stored in that application&apos;s environment.
      </p>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {(["production", "int"] as const).map((environment) => (
          <OidcClientEnvironment
            key={environment}
            appId={application.id}
            environment={environment}
            suggestedUrl={
              environment === "production"
                ? application.productionUrl
                : application.preproductionUrl
            }
            client={clients.find((entry) => entry.environment === environment)}
          />
        ))}
      </div>
    </section>
  )
}
