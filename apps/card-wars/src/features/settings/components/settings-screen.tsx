import { BackupSettings } from "@/features/settings/components/backup-settings"
import { InstallSettings } from "@/features/settings/components/install-settings"
import { ThemeSettings } from "@/features/settings/components/theme-settings"

export function SettingsScreen() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-2 px-2 pb-2 pt-2 sm:px-4">
      <h1 className="text-2xl font-black tracking-tight">Ajustes</h1>
      <ThemeSettings />
      <InstallSettings />
      <BackupSettings />
      <section
        aria-label="En este dispositivo"
        className="rounded-xl border border-[#9fb493] bg-white/70 p-2 text-[#21352d]"
      >
        <h2 className="text-sm font-black">En este dispositivo</h2>
        <p className="mt-1 text-xs leading-5 text-[#4e6450]">
          Las partidas y preferencias se guardan en este navegador. No hay
          cuenta ni sincronización. Borrar los datos del sitio puede
          eliminarlas; guarda una copia JSON para conservarlas.
        </p>
      </section>
    </main>
  )
}
