import Link from "next/link"
import { messages } from "@/lib/i18n/messages"
import { getLocale } from "@/lib/i18n/server"

export default async function NotFound() {
  const t = messages[await getLocale()]
  return (
    <main className="mx-auto grid max-w-3xl gap-3 p-4">
      <h1 className="text-xl font-semibold">{t.pageNotFound}</h1>
      <Link href="/" className="w-fit underline">
        {t.backHome}
      </Link>
    </main>
  )
}
