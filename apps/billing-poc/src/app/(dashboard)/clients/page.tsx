"use client"
import { useCallback, useState } from "react"
import ClientQueryInput from "@/components/shared/ClientQueryInput"
import PageLayout from "@/components/shared/PageLayout"
import AddButton from "@/components/ui/AddButton"
import { EmptyState } from "@/components/ui/EmptyState"
import { ErrorBanner } from "@/components/ui/ErrorBanner"
import ClientForm from "@/features/clients/components/ClientForm"
import ClientList from "@/features/clients/components/ClientList"
import PaginationControls from "@/features/clients/components/PaginationControls"
import { useCreateClient } from "@/features/clients/hooks/useClientMutations"
import { useClients } from "@/features/clients/hooks/useClients"
import { FetchError } from "@/lib/client/swr-fetcher"
import type { ClientFormData } from "@/lib/domain/entities/client"

const PAGE_SIZE = 10

function extractApiError(err: unknown, fallback: string): string {
  if (
    err instanceof FetchError &&
    err.info &&
    typeof err.info === "object" &&
    "error" in err.info &&
    typeof (err.info as { error: unknown }).error === "string"
  ) {
    return (err.info as { error: string }).error
  }
  if (err instanceof Error) {
    return err.message
  }
  return fallback
}
export default function ClientsPage() {
  const handleShowFormChange = () => setShowForm(false)
  const toggleCreateForm = () => setShowForm(!showForm)
  const [searchInputValue, setSearchInputValue] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const {
    data,
    clients,
    isLoading,
    error: fetchError,
  } = useClients({ search: searchQuery, page, pageSize: PAGE_SIZE })
  const { trigger: createClient } = useCreateClient()
  const pagination = data?.pagination
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
    setPage(1) // Reset to page 1 on search
  }, [])
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage)
  }, [])
  const handleCreateClient = async (formData: ClientFormData) => {
    try {
      await createClient(formData)
    } catch (err) {
      throw new Error(extractApiError(err, "No se pudo crear el cliente"))
    }
    setShowForm(false)
    setPage(1) // Reset to page 1 after create
  }
  const errorMessage =
    fetchError instanceof Error
      ? fetchError.message
      : fetchError
        ? "No se pudieron cargar los clientes"
        : null
  return (
    <PageLayout
      navigationSubtitle="Clientes"
      navigationActions={
        <div className="flex items-center gap-2">
          <AddButton ariaLabel="Añadir cliente" onClick={toggleCreateForm} />
          <div className="min-w-0 flex-1">
            <ClientQueryInput
              value={searchInputValue}
              onChange={setSearchInputValue}
              onDebouncedChange={handleSearch}
              skipInitialDebouncedChange
            />
          </div>
        </div>
      }
    >
      {errorMessage ? <ErrorBanner bordered>{errorMessage}</ErrorBanner> : null}

      <div className="space-y-4">
        {showForm ? (
          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Nuevo cliente
            </h3>
            <ClientForm
              onSubmit={handleCreateClient}
              onCancel={handleShowFormChange}
            />
          </div>
        ) : null}
      </div>

      {isLoading && clients.length === 0 ? (
        <EmptyState variant="card">Cargando clientes...</EmptyState>
      ) : (
        <>
          <ClientList clients={clients} />

          {pagination && pagination.total > 0 ? (
            <div className="flex justify-center">
              <PaginationControls
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                total={pagination.total}
                pageSize={pagination.pageSize}
                hasPrevPage={pagination.hasPrevPage}
                hasNextPage={pagination.hasNextPage}
                onPageChange={handlePageChange}
              />
            </div>
          ) : null}
        </>
      )}
    </PageLayout>
  )
}
