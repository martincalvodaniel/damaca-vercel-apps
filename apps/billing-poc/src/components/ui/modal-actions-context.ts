"use client"

import { createContext } from "react"

export const ModalActionsContext = createContext<{
  target: HTMLDivElement | null
} | null>(null)
