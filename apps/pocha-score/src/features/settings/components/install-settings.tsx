"use client"

import { useCallback, useId, useState } from "react"
import { usePwa } from "@/lib/pwa/context"

const offlineMessages = {
  preparing:
    "Preparando el acceso sin conexión… Mantén la app abierta hasta que termine.",
  ready:
    "Lista para usar sin conexión. Puedes volver a abrir la app sin internet.",
  error:
    "No se pudo preparar el acceso sin conexión. Abre la app con internet para reintentarlo.",
  unsupported:
    "El acceso sin conexión requiere un navegador compatible y HTTPS o localhost.",
  development:
    "El acceso sin conexión está disponible en la vista previa de producción, no en el servidor de desarrollo.",
} as const

export function InstallSettings() {
  const headingId = useId()
  const pwa = usePwa()
  const [installFailed, setInstallFailed] = useState(false)
  const handleInstall = useCallback(() => {
    setInstallFailed(false)
    void pwa.install().catch(() => setInstallFailed(true))
  }, [pwa])
  return (
    <section
      aria-labelledby={headingId}
      className="rounded-xl border border-zinc-200 bg-white p-1.5 dark:border-zinc-800 dark:bg-zinc-900 sm:p-1.5"
    >
      <h2 id={headingId} className="text-lg font-semibold">
        Instalación y uso sin conexión
      </h2>
      <p
        role="status"
        className="mt-0.5 text-sm leading-5 text-zinc-600 dark:text-zinc-400"
      >
        {offlineMessages[pwa.status]}
      </p>
      {pwa.installed ? (
        <p className="mt-0.5 text-sm">
          Esta app está instalada en tu dispositivo.
        </p>
      ) : (
        <>
          <p className="mt-0.5 text-sm leading-5">
            Usa la opción de instalación del navegador. En iPhone o iPad, abre
            Safari, pulsa Compartir y luego Añadir a pantalla de inicio. En
            ordenador, busca Instalar app en la barra de direcciones o el menú.
          </p>
          {pwa.canInstall ? (
            <button
              type="button"
              onClick={handleInstall}
              className="mt-0.5 min-h-10 rounded-lg bg-emerald-700 px-1.5 py-1 font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              Instalar app
            </button>
          ) : null}
          {installFailed ? (
            <p role="alert" className="mt-0.5 text-sm">
              No se pudo iniciar la instalación. Prueba la opción del navegador.
            </p>
          ) : null}
        </>
      )}
      {pwa.updateAvailable ? (
        <div className="mt-0.5 border-t border-zinc-200 pt-0.5 dark:border-zinc-800">
          <p className="text-sm">
            Hay una actualización lista. Termina lo que estás haciendo antes de
            recargar. Tus datos locales se conservarán.
          </p>
          <button
            type="button"
            onClick={pwa.update}
            className="mt-0.5 min-h-10 rounded-lg border border-zinc-400 px-1.5 py-1 font-medium focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            Actualizar y recargar
          </button>
        </div>
      ) : null}
    </section>
  )
}
