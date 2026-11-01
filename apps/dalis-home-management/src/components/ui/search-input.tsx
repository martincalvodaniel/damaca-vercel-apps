"use client"

import { type ComponentProps, type RefObject, useCallback, useRef } from "react"

interface SearchInputProps
  extends Omit<ComponentProps<"input">, "type" | "ref" | "value"> {
  value: string
  onClear: () => void
  ref?: RefObject<HTMLInputElement | null>
}

export function SearchInput({
  value,
  onClear,
  ref,
  className = "",
  disabled,
  ...props
}: SearchInputProps) {
  const fallbackRef = useRef<HTMLInputElement>(null)
  const inputRef = ref ?? fallbackRef

  const clearSearch = useCallback(() => {
    onClear()
    inputRef.current?.focus()
  }, [onClear, inputRef])

  return (
    <span className="relative block w-full">
      <input
        {...props}
        ref={inputRef}
        type="search"
        value={value}
        disabled={disabled}
        className={`${className} pr-11 [&::-webkit-search-cancel-button]:appearance-none`}
      />
      {value.length > 0 ? (
        <button
          type="button"
          onClick={clearSearch}
          disabled={disabled}
          aria-label="Limpiar búsqueda"
          className="absolute top-1/2 right-1 grid size-8 -translate-y-1/2 place-items-center rounded-full text-danger transition hover:bg-danger-soft focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-50"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="size-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <path d="m6 6 12 12M18 6 6 18" />
          </svg>
        </button>
      ) : null}
    </span>
  )
}
