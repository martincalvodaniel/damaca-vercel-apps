"use client"

import { recurringSyncReleaseEnabled } from "@/config/common-plan-release"
import type { LocalAccount } from "@/features/workspace/local-account"
import { readAccountBackup } from "@/features/workspace/local-backup"
import { requireActiveAccount } from "@/features/workspace/require-active-account"
import {
  encodeLocalBackup,
  encodeLocalRecurringBackup,
} from "@/lib/backup/local-backup"

import { downloadJson } from "@/lib/download-json"

export async function downloadAccountBackup(
  account: Pick<LocalAccount, "userId" | "epoch">
): Promise<void> {
  const backup = await readAccountBackup(account)
  const json = (
    recurringSyncReleaseEnabled ? encodeLocalRecurringBackup : encodeLocalBackup
  )(backup, account.userId)
  await requireActiveAccount(account)
  downloadJson(json, `dalis-backup-${backup.exportedAt.slice(0, 10)}.json`)
}
