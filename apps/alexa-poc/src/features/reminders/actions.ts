"use server"

import { redirect } from "next/navigation"
import { requireAuthorizedSession } from "@/lib/auth/session"
import { saveReminder } from "@/lib/db/reminders"
import { reminderTextSchema } from "@/schemas/reminder"

export async function createReminder(formData: FormData) {
  const { user } = await requireAuthorizedSession()
  const text = reminderTextSchema.safeParse(formData.get("text"))
  if (!text.success) redirect("/?error=invalid-reminder")

  await saveReminder(user.email.trim().toLowerCase(), text.data)
  redirect("/")
}
