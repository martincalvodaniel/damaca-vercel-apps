"use client"

import type { SyncPassResultV2 } from "@/features/sync/coordinator-v2"
import type { LocalAccount } from "@/features/workspace/local-account"
import { requireActiveAccount } from "@/features/workspace/require-active-account"
import { LocalMixedSyncStore } from "@/lib/local-db/mixed-sync-store"
import { diagnosePersonalQueue } from "@/lib/sync/personal-queue-diagnostics"
import { recurringSyncCapabilityPolicy } from "@/lib/sync/recurring-sync-capabilities"
import { settingsSyncCapabilityPolicy } from "@/lib/sync/settings-sync-capabilities"
import {
  placementSyncCapabilityPolicy,
  planSyncCapabilityPolicy,
} from "@/lib/sync/sync-capabilities"
import { buildSyncDiagnosticReport } from "@/lib/sync/sync-diagnostic-report"
import packageMetadata from "../../../package.json"

const policies = {
  3: placementSyncCapabilityPolicy,
  4: planSyncCapabilityPolicy,
  5: recurringSyncCapabilityPolicy,
  6: settingsSyncCapabilityPolicy,
}

export async function readSyncDiagnostic(
  account: Pick<LocalAccount, "userId" | "epoch">,
  protocol: keyof typeof policies,
  busy: boolean,
  result: SyncPassResultV2 | null
) {
  await requireActiveAccount(account)
  const store = await LocalMixedSyncStore.open(account.userId)
  try {
    const state = await store.readQueueState()
    const diagnostics = diagnosePersonalQueue(
      { ...state, userId: account.userId },
      policies[protocol]
    )
    await requireActiveAccount(account)
    return buildSyncDiagnosticReport(diagnostics, {
      appVersion: packageMetadata.version,
      protocol,
      busy,
      result,
    })
  } finally {
    store.close()
  }
}
