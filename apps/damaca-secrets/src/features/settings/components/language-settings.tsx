"use client"

import { useRouter } from "next/navigation"
import { type ChangeEvent, useCallback, useId, useState } from "react"
import { saveLocale, useLocale } from "@/lib/i18n/client"
import { parseLocale } from "@/lib/i18n/locale"

export function LanguageSettings() {
  const id = useId()
  const router = useRouter()
  const { locale, t } = useLocale()
  const [failed, setFailed] = useState(false)

  const changeLocale = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const saved = saveLocale(parseLocale(event.target.value))
      setFailed(!saved)
      if (saved) router.refresh()
    },
    [router]
  )

  return (
    <div className="grid gap-2 text-sm">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="font-medium">
          {t.language}
        </label>
        <select
          id={id}
          value={locale}
          onChange={changeLocale}
          className="min-h-9 rounded-lg border border-zinc-300 bg-transparent px-3 dark:border-zinc-700"
        >
          <option value="es" lang="es">
            Español
          </option>
          <option value="en" lang="en">
            English
          </option>
        </select>
      </div>
      {failed ? <p role="status">{t.languageNotSaved}</p> : null}
    </div>
  )
}
