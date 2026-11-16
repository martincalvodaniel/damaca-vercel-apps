"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { requireAuthorizedSession } from "@/lib/auth/session"
import {
  deleteArticle,
  editArticle,
  updateArticleReading,
} from "@/lib/db/articles"
import {
  articleEdit,
  articleId,
  articleReadingChange,
  articleRevision,
} from "@/schemas/article"

function lines(value: FormDataEntryValue | null) {
  return typeof value === "string"
    ? value
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
    : value
}

export async function saveArticleEdits(
  id: string,
  revision: number,
  _previous: string | null,
  form: FormData
) {
  const { user } = await requireAuthorizedSession()
  if (
    !articleId.safeParse(id).success ||
    !articleRevision.safeParse(String(revision)).success
  ) {
    return "This article could not be edited."
  }
  const input = articleEdit.safeParse({
    title: form.get("title"),
    authors: lines(form.get("authors")),
    source: form.get("source"),
    publishedAt: form.get("publishedAt"),
    language: form.get("language"),
    contentType: form.get("contentType"),
    summary: form.get("summary"),
    keyTakeaways: lines(form.get("keyTakeaways")),
    topics: form.has("topics") ? lines(form.get("topics")) : undefined,
    personalNotes: form.get("personalNotes"),
    readingStatus: form.get("readingStatus"),
    favorite: form.get("favorite") === "true",
  })
  if (!input.success)
    return "Check the article fields. Use one author or takeaway per line."

  try {
    if (!(await editArticle(user.id, id, revision, input.data))) {
      return "This article changed or is no longer available. Reload before editing."
    }
  } catch {
    return "The article could not be saved. Try again."
  }

  revalidatePath("/")
  revalidatePath(`/articles/${id}`)
  redirect(`/articles/${id}`)
}

export async function removeArticle(
  id: string,
  revision: number,
  form: FormData
) {
  const { user } = await requireAuthorizedSession()
  if (
    !articleId.safeParse(id).success ||
    !articleRevision.safeParse(String(revision)).success
  )
    redirect("/")
  const editPath = `/articles/${id}/edit`
  if (form.get("confirm") !== "true") redirect(`${editPath}?deletion=confirm`)

  const deleted = await deleteArticle(user.id, id, revision).catch(() => false)
  if (!deleted) redirect(`${editPath}?deletion=failed`)

  revalidatePath("/")
  redirect("/")
}

export async function setArticleReading(
  id: string,
  revision: number,
  form: FormData
) {
  const { user } = await requireAuthorizedSession()
  if (
    !articleId.safeParse(id).success ||
    !articleRevision.safeParse(String(revision)).success
  )
    redirect("/")
  const path = `/articles/${id}`
  const operation = articleReadingChange.safeParse(form.get("readingChange"))
  if (!operation.success) redirect(path)

  const change = operation.data
  const update =
    change === "read" || change === "unread"
      ? { readingStatus: change }
      : { favorite: change === "favorite" }
  const saved = await updateArticleReading(user.id, id, revision, update).catch(
    () => false
  )
  if (!saved) redirect(`${path}?readingUpdate=failed`)
  revalidatePath("/")
  revalidatePath(path)
  redirect(path)
}
