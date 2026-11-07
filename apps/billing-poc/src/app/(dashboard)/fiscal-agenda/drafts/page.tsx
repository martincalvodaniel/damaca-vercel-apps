import { headers } from "next/headers"
import { redirect } from "next/navigation"
import PageLayout from "@/components/shared/PageLayout"
import { FiscalDraftView } from "@/features/fiscal-drafts/components/FiscalDraftView"
import { auth } from "@/lib/auth/auth"
import { madridDate } from "@/lib/domain/services/fiscal-calendar"
import { draftSelection } from "@/schemas/fiscal-draft-validator"

export default async function FiscalDraftPage({
  searchParams,
}: {
  searchParams: Promise<{ model?: string; quarter?: string }>
}) {
  const [session, params] = await Promise.all([
    headers().then((requestHeaders) =>
      auth.api.getSession({ headers: requestHeaders })
    ),
    searchParams,
  ])
  if (!session?.user.id) redirect("/auth/signin")
  const selection = draftSelection.safeParse({
    year: 2026,
    model: params.model ?? "303",
    quarter: params.quarter ?? Math.ceil(Number(madridDate().slice(5, 7)) / 3),
  })
  if (!selection.success) redirect("/fiscal-agenda/drafts")
  return (
    <PageLayout navigationSubtitle="Borradores fiscales">
      <FiscalDraftView
        owner={session.user.id}
        initialModel={selection.data.model}
        initialQuarter={selection.data.quarter}
      />
    </PageLayout>
  )
}
