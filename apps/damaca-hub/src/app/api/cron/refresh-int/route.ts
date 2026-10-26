import { timingSafeEqual } from "node:crypto"
import { getDatabaseRefreshEnv, isProductionDeployment } from "@/config/env"
import {
  refreshHubIntDatabase,
  restoreHubIntDatabase,
} from "@/lib/db/database-refresh"

export const maxDuration = 300

function hasValidAuthorization(request: Request, secret: string): boolean {
  const authorization = request.headers.get("authorization") ?? ""
  const expected = `Bearer ${secret}`
  const receivedBytes = Buffer.from(authorization)
  const expectedBytes = Buffer.from(expected)
  return (
    receivedBytes.length === expectedBytes.length &&
    timingSafeEqual(receivedBytes, expectedBytes)
  )
}

export async function GET(request: Request): Promise<Response> {
  const env = getDatabaseRefreshEnv()
  if (!env.cronSecret || !hasValidAuthorization(request, env.cronSecret)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (!isProductionDeployment()) {
    return Response.json(
      { error: "Database refresh is available only in production" },
      { status: 403 }
    )
  }
  if (!env.enabled) {
    return Response.json(
      { error: "Database refresh is disabled" },
      { status: 503 }
    )
  }
  if (!env.configured) {
    return Response.json(
      { error: "Database refresh configuration is incomplete" },
      { status: 503 }
    )
  }

  const action = new URL(request.url).searchParams.get("action")
  try {
    if (action === "restore") {
      await restoreHubIntDatabase()
      return Response.json({ restored: true })
    }
    if (action && action !== "refresh") {
      return Response.json({ error: "Unsupported action" }, { status: 400 })
    }
    const result = await refreshHubIntDatabase()
    return Response.json({
      refreshed: true,
      runId: result.runId,
      copiedCollections: result.copiedCollections,
    })
  } catch {
    console.error("Hub database refresh operation failed")
    return Response.json(
      {
        error:
          action === "restore"
            ? "Database refresh recovery failed"
            : "Database refresh failed; inspect the integration refresh state before retrying",
      },
      { status: 500 }
    )
  }
}
