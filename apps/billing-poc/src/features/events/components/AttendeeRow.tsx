"use client"
import { useEffect, useRef, useState } from "react"
import PaymentActions from "@/components/shared/PaymentActions"
import { IconButton } from "@/components/ui/IconButton"
import { TrashIcon } from "@/components/ui/icons/TrashIcon"
import NumberStepperInput from "@/components/ui/NumberStepperInput"
import type { EventAttendee } from "@/lib/domain/entities/event"
import type { PaymentMethod } from "@/lib/domain/entities/payment"

interface AttendeeRowProps {
  rowIdPrefix: string
  attendee: EventAttendee
  name: string
  isSaving: boolean
  isGenerating: boolean
  hasPayment: boolean
  isOpeningPayment?: boolean
  onCommit: (
    attendee: EventAttendee,
    nextSeats: string,
    revert: () => void
  ) => Promise<void>
  onGenerate: (clientId: string, paymentMethod: PaymentMethod) => void
  onRemove: (clientId: string) => void
  onOpenPayment: (paymentId: string) => void
  onEditClient: (clientId: string) => void
}
export default function AttendeeRow({
  rowIdPrefix,
  attendee,
  name,
  isSaving,
  isGenerating,
  hasPayment,
  isOpeningPayment,
  onCommit,
  onGenerate,
  onRemove,
  onOpenPayment,
  onEditClient,
}: AttendeeRowProps) {
  function handleEditClient(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation()
    onEditClient(attendee.clientId)
  }
  function handleGeneratePayment(method: PaymentMethod) {
    onGenerate(attendee.clientId, method)
  }
  function handleRemove() {
    return onRemove(attendee.clientId)
  }
  const [seatsValue, setSeatsValue] = useState<string>(String(attendee.seats))
  const lastSyncedRef = useRef<number>(attendee.seats)
  // Keep the local value in sync when the upstream attendee.seats changes
  // (e.g. after a successful mutation triggers a re-render).
  useEffect(() => {
    if (attendee.seats !== lastSyncedRef.current) {
      lastSyncedRef.current = attendee.seats
      setSeatsValue(String(attendee.seats))
    }
  }, [attendee.seats])
  const revert = () => {
    setSeatsValue(String(attendee.seats))
  }
  const handleCommit = () => {
    if (seatsValue === String(attendee.seats)) return
    void onCommit(attendee, seatsValue, revert)
  }
  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (e.currentTarget.contains(e.relatedTarget as Node | null)) return
    handleCommit()
  }
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleCommit()
    }
  }
  return (
    <li className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm">
      <div className="min-w-0 flex-1">
        {name === "Unknown client" ? (
          <p
            className="truncate font-medium text-zinc-900 dark:text-zinc-100"
            title={attendee.clientId}
          >
            {name}
          </p>
        ) : (
          <button
            type="button"
            className="truncate rounded-sm text-left font-medium text-emerald-700 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:text-emerald-400"
            aria-label={`Edit client ${name}`}
            title={attendee.clientId}
            onClick={handleEditClient}
          >
            {name}
          </button>
        )}
        <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <label
            htmlFor={`${rowIdPrefix}-seats-${attendee.clientId}`}
            className="sr-only"
          >
            Seats for {name}
          </label>
          {/* biome-ignore lint/a11y/noStaticElementInteractions: focus/keyboard handlers on a wrapper to detect blur/Enter on the seats input */}
          <div className="w-36" onBlur={handleBlur} onKeyDown={handleKeyDown}>
            <NumberStepperInput
              id={`${rowIdPrefix}-seats-${attendee.clientId}`}
              value={seatsValue}
              onValueChange={setSeatsValue}
              min={1}
              step={1}
              disabled={isSaving}
              ariaLabel={`Seats for ${name}`}
            />
          </div>
          {isSaving ? (
            <span aria-live="polite" aria-atomic="true">
              Saving…
            </span>
          ) : null}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <PaymentActions
          name={name}
          paymentId={attendee.paymentId}
          hasPayment={hasPayment}
          hideOpenPayment={isSaving}
          isGenerating={isGenerating}
          isOpeningPayment={isOpeningPayment}
          onGenerate={handleGeneratePayment}
          onOpen={onOpenPayment}
        />
        <IconButton
          variant="danger"
          onClick={handleRemove}
          ariaLabel={`Remove attendee ${name}`}
        >
          <TrashIcon />
        </IconButton>
      </div>
    </li>
  )
}
