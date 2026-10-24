"use client"
import { type ChangeEvent, useCallback, useId } from "react"
import { useTheme } from "@/lib/theme/context"

export function ThemeSettings() {
  const id = useId()
  const { theme, loading, failed, save } = useTheme()
  const handleThemeChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      void save(event.target.value)
    },
    [save]
  )
  return (
    <section className="mb-0.5 rounded-xl border border-zinc-200 bg-white p-1.5 text-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between gap-1.5">
        <label htmlFor={id} className="font-medium">
          Tema
        </label>
        <select
          id={id}
          value={theme}
          disabled={loading}
          onChange={handleThemeChange}
          className="min-h-10 rounded-lg border border-zinc-300 bg-transparent px-1.5 dark:border-zinc-700"
        >
          <option value="system">Sistema</option>
          <option value="light">Claro</option>
          <option value="dark">Oscuro</option>
        </select>
      </div>
      {failed ? (
        <p
          role="status"
          className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400"
        >
          No se pudieron cargar o guardar las preferencias. Cierra otras
          pestañas de la app, revisa el permiso de almacenamiento del navegador
          y selecciona un tema para reintentarlo.
        </p>
      ) : null}
    </section>
  )
}
