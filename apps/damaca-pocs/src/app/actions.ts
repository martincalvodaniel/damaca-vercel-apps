"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { getAuth } from "@/lib/auth"

export async function signIn() {
  const { url } = await getAuth().api.signInSocial({
    headers: await headers(),
    body: {
      provider: "google",
      callbackURL: "/",
      errorCallbackURL: "/?auth=error",
    },
  })

  if (!url) redirect("/?auth=error")
  redirect(url)
}

export async function signOut() {
  await getAuth().api.signOut({ headers: await headers() })
  redirect("/")
}
