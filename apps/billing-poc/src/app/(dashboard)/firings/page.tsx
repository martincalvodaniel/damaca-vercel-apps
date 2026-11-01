import { Suspense } from "react"
import PageLayout from "@/components/shared/PageLayout"
import FiringsPageContent from "@/features/firings/components/FiringsPageContent"
export default function FiringsPage() {
  return (
    <Suspense
      fallback={
        <PageLayout navigationSubtitle="Cocciones">
          <p role="status" className="p-4 text-zinc-600 dark:text-zinc-300">
            Cargando cocciones…
          </p>
        </PageLayout>
      }
    >
      <FiringsPageContent />
    </Suspense>
  )
}
