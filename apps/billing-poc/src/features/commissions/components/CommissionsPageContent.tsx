"use client"
import dynamic from "next/dynamic"
import { useRouter, useSearchParams } from "next/navigation"
import { useMemo, useState } from "react"
import PageLayout from "@/components/shared/PageLayout"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { ErrorBanner } from "@/components/ui/ErrorBanner"
import Toast from "@/components/ui/Toast"
import { useClientsByIds } from "@/features/clients/hooks/useClientsByIds"
import { useDeleteCommission } from "@/features/commissions/hooks/useCommissionMutations"
import {
  useCommission,
  useCommissions,
} from "@/features/commissions/hooks/useCommissions"
import { extractErrorMessage } from "@/features/events/components/attendeesPanel-utils"
import { usePayment } from "@/features/payments/hooks/usePayments"
import {
  type Commission,
  sortCommissions,
} from "@/lib/domain/entities/commission"
import CommissionCard from "./CommissionCard"
import CommissionFormModal from "./CommissionFormModal"
import { commissionButtonClass } from "./commission-ui"

const PaymentDetailModal = dynamic(
  () => import("@/features/payments/components/month/PaymentDetailModal"),
  { ssr: false }
)

export default function CommissionsPageContent() {
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
  const ordered = useMemo(() => sortCommissions(commissions), [commissions])
  const current = editing ?? (requestedId ? requestedCommission : undefined)
  const closeEditor = () => {
    setEditing(null)
    setCreating(false)
    if (requestedId) router.replace("/commissions")
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
      notify("Commission deleted. Its payment was preserved.")
    } catch (error) {
      setError(extractErrorMessage(error, "Failed to delete commission"))
    }
  }
  function openCreate() {
    if (requestedId) router.replace("/commissions")
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
  function closePayment() {
    setPaymentId(null)
  }
  function paymentDeleted() {
    setPaymentId(null)
    notify("Payment deleted")
  }
  const displayError =
    error ??
    (listError
      ? extractErrorMessage(listError, "Failed to load commissions")
      : detailError
        ? extractErrorMessage(detailError, "Commission not found")
        : paymentError
          ? extractErrorMessage(paymentError, "Failed to load payment")
          : clientsError
            ? "Client names could not be loaded"
            : null)
  return (
    <PageLayout
      navigationSubtitle="Commissions"
      headerContent={
        <div className="flex items-center justify-between gap-3 py-3">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Commissions
          </h1>
          <button
            type="button"
            className={commissionButtonClass}
            onClick={openCreate}
          >
            New commission
          </button>
        </div>
      }
    >
      {message ? <Toast message={message} onClose={dismissMessage} /> : null}
      {displayError ? <ErrorBanner>{displayError}</ErrorBanner> : null}
      {isLoading ? (
        <p role="status" className="p-4 text-zinc-600 dark:text-zinc-300">
          Loading commissions…
        </p>
      ) : null}
      {paymentLoading ? (
        <p role="status" className="p-4 text-zinc-600 dark:text-zinc-300">
          Opening payment…
        </p>
      ) : null}
      {!isLoading && ordered.length === 0 ? (
        <p className="rounded-lg border border-zinc-200 p-6 text-zinc-600 dark:border-zinc-800 dark:text-zinc-300">
          No commissions yet. Create one to get started.
        </p>
      ) : null}
      <div className="space-y-3">
        {ordered.map((commission) => (
          <CommissionCard
            key={commission._id}
            commission={commission}
            clientName={names.get(commission.clientId)}
            onEdit={setEditing}
            onDelete={openDelete}
            onOpenPayment={setPaymentId}
            onError={setError}
            onSuccess={notify}
          />
        ))}
      </div>
      {(creating || current) && !current?.paymentGeneration ? (
        <CommissionFormModal
          key={creating ? "new" : current?._id}
          commission={creating ? undefined : current}
          onClose={closeEditor}
          onSaved={saved}
        />
      ) : null}
      <ConfirmDialog
        isOpen={Boolean(deleting)}
        title="Delete commission"
        confirmLabel="Delete"
        pendingLabel="Deleting…"
        variant="danger"
        isPending={remove.isMutating}
        error={error}
        onCancel={closeDelete}
        onConfirm={submitDelete}
      >
        <p className="text-sm text-zinc-700 dark:text-zinc-300">
          Delete “{deleting?.title}”? This cannot be undone. Any linked payment
          will be preserved.
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
