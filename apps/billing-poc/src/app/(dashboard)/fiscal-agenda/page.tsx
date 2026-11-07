import { headers } from "next/headers"
import { redirect } from "next/navigation"
import PageLayout from "@/components/shared/PageLayout"
import { FiscalAgendaView } from "@/features/fiscal-agenda/components/FiscalAgendaView"
import { auth } from "@/lib/auth/auth"
import { madridDate } from "@/lib/domain/services/fiscal-calendar"

export default async function FiscalAgendaPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user.id) redirect("/auth/signin")

  return (
    <PageLayout navigationSubtitle="Agenda fiscal">
      <FiscalAgendaView
        owner={session.user.id}
        initialYear={Number(madridDate().slice(0, 4))}
      />
    </PageLayout>
  )
}
