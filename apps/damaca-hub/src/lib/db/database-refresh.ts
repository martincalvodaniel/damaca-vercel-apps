import "server-only"

import {
  refreshDatabase,
  restoreDatabaseRefresh,
} from "@damaca/database-refresh"
import { getDatabaseEnv, getDatabaseRefreshEnv } from "@/config/env"

const HUB_COLLECTION_POLICIES = {
  user: "preserve",
  session: "preserve",
  account: "preserve",
  verification: "preserve",
  jwks: "preserve",
  oauthClient: "preserve",
  oauthResource: "preserve",
  oauthClientResource: "preserve",
  oauthRefreshToken: "preserve",
  oauthAccessToken: "preserve",
  oauthConsent: "preserve",
  oauthClientAssertion: "preserve",
  applications: "copy",
  app_access: "copy",
  hub_oidc_clients: "preserve",
} as const

export async function refreshHubIntDatabase() {
  const refreshEnv = getDatabaseRefreshEnv()
  const sourceDatabase = getDatabaseEnv().databaseName
  if (refreshEnv.targetDatabase !== "damaca-hub-int") {
    throw new Error("The configured refresh target is not the Hub int database")
  }
  if (sourceDatabase === refreshEnv.targetDatabase) {
    throw new Error("The Hub refresh source and target databases must differ")
  }

  return refreshDatabase({
    sourceUri: refreshEnv.sourceUri,
    sourceDatabase,
    targetUri: refreshEnv.targetUri,
    targetDatabase: refreshEnv.targetDatabase,
    collections: HUB_COLLECTION_POLICIES,
  })
}

export async function restoreHubIntDatabase() {
  const refreshEnv = getDatabaseRefreshEnv()
  if (refreshEnv.targetDatabase !== "damaca-hub-int") {
    throw new Error("The configured refresh target is not the Hub int database")
  }
  return restoreDatabaseRefresh({
    targetUri: refreshEnv.targetUri,
    targetDatabase: refreshEnv.targetDatabase,
  })
}
