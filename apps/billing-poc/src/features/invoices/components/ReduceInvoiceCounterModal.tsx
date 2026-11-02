"use client"

import { useId, useState } from "react"
import { ConfirmAction } from "@/components/ui/ConfirmAction"
import { ErrorBanner } from "@/components/ui/ErrorBanner"
import { Modal } from "@/components/ui/Modal"
import NumberStepperInput from "@/components/ui/NumberStepperInput"
import { FetchError } from "@/lib/client/swr-fetcher"
import {
  type InvoiceReductionPreviewSnapshot,
  usePreviewInvoiceCounter,
  useReduceInvoiceCounter,
} from "../hooks/useInvoiceCounterMutations"
import InvoiceRecordList from "./InvoiceRecordList"
import {
  formatInvoiceCounter,
  type InvoiceSeriesCounter,
} from "./invoice-counter-groups"

interface ReduceInvoiceCounterModalProps {
  counter: InvoiceSeriesCounter
  year: number
  onClose: () => void
  onPaymentClick: (paymentId: string) => void
  onSuccess: (preview: InvoiceReductionPreviewSnapshot) => void
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (
    error instanceof FetchError &&
    error.info &&
    typeof error.info === "object" &&
    "reason" in error.info
  ) {
    switch (error.info.reason) {
      case "counter-not-found":
        return "No existe un contador de facturas para esta serie y año."
      case "not-a-reduction":
        return "El nuevo número debe ser inferior al número actual."
      case "stale-preview":
        return "La numeración de facturas ha cambiado. Revisa el impacto de nuevo."
      case "payments-changed":
        return "Los pagos afectados han cambiado. Revisa el impacto de nuevo."
    }
  }
  return fallback
}

export default function ReduceInvoiceCounterModal({
  counter,
  year,
  onClose,
  onPaymentClick,
  onSuccess,
}: ReduceInvoiceCounterModalProps) {
  const inputId = useId()
  const [newLastNumber, setNewLastNumber] = useState(() =>
    String(Math.max(0, counter.lastNumber - 1))
  )
  const [error, setError] = useState<string | null>(null)
  const {
    trigger: previewReduction,
    data: previewResponse,
    isMutating: isPreviewing,
    reset: resetPreview,
  } = usePreviewInvoiceCounter()
  const { trigger: reduceCounter, isMutating: isReducing } =
    useReduceInvoiceCounter()
  const preview = previewResponse?.preview
  const isPending = isPreviewing || isReducing

  const handleClose = () => {
    if (!isPending) onClose()
  }

  const handleReview = async () => {
    setError(null)
    const parsedNumber = Number(newLastNumber)
    if (!Number.isInteger(parsedNumber) || parsedNumber < 0) {
      setError("Introduce un número entero igual o superior a cero.")
      return
    }
    if (parsedNumber >= counter.lastNumber) {
      setError(`Introduce un número inferior a ${counter.lastNumber}.`)
      return
    }

    try {
      await previewReduction({
        series: counter.series,
        year,
        newLastNumber: parsedNumber,
      })
    } catch (caught) {
      setError(
        getErrorMessage(
          caught,
          "No se pudo previsualizar la reducción de la numeración de facturas"
        )
      )
    }
  }

  const handleBack = () => {
    resetPreview()
    setError(null)
  }

  const handleConfirm = async () => {
    if (!preview) return
    setError(null)
    try {
      const result = await reduceCounter({
        series: preview.series,
        year: preview.year,
        newLastNumber: preview.newLastNumber,
        expectedCurrentNumber: preview.currentNumber,
      })
      onSuccess(result.preview)
    } catch (caught) {
      if (caught instanceof FetchError && caught.status === 409) {
        resetPreview()
      }
      setError(
        getErrorMessage(caught, "No se pudo reducir la numeración de facturas")
      )
    }
  }

  return (
    <Modal
      isOpen
      onClose={handleClose}
      title={`Reducir ${counter.label} — ${year}`}
      maxWidth="xl"
      headerActions={
        <>
          {preview ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={isPending}
              aria-label="Volver"
              title="Volver"
              className="rounded p-1.5 text-zinc-600 focus-visible:ring-2 dark:text-zinc-300"
            >
              ←
            </button>
          ) : null}
          {preview ? (
            <ConfirmAction
              onClick={handleConfirm}
              isPending={isPending}
              label="Eliminar facturas y reducir"
              pendingLabel="Reduciendo…"
            />
          ) : (
            <ConfirmAction
              onClick={handleReview}
              isPending={isPending}
              label="Revisar el impacto"
              pendingLabel="Revisando…"
            />
          )}
        </>
      }
    >
      <div className="space-y-4">
        {error ? <ErrorBanner>{error}</ErrorBanner> : null}

        {preview ? (
          <>
            <div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
              Esta acción elimina de forma permanente las referencias de
              facturas indicadas a continuación. Los pagos afectados se
              conservan.
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-md bg-zinc-100 p-3 dark:bg-zinc-800">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Nuevo número
                </p>
                <p className="mt-1 font-mono text-xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                  {formatInvoiceCounter(preview.newLastNumber)}
                </p>
              </div>
              <div className="rounded-md bg-zinc-100 p-3 dark:bg-zinc-800">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Facturas eliminadas
                </p>
                <p className="mt-1 text-xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                  {preview.invoices.length}
                </p>
              </div>
              <div className="rounded-md bg-zinc-100 p-3 dark:bg-zinc-800">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Pagos afectados
                </p>
                <p className="mt-1 text-xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                  {preview.affectedPaymentCount}
                </p>
              </div>
            </div>
            <div className="overflow-hidden rounded-md border border-zinc-200 dark:border-zinc-700">
              <InvoiceRecordList
                invoices={preview.invoices}
                emptyMessage="No se verán afectadas las referencias de facturas ni los pagos; solo cambiará el contador."
                onPaymentClick={onPaymentClick}
              />
            </div>
          </>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-zinc-600 dark:text-zinc-300">
              El número actual es {formatInvoiceCounter(counter.lastNumber)}.
              Elige un valor inferior para revisar qué facturas y pagos se verán
              afectados antes de confirmar.
            </p>
            <div>
              <label
                htmlFor={inputId}
                className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-200"
              >
                Nuevo número
              </label>
              <NumberStepperInput
                id={inputId}
                value={newLastNumber}
                onValueChange={setNewLastNumber}
                ariaLabel="nuevo número de factura"
                min={0}
                max={counter.lastNumber - 1}
                step={1}
                disabled={isPending}
                required
              />
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
