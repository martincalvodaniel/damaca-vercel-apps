"use client"

import { useLocale } from "@/lib/i18n/client"

export default function AppError({ retry }: { retry: () => void }) {
  const { t } = useLocale()
  return (
    <main className="mx-auto grid max-w-3xl gap-3 p-4">
      <h1 className="sr-only">{t.unexpectedError}</h1>
      <p aria-hidden="true">{t.unexpectedError}</p>
      <button type="button" onClick={retry} className="min-h-9 w-fit underline">
        {t.tryAgain}
      </button>
    </main>
  )
}
