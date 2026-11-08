import "server-only"

import { MongoServerError } from "mongodb"

import { getDatabaseConnection } from "@/lib/database"

interface Identity {
  email: string
  emailVerified: boolean
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export function isAdmin(email: string) {
  return (process.env.ALLOWED_EMAILS ?? "")
    .split(",")
    .some((entry) => normalizeEmail(entry) === email)
}

function admittedEmails() {
  return getDatabaseConnection().db.collection<{ _id: string }>(
    "admitted-emails"
  )
}

export async function getAccessRole(user: Identity) {
  if (!user.emailVerified) return null

  const email = normalizeEmail(user.email)
  if (!email) return null
  if (isAdmin(email)) return "admin"

  return (await admittedEmails().findOne({ _id: email })) ? "member" : null
}

export async function admitEmail(email: string) {
  try {
    await admittedEmails().insertOne({ _id: email })
  } catch (error) {
    if (!(error instanceof MongoServerError && error.code === 11000))
      throw error
  }
}
