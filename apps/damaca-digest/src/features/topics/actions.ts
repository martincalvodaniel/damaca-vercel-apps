"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { requireAuthorizedSession } from "@/lib/auth/session"
import { deleteEmptyTopic, manageTopic } from "@/lib/db/topics"
import { articleId } from "@/schemas/article"
import { topicChange, topicSearch } from "@/schemas/topic"

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

export async function removeEmptyTopic(form: FormData) {
  const { user } = await requireAuthorizedSession()
  const topicId = articleId.safeParse(form.get("topicId"))
  const query = topicSearch.safeParse(form.get("q") ?? undefined)
  const params = new URLSearchParams()
  if (query.success && query.data) params.set("q", query.data)

  const result =
    topicId.success && form.get("confirm") === "true"
      ? await deleteEmptyTopic(user.id, topicId.data).catch(() => "failed")
      : "failed"
  if (result !== "deleted")
    params.set("result", result === "in_use" ? "in_use" : "delete_failed")
  revalidatePath("/topics")
  if (result === "deleted") revalidatePath("/")
  redirect(params.size ? `/topics?${params}` : "/topics")
}
