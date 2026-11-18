"use client"

import { type FocusEvent, useCallback, useState } from "react"
import { activeProductSyncProtocol } from "@/config/common-plan-release"
import type { SyncPassResultV2 } from "@/features/sync/coordinator-v2"
import type { readSyncDiagnostic } from "@/features/sync/read-sync-diagnostic"
import type { LocalAccount } from "@/features/workspace/local-account"
import { requireActiveAccount } from "@/features/workspace/require-active-account"

import { downloadJson } from "@/lib/download-json"

type Report = Awaited<ReturnType<typeof readSyncDiagnostic>>

const operationLabels: Record<string, string> = {
  "task.move": "Reordenar planes",
  "tag.move": "Reordenar categorías",
  "tag.save": "Guardar categoría",
  "tag.delete": "Eliminar categoría",
  "item-view.set": "Cambiar asignación de plan",
  "settings.update": "Cambiar zona horaria",
  "task.update-occurrence": "Editar aparición",
  "task.cancel-occurrence": "Cancelar aparición",
  "task.set-status": "Cambiar estado",
  "plan.set-status": "Cambiar estado",
  "task.set-checklist-entry": "Cambiar checklist",
  "plan.set-checklist-entry": "Cambiar checklist",
  "item.create": "Crear plan",
  "item.update": "Editar plan",
  "item.delete": "Eliminar plan",
}

function selectReport(event: FocusEvent<HTMLTextAreaElement>) {
  event.currentTarget.select()
}

export function SyncDiagnostic({
  account,
  busy,
  result,
}: {
  account: LocalAccount
  busy: boolean
  result: SyncPassResultV2 | null
}) {
  const [report, setReport] = useState<Report | null>(null)
  const [notice, setNotice] = useState("")
  const [manualCopy, setManualCopy] = useState(false)
  const [reading, setReading] = useState(false)

  const exportReport = useCallback(
    async (method: "copy" | "download") => {
      setReading(true)
      setNotice("")
      setManualCopy(false)
      setReport(null)
      try {
        const { readSyncDiagnostic } = await import(
          "@/features/sync/read-sync-diagnostic"
        )
        const snapshot = await readSyncDiagnostic(
          account,
          activeProductSyncProtocol,
          busy,
          result
        )
        await requireActiveAccount(account)
        setReport(snapshot)
        const json = JSON.stringify(snapshot)
        if (method === "download") {
          try {
            downloadJson(json, "dalis-diagnostico-sync.json")
            setNotice("Descarga solicitada.")
          } catch {
            setNotice(
              "No se pudo descargar el diagnóstico. Vuelve a intentarlo."
            )
          }
          return
        }
        try {
          await navigator.clipboard.writeText(json)
          setNotice("Diagnóstico copiado.")
        } catch {
          setManualCopy(true)
          setNotice("Selecciona el informe y cópialo.")
        }
      } catch {
        setNotice("No se pudo leer el diagnóstico local. Vuelve a intentarlo.")
      } finally {
        setReading(false)
      }
    },
    [account, busy, result]
  )

  const copy = useCallback(() => exportReport("copy"), [exportReport])
  const download = useCallback(() => exportReport("download"), [exportReport])

  return (
    <div className="mt-2">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={copy}
          disabled={reading}
          className="min-h-11 rounded-lg border border-zinc-300 px-3 font-medium disabled:opacity-50 dark:border-zinc-700"
        >
          Copiar diagnóstico
        </button>
        <button
          type="button"
          onClick={download}
          disabled={reading}
          className="min-h-11 rounded-lg border border-zinc-300 px-3 font-medium disabled:opacity-50 dark:border-zinc-700"
        >
          Descargar diagnóstico
        </button>
      </div>
      {reading ? (
        <p role="status" className="mt-1">
          Preparando diagnóstico…
        </p>
      ) : null}
      {notice ? (
        <p role="status" className="mt-1">
          {notice}
        </p>
      ) : null}
      {report?.roots.length ? (
        <ul className="mt-2 space-y-1">
          {report.roots.slice(0, 10).map((root) => (
            <li key={root.id}>
              {operationLabels[root.type] ?? "Cambio de plan"} #{root.id}{" "}
              bloquea{" "}
              {root.blockedChanges === 1
                ? "1 cambio"
                : `${root.blockedChanges} cambios`}
            </li>
          ))}
          {report.roots.length > 10 ? (
            <li>El informe incluye los demás bloqueos.</li>
          ) : null}
        </ul>
      ) : null}
      {manualCopy && report ? (
        <textarea
          aria-label="Informe de sincronización"
          className="mt-2 block w-full rounded-lg border border-zinc-300 p-2 dark:border-zinc-700"
          readOnly
          rows={4}
          value={JSON.stringify(report)}
          onFocus={selectReport}
        />
      ) : null}
    </div>
  )
}
