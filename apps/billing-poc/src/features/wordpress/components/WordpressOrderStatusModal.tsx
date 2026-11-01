"use client"
import { useEffect, useId, useState } from "react"
import { ConfirmAction } from "@/components/ui/ConfirmAction"
import { Modal } from "@/components/ui/Modal"
import { useUpdateWordpressOrderStatus } from "@/features/wordpress/hooks/useWordpressOrderMutations"
import { useStableCallback } from "@/hooks/useStableCallback"
import {
  WORDPRESS_ORDER_STATUSES,
  type WordPressOrder,
  type WordPressOrderStatus,
} from "@/lib/domain/entities/wordpress-order"
import { extractApiError } from "./wordpress-view-utils"

interface WordpressOrderStatusModalProps {
  order: WordPressOrder | null
  onClose: () => void
  onConfirmed?: (message: string) => void
}
const WORDPRESS_ORDER_STATUS_LABELS: Record<WordPressOrderStatus, string> = {
  pending: "Pendiente de pago",
  processing: "En proceso",
  "on-hold": "En espera",
  completed: "Completado",
  cancelled: "Cancelado",
  refunded: "Reembolsado",
  failed: "Fallido",
}
export function WordpressOrderStatusModal({
  order,
  onClose,
  onConfirmed,
}: WordpressOrderStatusModalProps) {
  const handleStatusChange = useStableCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedStatus(event.target.value as WordPressOrderStatus)
    }
  )
  const handleConfirmClick = useStableCallback(() => {
    void handleConfirm()
  })
  const { trigger, isMutating, error, reset } = useUpdateWordpressOrderStatus()
  const statusSelectId = useId()
  const [selectedStatus, setSelectedStatus] =
    useState<WordPressOrderStatus>("completed")
  useEffect(() => {
    if (!order) return
    setSelectedStatus("completed")
  }, [order])
  const handleClose = useStableCallback(() => {
    if (isMutating) return
    reset()
    onClose()
  })
  const handleConfirm = async () => {
    if (!order) return
    try {
      await trigger({ orderId: order.id, status: selectedStatus })
      onConfirmed?.(
        `Pedido n.º ${order.id} marcado como ${WORDPRESS_ORDER_STATUS_LABELS[selectedStatus]}`
      )
      reset()
      onClose()
    } catch {
      // The mutation hook exposes the error so the modal can show it inline.
    }
  }
  return (
    <Modal
      isOpen={order !== null}
      onClose={handleClose}
      title={
        order ? `Cambiar estado del pedido n.º ${order.id}` : "Cambiar estado"
      }
      headerActions={
        <ConfirmAction
          onClick={handleConfirmClick}
          isPending={isMutating}
          label="Actualizar estado"
          pendingLabel="Actualizando..."
        />
      }
    >
      {order ? (
        <div className="space-y-4 text-sm text-zinc-700 dark:text-zinc-300">
          <div className="space-y-2">
            <label
              htmlFor={statusSelectId}
              className="block text-sm font-medium text-zinc-900 dark:text-zinc-100"
            >
              Status
            </label>
            <select
              id={statusSelectId}
              value={selectedStatus}
              onChange={handleStatusChange}
              disabled={isMutating}
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:ring-offset-zinc-900"
            >
              {WORDPRESS_ORDER_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {WORDPRESS_ORDER_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </div>

          {error ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
              {extractApiError(
                error,
                "No se pudo actualizar el pedido de WordPress"
              )}
            </p>
          ) : null}
        </div>
      ) : null}
    </Modal>
  )
}
