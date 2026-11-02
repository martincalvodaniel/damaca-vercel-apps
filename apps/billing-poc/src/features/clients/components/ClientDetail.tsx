"use client"
import Link from "next/link"
import { useState } from "react"
import PageLayout from "@/components/shared/PageLayout"
import { EmptyState } from "@/components/ui/EmptyState"
import { ErrorBanner } from "@/components/ui/ErrorBanner"
import { IconButton } from "@/components/ui/IconButton"
import { PencilIcon } from "@/components/ui/icons/PencilIcon"
import { useClientActivity } from "@/features/clients/hooks/useClientActivity"
import { FetchError } from "@/lib/client/swr-fetcher"
import ClientActivitySections from "./ClientActivitySections"
import ClientFinancialSummary from "./ClientFinancialSummary"
import ClientFormModal from "./ClientFormModal"

export default function ClientDetail({ id }: { id: string }) {
  const { data, error, isLoading } = useClientActivity(id)
  const [isEditing, setIsEditing] = useState(false)
  const openEditor = () => setIsEditing(true)
  const closeEditor = () => setIsEditing(false)
  return (
    <PageLayout navigationSubtitle={data?.client.name ?? "Cliente"}>
      <Link
        href="/clients"
        className="inline-block rounded text-sm text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-blue-400"
      >
        Volver a clientes
      </Link>
      {isLoading ? (
        <p role="status" className="text-zinc-600 dark:text-zinc-300">
          Cargando cliente…
        </p>
      ) : null}
      {error ? (
        <ErrorBanner>
          {error instanceof FetchError &&
          (error.status === 404 || error.status === 400)
            ? "Cliente no encontrado."
            : "No se pudieron cargar los datos del cliente. Inténtalo de nuevo."}
        </ErrorBanner>
      ) : null}
      {data ? (
        <>
          <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-start justify-between gap-4">
              <h1 className="min-w-0 break-words text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                {data.client.name}
              </h1>
              <IconButton
                onClick={openEditor}
                ariaLabel="Editar cliente"
                title="Editar cliente"
              >
                <PencilIcon />
              </IconButton>
            </div>
            <dl className="mt-4 grid gap-4 text-sm text-zinc-900 sm:grid-cols-2 dark:text-zinc-100">
              {[
                [
                  "Tipo",
                  data.client.clientType === "company"
                    ? "Empresa"
                    : "Persona física / autónomo",
                ],
                ["NIF / CIF", data.client.taxId],
                ["Dirección", data.client.address],
                ["Teléfono", data.client.phone],
                ["Correo electrónico", data.client.email],
                ["Instagram", data.client.instagram],
              ].map(([label, value]) => (
                <div key={label} className="min-w-0">
                  <dt className="font-medium text-zinc-500 dark:text-zinc-400">
                    {label}
                  </dt>
                  <dd className="whitespace-pre-line break-words">
                    {value || "—"}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
          <ClientFinancialSummary payments={data.payments} />
          {!data.payments.length ? (
            <EmptyState>Este cliente todavía no tiene pagos.</EmptyState>
          ) : null}
          <ClientActivitySections activity={data} />
          <ClientFormModal
            client={data.client}
            isOpen={isEditing}
            onClose={closeEditor}
          />
        </>
      ) : null}
    </PageLayout>
  )
}
