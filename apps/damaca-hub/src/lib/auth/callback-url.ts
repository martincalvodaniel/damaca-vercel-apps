import { safeCallback } from "@damaca/identity/contract"

export function getSafeCallbackUrl(value: string | undefined): string {
  return safeCallback(value)
}
