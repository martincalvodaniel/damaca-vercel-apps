"use client"

import type { FormEvent } from "react"
import { useLocale } from "./client"

export function useFormValidation() {
  const { t } = useLocale()

  return {
    onInvalidCapture(event: FormEvent<HTMLFormElement>) {
      const field = event.target
      if (!(field instanceof HTMLInputElement)) return

      const { patternMismatch, tooShort, typeMismatch, valueMissing } =
        field.validity
      if (valueMissing) {
        field.setCustomValidity(
          field.type === "checkbox" ? t.requiredCheckbox : t.requiredField
        )
      } else if (typeMismatch && field.type === "email") {
        field.setCustomValidity(t.invalidEmail)
      } else if (patternMismatch && field.name === "title") {
        field.setCustomValidity(t.invalidTitle)
      } else if (tooShort && field.minLength === 15) {
        field.setCustomValidity(t.minimumPasswordLength)
      }
    },
    onInputCapture(event: FormEvent<HTMLFormElement>) {
      if (event.target instanceof HTMLInputElement)
        event.target.setCustomValidity("")
    },
  }
}
