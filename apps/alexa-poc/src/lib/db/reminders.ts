import "server-only"

import { COLLECTION_NAMES, getCollection } from "@/lib/db/collections"

interface ReminderDocument {
  ownerEmail: string
  text: string
  createdAt: Date
}

export async function saveReminder(ownerEmail: string, text: string) {
  const reminders = await getCollection<ReminderDocument>(
    COLLECTION_NAMES.reminders
  )
  await reminders.insertOne({ ownerEmail, text, createdAt: new Date() })
}

export async function listRecentReminders(ownerEmail: string) {
  const reminders = await getCollection<ReminderDocument>(
    COLLECTION_NAMES.reminders
  )
  const documents = await reminders
    .find({ ownerEmail })
    .sort({ createdAt: -1, _id: -1 })
    .limit(50)
    .toArray()

  return documents.map(({ _id, text }) => ({ id: _id.toHexString(), text }))
}
