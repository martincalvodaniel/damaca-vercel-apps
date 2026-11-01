import { Suspense } from "react"
import PageLayout from "@/components/shared/PageLayout"
import CommissionsPageContent from "@/features/commissions/components/CommissionsPageContent"

export default function CommissionsPage() {
  return (
    <Suspense
      fallback={
        <PageLayout navigationSubtitle="Encargos">
          <p role="status" className="p-4 text-zinc-600 dark:text-zinc-300">
            Loading commissions…
          </p>
        </PageLayout>
      }
    >
      <CommissionsPageContent />
    </Suspense>
  )
}
