export function getFormDataValues(formData: FormData) {
  return Object.fromEntries(
    [...formData.entries()].filter(([name]) => !name.startsWith("$ACTION_"))
  )
}
