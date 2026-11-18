import type { SyncPassResultV2 } from "@/features/sync/coordinator-v2"
import { isUnresolvedOutboxEntry } from "@/lib/sync/outbox-state"
import type { PersonalQueueDiagnostics } from "@/types/personal-queue-diagnostics"

export function buildSyncDiagnosticReport(
  diagnostics: PersonalQueueDiagnostics,
  context: {
    appVersion: string
    protocol: number
    busy: boolean
    result: SyncPassResultV2 | null
  }
) {
  const { operations } = diagnostics
  const operationAliases = new Map(
    operations.map(({ entry }, index) => [
      entry.operation.operationId,
      index + 1,
    ])
  )
  const entityAliases = new Map<string, number>()
  function aliasEntity(key: string) {
    const alias = entityAliases.get(key) ?? entityAliases.size + 1
    entityAliases.set(key, alias)
    return alias
  }

  const children = new Map<number, number[]>()
  const queue = operations.map(({ entry, category }, index) => {
    const id = index + 1
    const dependencies = entry.dependencies.map((dependency) => {
      const alias = operationAliases.get(dependency)
      if (alias === undefined) throw new Error("Missing queue dependency")
      const parent = operations[alias - 1].entry
      if (category !== "settled" && parent.state !== "acknowledged") {
        const dependents = children.get(alias) ?? []
        dependents.push(id)
        children.set(alias, dependents)
      }
      return alias
    })
    const { command, baseRevision } = entry.operation
    return {
      id,
      entity: aliasEntity(entry.entityKey),
      plan: "itemId" in command ? aliasEntity(`item:${command.itemId}`) : null,
      type: command.type,
      state: entry.state,
      category,
      baseRevision,
      attempts: entry.attempts,
      dependencies,
    }
  })

  const roots = queue.flatMap((operation) => {
    if (
      (operation.category !== "blocked" &&
        operation.category !== "unsupported") ||
      (operation.state === "pending" && operation.category === "blocked") ||
      !children.has(operation.id)
    )
      return []

    const descendants = new Set<number>()
    const pending = [...(children.get(operation.id) ?? [])]
    let blockedChanges = 0
    while (pending.length) {
      const id = pending.pop()
      if (id === undefined || descendants.has(id)) continue
      descendants.add(id)
      if (isUnresolvedOutboxEntry(queue[id - 1])) blockedChanges++
      for (const child of children.get(id) ?? []) pending.push(child)
    }
    return blockedChanges
      ? [{ id: operation.id, type: operation.type, blockedChanges }]
      : []
  })

  const result = context.result
  return {
    format: 1,
    appVersion: context.appVersion,
    protocol: context.protocol,
    running: context.busy,
    lastAttempt: result
      ? {
          phase: result.phase ?? null,
          status: result.status,
          uploaded: result.uploaded,
          downloaded: result.downloaded,
        }
      : null,
    roots,
    queue,
  }
}
