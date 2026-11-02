"use client"
import dynamic from "next/dynamic"
import { useRouter, useSearchParams } from "next/navigation"
import { useMemo, useState } from "react"
import PageLayout from "@/components/shared/PageLayout"
import AddButton from "@/components/ui/AddButton"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { EmptyState } from "@/components/ui/EmptyState"
import { ErrorBanner } from "@/components/ui/ErrorBanner"
import Toast from "@/components/ui/Toast"
import { useClientsByIds } from "@/features/clients/hooks/useClientsByIds"
import { useDeleteCommission } from "@/features/commissions/hooks/useCommissionMutations"
import {
  useCommission,
  useCommissions,
} from "@/features/commissions/hooks/useCommissions"
import { extractErrorMessage } from "@/features/events/components/attendeesPanel-utils"
import FiringTemplatesPanel from "@/features/firings/components/FiringTemplatesPanel"
import { usePayment } from "@/features/payments/hooks/usePayments"
import {
  type Commission,
  partitionCommissions,
} from "@/lib/domain/entities/commission"
import CommissionCard from "./CommissionCard"
import CommissionFormModal from "./CommissionFormModal"
import { useCommissionScope } from "./CommissionScope"

const PaymentDetailModal = dynamic(
  () => import("@/features/payments/components/month/PaymentDetailModal"),
  { ssr: false }
)

export default function CommissionsPageContent() {
  const { resource, isFiring, singular, plural, title } = useCommissionScope()
  const router = useRouter()
  const params = useSearchParams()
  const requestedId = params.get("commissionId")
  const { commissions, error: listError, isLoading } = useCommissions()
  const { commission: requestedCommission, error: detailError } =
    useCommission(requestedId)
  const [editing, setEditing] = useState<Commission | null>(null)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<Commission | null>(null)
  const [paymentId, setPaymentId] = useState<string | null>(null)
  const {
    payment,
    error: paymentError,
    isLoading: paymentLoading,
  } = usePayment(paymentId)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const remove = useDeleteCommission()
  const clientIds = useMemo(
    () =>
      commissions.flatMap((commission) =>
        commission.clientId ? [commission.clientId] : []
      ),
    [commissions]
  )
  const { clients, error: clientsError } = useClientsByIds(clientIds)
  const names = useMemo(
    () => new Map(clients.map((client) => [client._id, client.name])),
    [clients]
  )
  const { withoutPayment, withPayment } = useMemo(
    () => partitionCommissions(commissions),
    [commissions]
  )
  const current = editing ?? (requestedId ? requestedCommission : undefined)
  const closeEditor = () => {
    setEditing(null)
    setCreating(false)
    if (requestedId) router.replace(`/${resource}`)
  }
  const notify = (text: string) => {
    setError(null)
    setMessage(text)
  }
  const confirmDelete = async () => {
    if (!deleting?._id) return
    try {
      await remove.trigger({ id: deleting._id })
      setDeleting(null)
      notify(
        `Se eliminó ${isFiring ? "la cocción" : "el encargo"} y se conservó su pago.`
      )
    } catch (error) {
      setError(
        extractErrorMessage(
          error,
          `No se pudo eliminar ${isFiring ? "la cocción" : "el encargo"}`
        )
      )
    }
  }
  function openCreate() {
    if (requestedId) router.replace(`/${resource}`)
    setCreating(true)
    setEditing(null)
  }
  function dismissMessage() {
    setMessage(null)
  }
  function saved(message: string) {
    closeEditor()
    notify(message)
  }
  function closeDelete() {
    setDeleting(null)
    setError(null)
  }
  function submitDelete() {
    void confirmDelete()
  }
  function openDelete(commission: Commission) {
    setError(null)
    setDeleting(commission)
  }
  function openEditorPayment(id: string) {
    closeEditor()
    setPaymentId(id)
  }
  function closePayment() {
    setPaymentId(null)
  }
  function paymentDeleted() {
    setPaymentId(null)
    notify("Pago eliminado")
  }
  function renderCommission(commission: Commission) {
    return (
      <CommissionCard
        key={commission._id}
        commission={commission}
        isOpeningPayment={paymentLoading && paymentId === commission.paymentId}
        clientName={names.get(commission.clientId)}
        onEdit={setEditing}
        onDelete={openDelete}
        onOpenPayment={setPaymentId}
        onError={setError}
        onSuccess={notify}
      />
    )
  }
  const displayError =
    error ??
    (listError
      ? extractErrorMessage(
          listError,
          `No se pudieron cargar ${isFiring ? "las" : "los"} ${plural}`
        )
      : detailError
        ? extractErrorMessage(
            detailError,
            `No se encontró ${isFiring ? "la cocción" : "el encargo"}`
          )
        : paymentError
          ? extractErrorMessage(paymentError, "No se pudo cargar el pago")
          : clientsError
            ? "No se pudieron cargar los nombres de los clientes"
            : null)
  return (
    <PageLayout
      navigationSubtitle={title}
      navigationActions={
        <AddButton
          ariaLabel={`Añadir ${singular}`}
          title={isFiring ? "Nueva cocción" : "Nuevo encargo"}
          onClick={openCreate}
        />
      }
      headerContent={
        isFiring ? <FiringTemplatesPanel onSuccess={notify} /> : null
      }
    >
      {message ? <Toast message={message} onClose={dismissMessage} /> : null}
      {displayError ? <ErrorBanner>{displayError}</ErrorBanner> : null}
      {isLoading ? (
        <p role="status" className="p-4 text-zinc-600 dark:text-zinc-300">
          Cargando {plural}…
        </p>
      ) : null}
      {paymentLoading ? (
        <p role="status" className="p-4 text-zinc-600 dark:text-zinc-300">
          Abriendo pago…
        </p>
      ) : null}
      {!isLoading && withoutPayment.length === 0 ? (
        <EmptyState variant="card">
          {withPayment.length
            ? `No hay ${plural} pendientes de pago.`
            : `Todavía no hay ${plural}. Añade ${isFiring ? "una" : "uno"} para empezar.`}
        </EmptyState>
      ) : null}
      <div className="space-y-3">{withoutPayment.map(renderCommission)}</div>
      <details className="rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <summary className="cursor-pointer rounded-lg px-4 py-3 text-sm font-semibold text-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-zinc-100">
          {isFiring ? "Pagadas" : "Pagados"} ({withPayment.length})
        </summary>
        <div className="space-y-3 border-t border-zinc-200 p-3 dark:border-zinc-800">
          {withPayment.length ? (
            withPayment.map(renderCommission)
          ) : (
            <EmptyState>No hay {plural} con pago.</EmptyState>
          )}
        </div>
      </details>
      {(creating || current) && !current?.paymentGeneration ? (
        <CommissionFormModal
          key={creating ? "new" : current?._id}
          commission={creating ? undefined : current}
          onClose={closeEditor}
          onSaved={saved}
          onOpenPayment={openEditorPayment}
        />
      ) : null}
      <ConfirmDialog
        isOpen={Boolean(deleting)}
        title={`Eliminar ${singular}`}
        confirmLabel="Eliminar"
        pendingLabel="Eliminando…"
        variant="danger"
        isPending={remove.isMutating}
        error={error}
        onCancel={closeDelete}
        onConfirm={submitDelete}
      >
        <p className="text-sm text-zinc-700 dark:text-zinc-300">
          ¿Eliminar «{deleting?.title}»? Esta acción no se puede deshacer. Se
          conservará cualquier pago vinculado.
        </p>
      </ConfirmDialog>
      {paymentId && payment?._id === paymentId ? (
        <PaymentDetailModal
          key={payment._id}
          payment={payment}
          onClose={closePayment}
          onDelete={paymentDeleted}
        />
      ) : null}
    </PageLayout>
  )
}
