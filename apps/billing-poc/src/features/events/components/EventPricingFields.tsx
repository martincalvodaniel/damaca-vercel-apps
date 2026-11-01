"use client"

import FormField from "@/components/ui/FormField"
import NumberStepperInput from "@/components/ui/NumberStepperInput"
import type { EventFormValues } from "./eventFormModal-utils"

interface EventPricingFieldsProps {
  idPrefix: string
  values: EventFormValues
  isSubmitting: boolean
  onChangeValue: (field: keyof EventFormValues) => (value: string) => void
}

export default function EventPricingFields({
  idPrefix,
  values,
  isSubmitting,
  onChangeValue,
}: EventPricingFieldsProps) {
  return (
    <div className="grid min-w-0 grid-cols-2 gap-3">
      <div className="min-w-0 space-y-1">
        <FormField
          id={`${idPrefix}-price`}
          label="Precio por plaza (IVA incluido)"
          required
        >
          <NumberStepperInput
            id={`${idPrefix}-price`}
            min={0}
            step={5}
            value={values.pricePerSeat}
            onValueChange={onChangeValue("pricePerSeat")}
            disabled={isSubmitting}
            required
            ariaLabel="Precio por plaza (IVA incluido)"
          />
        </FormField>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Price the attendee pays per seat (VAT included). Net and VAT are
          derived using the VAT rate.
        </p>
      </div>
      <div className="min-w-0 space-y-1">
        <FormField id={`${idPrefix}-vat-rate`} label="Tipo de IVA (%)" required>
          <NumberStepperInput
            id={`${idPrefix}-vat-rate`}
            min={0}
            max={100}
            step={1}
            value={values.vatRate}
            onValueChange={onChangeValue("vatRate")}
            disabled={isSubmitting}
            required
            ariaLabel="Porcentaje del IVA"
          />
        </FormField>
      </div>
    </div>
  )
}
