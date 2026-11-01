"use client"
import type { ReactNode } from "react"
import { useStableCallback } from "@/hooks/useStableCallback"

interface SegmentOption<T extends string | number> {
  value: T
  label: string
  indicatorClassName?: string
  selectedTextClassName?: string
}
type SegmentOptions<T extends string | number> =
  | readonly [SegmentOption<T>, SegmentOption<T>]
  | readonly [SegmentOption<T>, SegmentOption<T>, SegmentOption<T>]

interface SegmentedControlProps<T extends string | number> {
  value: T
  options: SegmentOptions<T>
  ariaLabel: string
  onChange: (value: T) => void
  leading?: ReactNode
  className?: string
  disabled?: boolean
}

export default function SegmentedControl<T extends string | number>({
  value,
  options,
  ariaLabel,
  onChange,
  leading,
  className = "",
  disabled = false,
}: SegmentedControlProps<T>) {
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value)
  )
  const selected = options[selectedIndex]
  const position = ["translate-x-0", "translate-x-full", "translate-x-[200%]"][
    selectedIndex
  ]
  return (
    <fieldset
      disabled={disabled}
      aria-label={ariaLabel}
      className={`inline-flex h-11 overflow-hidden rounded-lg border border-zinc-300 bg-zinc-100 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:focus-within:ring-offset-zinc-900 ${className}`}
    >
      <legend className="sr-only">{ariaLabel}</legend>
      {leading ? (
        <span
          className="flex h-full items-center px-2 text-sm"
          aria-hidden="true"
        >
          {leading}
        </span>
      ) : null}
      <div
        className={`relative grid min-w-0 flex-1 ${options.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}
      >
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute inset-y-0 left-0 transition-[transform,background-color] duration-200 ease-out motion-reduce:transition-none ${options.length === 3 ? "w-1/3" : "w-1/2"} ${position} ${selected?.indicatorClassName ?? "bg-blue-600 dark:bg-blue-700"}`}
        />
        {options.map((option) => (
          <SegmentButton
            key={option.value}
            option={option}
            selected={option.value === value}
            onChange={onChange}
          />
        ))}
      </div>
    </fieldset>
  )
}
function SegmentButton<T extends string | number>({
  option,
  selected,
  onChange,
}: {
  option: SegmentOption<T>
  selected: boolean
  onChange: (value: T) => void
}) {
  const select = useStableCallback(() => onChange(option.value))
  return (
    <button
      type="button"
      onClick={select}
      aria-pressed={selected}
      className={`relative z-10 min-w-0 px-3 py-2 text-sm font-medium transition-colors focus:outline-none ${selected ? (option.selectedTextClassName ?? "text-white") : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white"}`}
    >
      {option.label}
    </button>
  )
}
