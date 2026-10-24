import { useCallback } from "react"

type NumberStepperProps = {
  label: string
  value: number | null
  min: number
  max: number
  onChange: (value: number | null) => void
}

export function NumberStepper({
  label,
  value,
  min,
  max,
  onChange,
}: NumberStepperProps) {
  const step = useCallback(
    (amount: number) => {
      const next = (value ?? min) + amount
      onChange(Math.min(max, Math.max(min, next)))
    },
    [max, min, onChange, value]
  )
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.value === "") return onChange(null)
      const next = Number(event.target.value)
      if (Number.isInteger(next) && next >= min && next <= max) onChange(next)
    },
    [max, min, onChange]
  )
  const decrement = useCallback(() => step(-1), [step])
  const increment = useCallback(() => step(1), [step])

  const buttonClass =
    "grid size-9 shrink-0 place-items-center rounded-lg border border-zinc-300 text-lg font-semibold leading-none hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-1 disabled:opacity-35 dark:border-zinc-700 dark:hover:bg-zinc-800"

  return (
    <div className="flex items-center gap-0.5">
      <button
        type="button"
        className={buttonClass}
        aria-label={`Disminuir ${label}`}
        disabled={value === null ? min === 0 : value <= min}
        onClick={decrement}
      >
        −
      </button>
      <input
        aria-label={label}
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        step={1}
        value={value ?? ""}
        onChange={handleChange}
        className="min-h-9 w-10 rounded-lg border border-zinc-300 bg-transparent px-0.5 text-center text-lg font-bold tabular-nums dark:border-zinc-700"
      />
      <button
        type="button"
        className={buttonClass}
        aria-label={`Aumentar ${label}`}
        disabled={value !== null && value >= max}
        onClick={increment}
      >
        +
      </button>
    </div>
  )
}
