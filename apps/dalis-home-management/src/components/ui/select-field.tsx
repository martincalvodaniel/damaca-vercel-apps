"use client"

import type * as React from "react"
import {
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react"

import { SearchInput } from "@/components/ui/search-input"

interface SelectFieldOption {
  value: string
  label: string
}

interface SelectFieldProps {
  id: string
  options: readonly SelectFieldOption[]
  name?: string
  value?: string
  defaultValue?: string
  disabled?: boolean
  onValueChange?: (value: string) => void
  className?: string
  searchable?: boolean
  compact?: boolean
  searchPlaceholder?: string
}

const diacriticPattern = /\p{Diacritic}/gu

function normalizeSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(diacriticPattern, "")
    .toLocaleLowerCase("es")
}

export function SelectField({
  id,
  options,
  name,
  value,
  defaultValue,
  disabled = false,
  onValueChange,
  className = "",
  searchable = false,
  compact = false,
  searchPlaceholder = "Buscar",
}: SelectFieldProps) {
  const listboxId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const hiddenInputRef = useRef<HTMLInputElement>(null)
  const fallbackValue = defaultValue ?? options[0]?.value ?? ""
  const [internalValue, setInternalValue] = useState(fallbackValue)
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [search, setSearch] = useState("")
  const selectedValue = value ?? internalValue
  const normalizedSearch = normalizeSearch(search.trim())
  const visibleOptions = normalizedSearch
    ? options.filter((option) =>
        normalizeSearch(option.label).includes(normalizedSearch)
      )
    : options
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === selectedValue)
  )
  const selectedOption = options[selectedIndex]

  useEffect(() => {
    if (!isOpen) {
      return
    }

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("pointerdown", handlePointerDown)
    return () => document.removeEventListener("pointerdown", handlePointerDown)
  }, [isOpen])

  useEffect(() => {
    if (isOpen && searchable) {
      searchInputRef.current?.focus()
    }
  }, [isOpen, searchable])

  useEffect(() => {
    if (value !== undefined) {
      return
    }

    const form = hiddenInputRef.current?.form
    if (!form) {
      return
    }

    function handleReset() {
      setInternalValue(fallbackValue)
      setIsOpen(false)
    }

    form.addEventListener("reset", handleReset)
    return () => form.removeEventListener("reset", handleReset)
  }, [fallbackValue, value])

  const openListbox = useCallback(() => {
    if (disabled) {
      return
    }

    setSearch("")
    setActiveIndex(selectedIndex)
    setIsOpen(true)
  }, [disabled, selectedIndex])

  const selectOption = useCallback(
    (nextValue: string) => {
      if (value === undefined) {
        setInternalValue(nextValue)
      }
      onValueChange?.(nextValue)
      setSearch("")
      setIsOpen(false)
    },
    [value, onValueChange]
  )

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>) => {
      if (!isOpen) {
        if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
          event.preventDefault()
          openListbox()
        }
        return
      }

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault()
          setActiveIndex((current) => (current + 1) % options.length)
          break
        case "ArrowUp":
          event.preventDefault()
          setActiveIndex(
            (current) => (current - 1 + options.length) % options.length
          )
          break
        case "Home":
          event.preventDefault()
          setActiveIndex(0)
          break
        case "End":
          event.preventDefault()
          setActiveIndex(options.length - 1)
          break
        case "Enter":
        case " ":
          event.preventDefault()
          selectOption(options[activeIndex]?.value ?? selectedValue)
          break
        case "Escape":
          event.preventDefault()
          setIsOpen(false)
          break
        case "Tab":
          setIsOpen(false)
          break
      }
    },
    [isOpen, openListbox, options, selectOption, activeIndex, selectedValue]
  )

  const handleSearchKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (visibleOptions.length === 0) {
        if (event.key === "Escape") {
          event.preventDefault()
          setSearch("")
          setIsOpen(false)
          triggerRef.current?.focus()
        }
        return
      }

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault()
          setActiveIndex((current) => (current + 1) % visibleOptions.length)
          break
        case "ArrowUp":
          event.preventDefault()
          setActiveIndex(
            (current) =>
              (current - 1 + visibleOptions.length) % visibleOptions.length
          )
          break
        case "Enter":
          event.preventDefault()
          selectOption(visibleOptions[activeIndex]?.value ?? selectedValue)
          break
        case "Escape":
          event.preventDefault()
          setSearch("")
          setIsOpen(false)
          triggerRef.current?.focus()
          break
      }
    },
    [visibleOptions, selectOption, activeIndex, selectedValue]
  )

  const activateOption = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      setActiveIndex(Number(event.currentTarget.dataset.index))
    },
    []
  )

  const handleOptionClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      selectOption(event.currentTarget.dataset.value ?? "")
    },
    [selectOption]
  )

  const toggleListbox = useCallback(
    () => (isOpen ? setIsOpen(false) : openListbox()),
    [isOpen, openListbox]
  )

  const clearSearch = useCallback(() => {
    setSearch("")
    setActiveIndex(0)
  }, [])

  const changeSearch = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(event.target.value)
      setActiveIndex(0)
    },
    []
  )

  const blurSearch = useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      if (!rootRef.current?.contains(event.relatedTarget)) {
        setIsOpen(false)
      }
    },
    []
  )

  const keepSearchFocus = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => event.preventDefault(),
    []
  )

  return (
    <div ref={rootRef} className="relative">
      {name ? (
        <input
          ref={hiddenInputRef}
          type="hidden"
          name={name}
          value={selectedValue}
          disabled={disabled}
          readOnly
        />
      ) : null}
      <button
        ref={triggerRef}
        id={id}
        type="button"
        role="combobox"
        aria-controls={listboxId}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-activedescendant={
          isOpen && !searchable
            ? `${listboxId}-option-${activeIndex}`
            : undefined
        }
        disabled={disabled}
        onClick={toggleListbox}
        onKeyDown={handleKeyDown}
        className={`flex ${compact ? "min-h-9" : "min-h-12"} w-full items-center justify-between gap-3 rounded-xl border border-border bg-field px-4 text-left text-base font-normal outline-none transition focus:border-ring focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60   ${className}`}
      >
        <span className="min-w-0 truncate">{selectedOption?.label}</span>
        <svg
          className={`size-4 shrink-0 transition ${isOpen ? "rotate-180" : ""}`}
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="m3 6 5 5 5-5"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen ? (
        <div className="absolute left-0 top-[calc(100%+0.375rem)] z-50 max-h-64 w-full overflow-y-auto rounded-2xl border border-border bg-field p-1.5 text-base shadow-dialog">
          {searchable ? (
            <div className="sticky top-0 z-10 bg-field pb-1.5">
              <SearchInput
                ref={searchInputRef}
                onClear={clearSearch}
                value={search}
                aria-label={searchPlaceholder}
                aria-controls={listboxId}
                aria-activedescendant={
                  visibleOptions.length > 0
                    ? `${listboxId}-option-${activeIndex}`
                    : undefined
                }
                placeholder={searchPlaceholder}
                autoComplete="off"
                onChange={changeSearch}
                onKeyDown={handleSearchKeyDown}
                onBlur={blurSearch}
                className="min-h-11 w-full rounded-xl border border-control-border bg-field px-3 text-sm font-normal outline-none placeholder:text-placeholder focus:border-ring focus:ring-2 focus:ring-ring"
              />
            </div>
          ) : null}
          <div id={listboxId} role="listbox">
            {visibleOptions.length > 0 ? (
              visibleOptions.map((option, index) => (
                <button
                  key={option.value}
                  id={`${listboxId}-option-${index}`}
                  type="button"
                  role="option"
                  tabIndex={-1}
                  aria-selected={option.value === selectedValue}
                  data-index={index}
                  data-value={option.value}
                  onPointerMove={activateOption}
                  onPointerDown={keepSearchFocus}
                  onClick={handleOptionClick}
                  className={`flex ${compact ? "min-h-9 py-1" : "min-h-12 py-2.5"} w-full cursor-pointer items-center rounded-xl px-3.5 text-left leading-6 ${
                    index === activeIndex
                      ? "bg-primary-soft text-ink"
                      : "text-ink"
                  }`}
                >
                  <span className="min-w-0 flex-1 break-words">
                    {option.label}
                  </span>
                  {option.value === selectedValue ? (
                    <span className="ml-3 font-bold" aria-hidden="true">
                      ✓
                    </span>
                  ) : null}
                </button>
              ))
            ) : (
              <p className="px-3.5 py-3 text-sm text-muted">
                No hay resultados.
              </p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}
