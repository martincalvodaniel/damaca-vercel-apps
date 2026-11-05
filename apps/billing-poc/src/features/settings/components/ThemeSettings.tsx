"use client"

import { type ChangeEvent, useCallback, useId, useState } from "react"
import Toast from "@/components/ui/Toast"
import { useUpdateUserPreferences } from "../hooks/useUserPreferences"
import { useUserTheme } from "./UserThemeProvider"

export default function ThemeSettings() {
  const selectId = useId()
  const descriptionId = useId()
  const { theme, userKey } = useUserTheme()
  const { trigger, isMutating } = useUpdateUserPreferences(userKey)
  const [error, setError] = useState("")
  const [saved, setSaved] = useState(false)

  const closeToast = useCallback(() => setSaved(false), [])
  const handleThemeChange = useCallback(
    async (event: ChangeEvent<HTMLSelectElement>) => {
      const nextTheme = event.target.value
      if (nextTheme !== "original" && nextTheme !== "olive") return
      setError("")
      setSaved(false)
      try {
        await trigger({ theme: nextTheme })
        setSaved(true)
      } catch {
        setError("No se pudo guardar el tema. Inténtalo de nuevo.")
      }
    },
    [trigger]
  )

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        Configuración de usuario
      </h1>
      <div className="mt-6 max-w-md space-y-2">
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-200"
        >
          Tema
        </label>
        <select
          id={selectId}
          value={theme}
          disabled={isMutating}
          aria-describedby={descriptionId}
          aria-busy={isMutating}
          onChange={handleThemeChange}
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-wait disabled:opacity-60 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:ring-offset-zinc-900"
        >
          <option value="original">Original</option>
          <option value="olive">Oliva y terracota</option>
        </select>
        <p
          id={descriptionId}
          className="text-sm text-zinc-500 dark:text-zinc-400"
        >
          Se guarda en tu cuenta y se aplica en todos tus dispositivos. El modo
          claro u oscuro sigue la configuración del sistema.
        </p>
        <p
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="min-h-5 text-sm text-zinc-600 dark:text-zinc-300"
        >
          {isMutating ? "Guardando tema…" : ""}
        </p>
        {error ? (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        ) : null}
      </div>
      {saved ? <Toast message="Tema guardado" onClose={closeToast} /> : null}
    </section>
  )
}
