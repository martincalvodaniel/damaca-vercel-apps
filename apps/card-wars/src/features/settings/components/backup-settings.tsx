// biome-ignore-all lint/performance/noJsxPropsBind: File and download handlers run only on explicit settings actions.

"use client"

import { useRef, useState } from "react"
import {
  exportGames,
  importGames,
  listGames,
  parseGameBackup,
} from "@/lib/storage/games"

export function BackupSettings() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState("")
  const [busy, setBusy] = useState(false)

  async function exportBackup() {
    setBusy(true)
    setMessage("")
    try {
      const content = exportGames(await listGames())
      const url = URL.createObjectURL(
        new Blob([content], { type: "application/json" })
      )
      const link = document.createElement("a")
      link.href = url
      link.download = `card-wars-${new Date().toISOString().slice(0, 10)}.json`
      link.click()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
      setMessage("Copia descargada correctamente.")
    } catch (cause) {
      setMessage(
        cause instanceof Error ? cause.message : "No se pudo crear la copia."
      )
    } finally {
      setBusy(false)
    }
  }

  async function importBackup(file: File | undefined) {
    if (!file) return
    setBusy(true)
    setMessage("")
    try {
      const backup = parseGameBackup(await file.text())
      const result = await importGames(backup.games)
      setMessage(
        `Importación lista: ${result.added.length} añadidas, ${result.duplicates} duplicadas y ${result.conflicts} conflictos conservados localmente.`
      )
    } catch (cause) {
      setMessage(
        cause instanceof Error
          ? `No se pudo importar la copia: ${cause.message}`
          : "No se pudo importar la copia."
      )
    } finally {
      setBusy(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  return (
    <section className="rounded-xl border border-[#9fb493] bg-white/70 p-2 text-[#21352d]">
      <h2 className="text-sm font-black">Copias de seguridad</h2>
      <p className="mt-1 text-xs leading-5">
        Exporta todas las partidas a un archivo JSON. Al importar se añaden las
        partidas nuevas; las locales se conservan si hay conflictos.
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => void exportBackup()}
          className="min-h-11 rounded-lg bg-[#213f36] px-3 text-sm font-bold text-white disabled:opacity-50"
        >
          Exportar partidas
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
          className="min-h-11 rounded-lg border-2 border-[#557b65] bg-white px-3 text-sm font-bold disabled:opacity-50"
        >
          Importar JSON
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          onChange={(event) => void importBackup(event.target.files?.[0])}
          className="sr-only"
          aria-label="Seleccionar copia JSON"
        />
      </div>
      {message ? (
        <p role="status" className="mt-2 break-words text-xs">
          {message}
        </p>
      ) : null}
    </section>
  )
}
