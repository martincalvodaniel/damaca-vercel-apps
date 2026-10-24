// biome-ignore-all lint/performance/noJsxPropsBind: Theme persistence runs only after the player changes the setting.

"use client"
import { useId } from "react"
import { useTheme } from "@/lib/theme/context"

export function ThemeSettings() {
  const id = useId()
  const { theme, loading, failed, save } = useTheme()
  return (
    <section className="rounded-xl border border-[#9fb493] bg-white/70 p-2 text-sm text-[#21352d]">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="font-medium">
          Tema
        </label>
        <select
          id={id}
          value={theme}
          disabled={loading}
          onChange={(event) => {
            void save(event.target.value)
          }}
          className="min-h-11 rounded-lg border border-zinc-300 bg-transparent px-3 dark:border-zinc-700"
        >
          <option value="system">Sistema</option>
          <option value="light">Claro</option>
          <option value="dark">Oscuro</option>
        </select>
      </div>
      {failed ? (
        <p
          role="status"
          className="mt-2 text-xs text-zinc-600 dark:text-zinc-400"
        >
          No se pudieron cargar o guardar las preferencias. Cierra otras
          pestañas, revisa los permisos de almacenamiento y vuelve a elegir un
          tema.
        </p>
      ) : null}
    </section>
  )
}
