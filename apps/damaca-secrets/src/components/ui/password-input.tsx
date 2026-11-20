"use client"

import {
  type ComponentPropsWithRef,
  type PointerEvent,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react"
import { ActionIcon } from "@/components/ui/action-icon"
import { useLocale } from "@/lib/i18n/client"

type PasswordInputProps = Omit<ComponentPropsWithRef<"input">, "type"> & {
  label: string
  fieldClassName?: string
}

function preserveInputFocus(event: PointerEvent<HTMLButtonElement>) {
  if (event.pointerType === "mouse") event.preventDefault()
}

export function PasswordInput({
  label,
  id,
  ref,
  className = "",
  fieldClassName = "",
  ...props
}: PasswordInputProps) {
  const { t } = useLocale()
  const generatedId = useId()
  const inputId = id ?? generatedId
  const wrapper = useRef<HTMLDivElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const [visible, setVisible] = useState(false)

  const conceal = useCallback(() => {
    clearTimeout(timer.current)
    setVisible(false)
  }, [])
  const reveal = useCallback(() => {
    clearTimeout(timer.current)
    setVisible(true)
    timer.current = setTimeout(conceal, 1000)
  }, [conceal])

  useEffect(() => {
    const form = wrapper.current?.closest("form")
    function concealWhenHidden() {
      if (document.visibilityState !== "visible") conceal()
    }
    form?.addEventListener("submit", conceal, true)
    form?.addEventListener("reset", conceal)
    window.addEventListener("pagehide", conceal)
    document.addEventListener("visibilitychange", concealWhenHidden)
    return () => {
      clearTimeout(timer.current)
      form?.removeEventListener("submit", conceal, true)
      form?.removeEventListener("reset", conceal)
      window.removeEventListener("pagehide", conceal)
      document.removeEventListener("visibilitychange", concealWhenHidden)
    }
  }, [conceal])

  return (
    <div className={`grid min-w-0 gap-1 ${fieldClassName}`} ref={wrapper}>
      <label htmlFor={inputId}>{label}</label>
      <div className="relative min-w-0">
        <input
          {...props}
          id={inputId}
          ref={ref}
          type={visible ? "text" : "password"}
          spellCheck={false}
          autoCapitalize="none"
          className={`${className} pe-10`}
        />
        <button
          type="button"
          aria-label={t.showPasswordBriefly}
          title={t.showPasswordBriefly}
          aria-controls={inputId}
          data-revealed={visible ? "true" : undefined}
          onPointerDown={preserveInputFocus}
          onClick={reveal}
          className="absolute inset-y-0 end-0 flex w-9 items-center justify-center rounded-e-lg text-zinc-600 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-emerald-600 dark:text-zinc-300"
        >
          <ActionIcon icon={visible ? "hide" : "show"} />
        </button>
      </div>
    </div>
  )
}
