export const taskAuthorClasses = {
  Ambos: "border-primary bg-primary-soft text-primary",
  Dani: "border-primary bg-primary-soft text-primary",
  Pali: "border-primary bg-primary-soft text-primary",
} as const

export type TaskAuthor = keyof typeof taskAuthorClasses
