export const taskAuthorClasses = {
  Ambos: "border-control-border bg-field text-ink",
  Dani: "border-primary bg-primary-soft text-primary",
  Pali: "border-accent bg-accent-soft text-accent",
} as const

export type TaskAuthor = keyof typeof taskAuthorClasses
