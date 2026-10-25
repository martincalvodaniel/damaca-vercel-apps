import "server-only"

import { oidcClientsSchema } from "@damaca/identity/registry"
import { closeDatabaseConnection, getDatabase } from "@/lib/db/client"
import { importLegacyOidcClient } from "@/lib/db/oidc-clients"

const publicAppIds = ["pocha-score", "card-wars"]

function readLegacyClients() {
  const raw = Bun.env["HUB" + "_OIDC_CLIENTS"]?.trim()
  if (!raw)
    throw new Error(
      "Provide the legacy HUB_OIDC_CLIENTS value for this one-time migration, or set it to [] when no previous clients exist"
    )
  return oidcClientsSchema.parse(JSON.parse(raw))
}

const legacyClients = readLegacyClients()
const database = await getDatabase()
const gamesClients = legacyClients.filter((client) =>
  publicAppIds.includes(client.appId)
)

try {
  for (const client of legacyClients) {
    if (publicAppIds.includes(client.appId)) continue
    const application = await database.collection("applications").findOne({
      id: client.appId,
    })
    if (!application)
      throw new Error(`Unknown legacy OIDC application: ${client.appId}`)
    const callbackOrigin = new URL(client.redirectUri).origin
    const environment =
      application.productionUrl &&
      new URL(application.productionUrl).origin === callbackOrigin
        ? "production"
        : application.preproductionUrl &&
            new URL(application.preproductionUrl).origin === callbackOrigin
          ? "int"
          : null
    if (!environment)
      throw new Error(
        `Configure the catalog URLs for ${client.appId} before importing its OIDC client`
      )
    await importLegacyOidcClient({ ...client, environment })
  }

  await database
    .collection("app_access")
    .deleteMany({ appId: { $in: publicAppIds } })
  await database
    .collection("applications")
    .updateMany(
      { id: { $in: publicAppIds } },
      { $set: { publicAccess: true, updatedAt: new Date() } }
    )
  await database
    .collection("hub_oidc_clients")
    .deleteMany({ appId: { $in: publicAppIds } })
  if (gamesClients.length > 0) {
    const clientIds = gamesClients.map((client) => client.clientId)
    await Promise.all([
      database
        .collection("oauthClient")
        .deleteMany({ clientId: { $in: clientIds } }),
      database
        .collection("oauthClientResource")
        .deleteMany({ clientId: { $in: clientIds } }),
      database
        .collection("oauthConsent")
        .deleteMany({ clientId: { $in: clientIds } }),
      database
        .collection("oauthClientAssertion")
        .deleteMany({ clientId: { $in: clientIds } }),
      database
        .collection("oauthAccessToken")
        .deleteMany({ clientId: { $in: clientIds } }),
      database
        .collection("oauthRefreshToken")
        .deleteMany({ clientId: { $in: clientIds } }),
    ])
  }
  console.info(
    `Public game migration complete: removed game access and ${gamesClients.length} legacy game client records; imported ${legacyClients.length - gamesClients.length} private clients.`
  )
} finally {
  await closeDatabaseConnection()
}
