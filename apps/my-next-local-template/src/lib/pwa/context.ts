"use client"

import { createContext, useContext } from "react"

export interface InstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

interface PwaState {
  status: "preparing" | "ready" | "error" | "unsupported" | "development"
  installed: boolean
  canInstall: boolean
  updateAvailable: boolean
  install(): Promise<void>
  update(): void
}

export const PwaContext = createContext<PwaState | null>(null)

export function usePwa() {
  const context = useContext(PwaContext)
  if (!context) throw new Error("PWA controls require PwaProvider.")
  return context
}
