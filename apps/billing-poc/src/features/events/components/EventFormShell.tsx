"use client"
import { useEffect, useId, useRef, useState } from "react"
import { ErrorBanner } from "@/components/ui/ErrorBanner"
import { Modal } from "@/components/ui/Modal"
import { ModalFormActions } from "@/components/ui/ModalFormActions"
import type { PartialDateValue } from "@/components/ui/PartialDatePicker"
import EventBasicFields from "./EventBasicFields"
import EventPricingFields from "./EventPricingFields"
import EventScheduleFields from "./EventScheduleFields"
import type { EventFormValues } from "./eventFormModal-utils"
import { parseTimeOfDay } from "./eventsUi"
export interface EventFormShellProps {
  isOpen: boolean
  onClose: () => void
  title: string
  submitLabel: string
  maxWidth?: "lg" | "xl"
  /**
   * Identity that triggers a form reset on open. Pass the event id in edit
   * mode and a stable value (e.g. "create") in create mode.
   */
  resetKey: string
  /**
   * Factory invoked on open (and whenever `resetKey` changes) to seed the
   * form state. Wrap in `useCallback` at the call site to keep referential
   * stability across renders.
   */
  computeInitialValues: () => EventFormValues
  onSubmit: (values: EventFormValues) => Promise<void>
  isSubmitting: boolean
  availableTags: string[]
  errorMessage?: string | null
  /** Optional content rendered above the form (e.g. attendees panel). */
  headerSlot?: React.ReactNode
}
export default function EventFormShell({
  isOpen,
  onClose,
  title,
  submitLabel,
  maxWidth = "lg",
  resetKey,
  computeInitialValues,
  onSubmit,
  isSubmitting,
  availableTags,
  errorMessage,
  headerSlot,
}: EventFormShellProps) {
  const id = useId()
  const titleRef = useRef<HTMLInputElement>(null)
  const [values, setValues] = useState<EventFormValues>(() => {
    return computeInitialValues()
  })
  // Reset form whenever the modal opens or the reset identity changes.
  // biome-ignore lint/correctness/useExhaustiveDependencies: deliberate reset on open/identity change only
  useEffect(() => {
    if (!isOpen) return
    setValues(computeInitialValues())
    const t = setTimeout(() => {
      return titleRef.current?.focus()
    }, 0)
    return () => {
      return clearTimeout(t)
    }
  }, [isOpen, resetKey])
  const canSubmit =
    values.title.trim().length > 0 &&
    values.pricePerSeat.trim().length > 0 &&
    values.vatRate.trim().length > 0 &&
    !isSubmitting
  const handleChange = (field: keyof EventFormValues) => {
    return (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      return setValues((prev) => {
        const nextValue = e.target.value
        if (field === "dayOfWeek") {
          return {
            ...prev,
            dayOfWeek: nextValue,
            day: nextValue.length > 0 ? "" : prev.day,
          }
        }
        return { ...prev, [field]: nextValue }
      })
    }
  }
  const handleDateChange = (next: PartialDateValue) => {
    setValues((prev) => {
      return {
        ...prev,
        year: typeof next.year === "number" ? String(next.year) : "",
        month: typeof next.month === "number" ? String(next.month) : "",
        day: typeof next.day === "number" ? String(next.day) : "",
        dayOfWeek: typeof next.day === "number" ? "" : prev.dayOfWeek,
      }
    })
  }
  const handleValueChange = (field: keyof EventFormValues) => {
    return (value: string) => {
      setValues((prev) => ({ ...prev, [field]: value }))
    }
  }
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseTimeOfDay(e.target.value)
    setValues((prev) => {
      return {
        ...prev,
        hour: typeof parsed.hour === "number" ? String(parsed.hour) : "",
        minute: typeof parsed.minute === "number" ? String(parsed.minute) : "",
      }
    })
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    await onSubmit(values)
  }
  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (
      e.key === "Enter" &&
      !(e.target instanceof HTMLTextAreaElement) &&
      canSubmit
    ) {
      e.preventDefault()
      void handleSubmit(e)
    }
  }
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth={maxWidth}>
      {headerSlot}
      {/*
          `noValidate` disables the browser's native form validation popups
          (e.g. "the two nearest valid values are X and Y" when typing values
          that don't match the input's `step`). We still validate server-side
          via Zod schemas; `step` here is only a UX convenience for keyboard
          arrows / spinner increments.
        */}
      <form
        id={`${id}-form`}
        onSubmit={handleSubmit}
        onKeyDown={handleKeyDown}
        className="space-y-4"
        noValidate
      >
        {errorMessage ? <ErrorBanner>{errorMessage}</ErrorBanner> : null}

        <EventBasicFields
          idPrefix={id}
          values={values}
          availableTags={availableTags}
          isRecurring={values.dayOfWeek.length > 0}
          isSubmitting={isSubmitting}
          titleRef={titleRef}
          onChangeField={handleChange}
          onDateChange={handleDateChange}
          onTimeChange={handleTimeChange}
        />

        <EventScheduleFields
          idPrefix={id}
          values={values}
          isSubmitting={isSubmitting}
          onChangeValue={handleValueChange}
        />

        <EventPricingFields
          idPrefix={id}
          values={values}
          isSubmitting={isSubmitting}
          onChangeValue={handleValueChange}
        />

        <ModalFormActions
          formId={`${id}-form`}
          label={submitLabel}
          isPending={isSubmitting}
          disabled={!canSubmit}
          onCancel={onClose}
        />
      </form>
    </Modal>
  )
}
