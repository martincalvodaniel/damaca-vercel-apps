export function formatLocalDate(value: string) {
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value))
}
