import "server-only"

import { COLLECTION_NAMES, getCollection } from "@/lib/db/collections"
import { accessEmailSchema } from "@/schemas/email"
import type {
  ApplicationAdminData,
  ApplicationEntry,
  AppRequestStatus,
} from "@/types/access"

export const PUBLIC_APPLICATION_IDS = new Set(["pocha-score", "card-wars"])

export function isPublicApplication(appId: string): boolean {
  return PUBLIC_APPLICATION_IDS.has(appId)
}

interface ApplicationDocument {
  id: string
  name: string
  description: string
  productionUrl: string | null
  preproductionUrl: string | null
  order: number
  active: boolean
  publicAccess?: boolean
  createdAt: Date
  updatedAt: Date
}

interface AppAccessDocument {
  appId: string
  email: string
  status: AppRequestStatus
  createdAt: Date
  requestId?: string
  requestedAt?: Date
  resolvedAt?: Date
  resolvedBy?: string
}

const APPLICATION_SEEDS: readonly Omit<
  ApplicationDocument,
  "createdAt" | "updatedAt"
>[] = [
  {
    id: "billing-poc",
    name: "Billing POC",
    description: "Track household bills and recurring payments.",
    productionUrl: null,
    preproductionUrl: null,
    order: 10,
    active: true,
  },
  {
    id: "dalis-home-management",
    name: "Dalis Home Management",
    description: "Organize household information and routines.",
    productionUrl: null,
    preproductionUrl: null,
    order: 20,
    active: true,
  },
  {
    id: "dalis-tasks-events",
    name: "Dalis Tasks & Events",
    description: "Plan tasks, events, and shared schedules.",
    productionUrl: null,
    preproductionUrl: null,
    order: 30,
    active: true,
  },
  {
    id: "pocha-score",
    name: "Pocha Score",
    description: "Keep score and history for games of Pocha.",
    productionUrl: null,
    preproductionUrl: null,
    order: 40,
    active: true,
    publicAccess: true,
  },
  {
    id: "card-wars",
    name: "Card Wars",
    description: "Track Card Wars matches and scores.",
    productionUrl: null,
    preproductionUrl: null,
    order: 50,
    active: true,
    publicAccess: true,
  },
]

async function applicationCollection() {
  return getCollection<ApplicationDocument>(COLLECTION_NAMES.applications)
}

async function accessCollection() {
  return getCollection<AppAccessDocument>(COLLECTION_NAMES.appAccess)
}

function toApplication(document: ApplicationDocument): ApplicationEntry {
  return {
    id: document.id,
    name: document.name,
    description: document.description,
    productionUrl: document.productionUrl,
    preproductionUrl: document.preproductionUrl,
    order: document.order,
    active: document.active,
    publicAccess: document.publicAccess ?? isPublicApplication(document.id),
    accessStatus: null,
  }
}

export async function ensureApplicationSeeds(): Promise<void> {
  const collection = await applicationCollection()
  const now = new Date()
  await collection.bulkWrite(
    APPLICATION_SEEDS.map((seed) => ({
      updateOne: {
        filter: { id: seed.id },
        update: { $setOnInsert: { ...seed, createdAt: now, updatedAt: now } },
        upsert: true,
      },
    })),
    { ordered: false }
  )
}

export async function listApplications(): Promise<ApplicationEntry[]> {
  await ensureApplicationSeeds()
  const documents = await (await applicationCollection())
    .find({})
    .sort({ order: 1, id: 1 })
    .toArray()
  return documents.map(toApplication)
}

export async function saveApplication(
  application: Omit<ApplicationEntry, "accessStatus" | "publicAccess">
): Promise<void> {
  const collection = await applicationCollection()
  const result = await collection.updateOne(
    { id: application.id },
    {
      $set: {
        name: application.name,
        description: application.description,
        productionUrl: application.productionUrl,
        preproductionUrl: application.preproductionUrl,
        order: application.order,
        active: application.active,
        updatedAt: new Date(),
      },
    }
  )
  if (result.matchedCount !== 1) throw new Error("Application does not exist")
}

export async function getApplicationStatus(
  email: string
): Promise<Map<string, AppRequestStatus>> {
  const normalizedEmail = accessEmailSchema.parse(email)
  const documents = await (await accessCollection())
    .find({ email: normalizedEmail })
    .toArray()
  return new Map(documents.map((entry) => [entry.appId, entry.status]))
}

export async function submitApplicationRequest(
  appId: string,
  email: string
): Promise<{ created: boolean; status: "pending" | "approved" }> {
  if (isPublicApplication(appId)) throw new Error("Application is public")
  const collection = await accessCollection()
  const normalizedEmail = accessEmailSchema.parse(email)
  const application = await (await applicationCollection()).findOne(
    { id: appId },
    { projection: { id: 1 } }
  )
  if (!application) throw new Error("Application does not exist")
  const now = new Date()
  const requestId = crypto.randomUUID()
  const reopened = await collection.updateOne(
    { appId, email: normalizedEmail, status: { $in: ["rejected", "revoked"] } },
    {
      $set: { status: "pending", requestId, requestedAt: now },
      $unset: { resolvedAt: "", resolvedBy: "" },
    }
  )
  if (reopened.modifiedCount > 0) return { created: true, status: "pending" }
  try {
    const result = await collection.updateOne(
      { appId, email: normalizedEmail },
      {
        $setOnInsert: {
          appId,
          email: normalizedEmail,
          status: "pending",
          createdAt: now,
          requestId,
          requestedAt: now,
        },
      },
      { upsert: true }
    )
    if (result.upsertedCount === 1) return { created: true, status: "pending" }
  } catch (error: unknown) {
    if (!(error instanceof Error && "code" in error && error.code === 11000))
      throw error
  }
  const existing = await collection.findOne(
    { appId, email: normalizedEmail },
    { projection: { status: 1 } }
  )
  if (existing?.status === "approved")
    return { created: false, status: "approved" }
  if (existing?.status === "pending")
    return { created: false, status: "pending" }
  throw new Error("Unable to create an application access request")
}

export async function resolveApplicationRequest(
  appId: string,
  email: string,
  requestId: string,
  decision: "approve" | "reject",
  resolvedBy: string
): Promise<boolean> {
  if (isPublicApplication(appId)) return false
  const application = await (await applicationCollection()).findOne(
    { id: appId },
    { projection: { id: 1 } }
  )
  if (!application) return false
  const result = await (await accessCollection()).updateOne(
    {
      appId,
      email: accessEmailSchema.parse(email),
      requestId,
      status: "pending",
    },
    {
      $set: {
        status: decision === "approve" ? "approved" : "rejected",
        resolvedAt: new Date(),
        resolvedBy: accessEmailSchema.parse(resolvedBy),
      },
    }
  )
  return result.modifiedCount === 1
}

export async function changeApplicationAccess(
  appId: string,
  email: string,
  operation: "grant" | "revoke",
  actorEmail: string
): Promise<boolean> {
  if (isPublicApplication(appId)) return false
  const collection = await accessCollection()
  const normalizedEmail = accessEmailSchema.parse(email)
  const application = await (await applicationCollection()).findOne(
    { id: appId },
    { projection: { id: 1 } }
  )
  if (!application) throw new Error("Application does not exist")
  if (operation === "revoke") {
    const result = await collection.updateOne(
      { appId, email: normalizedEmail, status: "approved" },
      {
        $set: {
          status: "revoked",
          resolvedAt: new Date(),
          resolvedBy: accessEmailSchema.parse(actorEmail),
        },
        $unset: { requestId: "", requestedAt: "" },
      }
    )
    return result.modifiedCount === 1
  }
  await collection.updateOne(
    { appId, email: normalizedEmail },
    {
      $set: {
        status: "approved",
        resolvedAt: new Date(),
        resolvedBy: accessEmailSchema.parse(actorEmail),
      },
      $setOnInsert: { appId, email: normalizedEmail, createdAt: new Date() },
      $unset: { requestId: "", requestedAt: "" },
    },
    { upsert: true }
  )
  return true
}

export async function listApplicationAdminData(
  oidcClientsByApp: Map<
    string,
    import("@/types/access").OidcClientSummary[]
  > = new Map()
): Promise<ApplicationAdminData[]> {
  const applications = await listApplications()
  const documents = await (await accessCollection())
    .find({})
    .sort({ appId: 1, email: 1 })
    .toArray()
  const accessByApp = new Map<string, AppAccessDocument[]>()
  for (const document of documents) {
    const entries = accessByApp.get(document.appId) ?? []
    entries.push(document)
    accessByApp.set(document.appId, entries)
  }
  return applications.map((app) => {
    const entries = accessByApp.get(app.id) ?? []
    return {
      app,
      grants: entries
        .filter((entry) => entry.status === "approved")
        .map((entry) => ({
          appId: entry.appId,
          email: entry.email,
          createdAt: entry.createdAt.toISOString(),
          status: "approved",
        })),
      requests: entries
        .filter((entry) => entry.status === "pending")
        .map((entry) => {
          if (!entry.requestId || !entry.requestedAt)
            throw new Error("Invalid pending application access request")
          return {
            appId: entry.appId,
            email: entry.email,
            requestId: entry.requestId,
            requestedAt: entry.requestedAt.toISOString(),
          }
        }),
      oidcClients: oidcClientsByApp.get(app.id) ?? [],
    }
  })
}

export async function hasApplicationAccess(
  appId: string,
  email: string
): Promise<boolean> {
  if (isPublicApplication(appId)) return false
  const application = await (await applicationCollection()).findOne({
    id: appId,
    active: true,
  })
  if (!application) return false
  const grant = await (await accessCollection()).findOne({
    appId,
    email: accessEmailSchema.parse(email),
    status: "approved",
  })
  return grant !== null
}
