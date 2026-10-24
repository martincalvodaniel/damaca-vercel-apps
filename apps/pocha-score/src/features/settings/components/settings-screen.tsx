import { InstallSettings } from "@/features/settings/components/install-settings"
import { ThemeSettings } from "@/features/settings/components/theme-settings"

export function SettingsScreen() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-3 p-2 sm:gap-4 sm:p-5">
      <h1 className="text-2xl font-semibold tracking-tight">Ajustes</h1>
      <ThemeSettings />
      <InstallSettings />
      <section
        aria-label="En este dispositivo"
        className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900 sm:p-4"
      >
        <h2 className="text-lg font-semibold">En este dispositivo</h2>
        <p className="mt-2 text-sm leading-5 text-zinc-600 dark:text-zinc-400">
          Las preferencias y partidas se guardan en este navegador. No hay
          cuentas ni sincronización. Borrar los datos del sitio o navegar en
          privado puede eliminar tus partidas. Instalar la app no crea una copia
          de seguridad.
        </p>
      </section>
    </main>
  )
}
