"use client"
import dynamic from "next/dynamic"
import SuggestionInput from "@/components/shared/SuggestionInput"
import ClearButton from "@/components/ui/ClearButton"
import FormField from "@/components/ui/FormField"
import type { PartialDateValue } from "@/components/ui/partialDatePicker-utils"
import {
  type EventFormValues,
  inputClass,
  partialDateFromValues,
  stringToOptionalNumber,
} from "./eventFormModal-utils"
import { formatTimeOfDay } from "./eventsUi"

const PartialDatePicker = dynamic(
  () => {
    return import("@/components/ui/PartialDatePicker")
  },
  { ssr: false }
)
interface EventBasicFieldsProps {
  idPrefix: string
  values: EventFormValues
  availableTags: string[]
  isRecurring: boolean
  isSubmitting: boolean
  titleRef: React.Ref<HTMLInputElement>
  onChangeField: (
    field: keyof EventFormValues
  ) => (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void
  onDateChange: (next: PartialDateValue) => void
  onTimeChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}
export default function EventBasicFields({
  idPrefix,
  values,
  availableTags,
  isRecurring,
  isSubmitting,
  titleRef,
  onChangeField,
  onDateChange,
  onTimeChange,
}: EventBasicFieldsProps) {
  function handleChangeField() {
    const setDayOfWeek = onChangeField("dayOfWeek")
    setDayOfWeek({
      target: { value: "" },
    } as React.ChangeEvent<HTMLSelectElement>)
  }
  function handleTagChange(value: string) {
    onChangeField("tag")({
      target: { value },
    } as React.ChangeEvent<HTMLInputElement>)
  }
  const timeValue = formatTimeOfDay(
    stringToOptionalNumber(values.hour),
    stringToOptionalNumber(values.minute)
  )
  const hasConcreteDay = values.day.trim().length > 0
  return (
    <>
      <FormField id={`${idPrefix}-title`} label="Título">
        <input
          ref={titleRef}
          id={`${idPrefix}-title`}
          type="text"
          value={values.title}
          onChange={onChangeField("title")}
          disabled={isSubmitting}
          required
          maxLength={200}
          className={inputClass}
        />
      </FormField>
      <SuggestionInput
        label="Etiqueta (opcional)"
        ariaLabel="Etiqueta (opcional)"
        name="tag"
        value={values.tag}
        options={availableTags}
        onChange={handleTagChange}
        onSelect={handleTagChange}
        disabled={isSubmitting}
        maxLength={100}
        placeholder="Empieza a escribir para ver sugerencias..."
        leading={
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-zinc-200 bg-zinc-50 text-xs font-medium text-zinc-500 dark:border-zinc-700 dark:bg-zinc-700 dark:text-zinc-300">
            #
          </span>
        }
      />
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 md:grid-cols-[auto_auto_auto]">
        <div className="min-w-0 space-y-1">
          <span className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
            Date (optional)
          </span>
          <PartialDatePicker
            value={partialDateFromValues(values)}
            onChange={onDateChange}
            disabled={isSubmitting}
            disableDay={isRecurring}
            ariaLabelPrefix="Fecha del evento"
          />
        </div>

        <FormField id={`${idPrefix}-time`} label="Hora (opcional)">
          <input
            id={`${idPrefix}-time`}
            type="time"
            value={timeValue}
            onChange={onTimeChange}
            disabled={isSubmitting}
            className="min-h-11 w-[100px] rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700 dark:focus:ring-offset-zinc-900"
          />
        </FormField>

        <div className="col-span-2 md:col-span-1">
          <FormField
            id={`${idPrefix}-dayOfWeek`}
            label="Repetir cada semana el"
          >
            <div className="relative w-full md:w-[180px]">
              <select
                id={`${idPrefix}-dayOfWeek`}
                value={hasConcreteDay ? "" : values.dayOfWeek}
                onChange={onChangeField("dayOfWeek")}
                disabled={isSubmitting || hasConcreteDay}
                className="min-h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 pr-8 text-sm font-medium text-zinc-900 transition hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700 dark:focus:ring-offset-zinc-900"
              >
                <option value="">— No se repite —</option>
                <option value="1">Lunes</option>
                <option value="2">Martes</option>
                <option value="3">Miércoles</option>
                <option value="4">Jueves</option>
                <option value="5">Viernes</option>
                <option value="6">Sábado</option>
                <option value="0">Domingo</option>
              </select>
              {!hasConcreteDay && values.dayOfWeek ? (
                <ClearButton
                  onClick={handleChangeField}
                  disabled={isSubmitting}
                  ariaLabel="Borrar repetición semanal"
                />
              ) : null}
            </div>
          </FormField>
        </div>
      </div>
    </>
  )
}
