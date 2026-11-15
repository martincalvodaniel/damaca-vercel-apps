"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { requireAuthorizedSession } from "@/lib/auth/session"
import { manageTopic } from "@/lib/db/topics"
import { topicChange } from "@/schemas/topic"

export async function updateTopic(form: FormData) {
  const { user } = await requireAuthorizedSession()
  const change = topicChange.safeParse({
    operation: form.get("operation"),
    topicId: form.get("topicId"),
    targetId: form.get("targetId"),
    label: form.get("label"),
  })
  if (!change.success) redirect("/topics?result=invalid")
  const updated = await manageTopic(user.id, change.data).catch(() => false)
  if (!updated) redirect("/topics?result=conflict")

  revalidatePath("/topics")
  revalidatePath("/")
  revalidatePath("/articles/[id]", "page")
  revalidatePath("/articles/[id]/edit", "page")
  redirect("/topics")
}
