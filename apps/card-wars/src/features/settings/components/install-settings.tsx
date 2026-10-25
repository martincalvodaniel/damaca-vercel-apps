// biome-ignore-all lint/performance/noJsxPropsBind: Installation handlers run only on explicit settings actions.

"use client"

import { useId, useState } from "react"
import { usePwa } from "@/lib/pwa/context"

const installationMessages = {
  preparing: "Preparando la instalación…",
  ready:
    "App preparada. Necesitas conexión para comprobar tu sesión y permiso.",
  error: "No se pudo preparar la app. Vuelve a abrirla con conexión.",
  unsupported:
    "La instalación requiere un navegador compatible y HTTPS o localhost.",
  development: "La instalación está disponible en producción.",
} as const

export function InstallSettings() {
  const headingId = useId()
  const pwa = usePwa()
  const [installFailed, setInstallFailed] = useState(false)
  return (
    <section
      aria-labelledby={headingId}
      className="rounded-xl border border-[#9fb493] bg-white/70 p-2 text-[#21352d]"
    >
      <h2 id={headingId} className="text-lg font-semibold">
        Instalación y conexión
      </h2>
      <p role="status" className="mt-1 text-xs leading-5 text-[#4e6450]">
        {installationMessages[pwa.status]}
      </p>
      {pwa.installed ? (
        <p className="mt-3 text-sm">
          La app está instalada en este dispositivo.
        </p>
      ) : (
        <>
          <p className="mt-3 text-sm leading-6">
            Usa la opción de instalación del navegador. En iPhone o iPad, abre
            Safari, toca Compartir y luego Añadir a pantalla de inicio. En
            escritorio, busca Instalar app en la barra de direcciones o el menú.
          </p>
          {pwa.canInstall ? (
            <button
              type="button"
              onClick={() => {
                setInstallFailed(false)
                void pwa.install().catch(() => setInstallFailed(true))
              }}
              className="mt-2 min-h-11 rounded-lg bg-[#213f36] px-4 py-2 text-sm font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              Instalar app
            </button>
          ) : null}
          {installFailed ? (
            <p role="alert" className="mt-3 text-sm">
              No se pudo iniciar la instalación. Prueba la opción del navegador.
            </p>
          ) : null}
        </>
      )}
      {pwa.updateAvailable ? (
        <div className="mt-3 border-t border-[#9fb493] pt-2">
          <p className="text-sm">
            Hay una actualización lista. Guarda tu partida antes de recargar.
            Tus datos locales se conservarán.
          </p>
          <button
            type="button"
            onClick={pwa.update}
            className="mt-2 min-h-11 rounded-lg border border-[#557b65] px-4 py-2 text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            Actualizar y recargar
          </button>
        </div>
      ) : null}
    </section>
  )
}
