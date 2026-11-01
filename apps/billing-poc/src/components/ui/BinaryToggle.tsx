import type { ReactNode } from "react"
import SegmentedControl from "./SegmentedControl"

export type BinaryToggleValue = "left" | "right"

interface BinaryToggleProps {
  value: BinaryToggleValue
  leftLabel: string
  rightLabel: string
  ariaLabel: string
  onChange: (value: BinaryToggleValue) => void
  leading?: ReactNode
  className?: string
  leftIndicatorClassName?: string
  rightIndicatorClassName?: string
  leftSelectedTextClassName?: string
  rightSelectedTextClassName?: string
}

export default function BinaryToggle({
  value,
  leftLabel,
  rightLabel,
  ariaLabel,
  onChange,
  leading,
  className = "",
  leftIndicatorClassName = "bg-blue-600 dark:bg-blue-700",
  rightIndicatorClassName = "bg-blue-600 dark:bg-blue-700",
  leftSelectedTextClassName = "text-white",
  rightSelectedTextClassName = "text-white",
}: BinaryToggleProps) {
  return (
    <SegmentedControl
      value={value}
      ariaLabel={ariaLabel}
      onChange={onChange}
      leading={leading}
      className={className}
      options={[
        {
          value: "left",
          label: leftLabel,
          indicatorClassName: leftIndicatorClassName,
          selectedTextClassName: leftSelectedTextClassName,
        },
        {
          value: "right",
          label: rightLabel,
          indicatorClassName: rightIndicatorClassName,
          selectedTextClassName: rightSelectedTextClassName,
        },
      ]}
    />
  )
}
