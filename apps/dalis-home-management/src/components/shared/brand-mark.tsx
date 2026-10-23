interface BrandMarkProps {
  compact?: boolean
}

export function BrandMark({ compact = false }: BrandMarkProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-[0.9rem] bg-[#1d4f40] text-sm font-bold text-white shadow-[0_6px_18px_rgba(29,79,64,0.2)]">
        <span aria-hidden="true">D·P</span>
        <div
          className="absolute -bottom-3 -right-2 size-6 rounded-full bg-[#e8966f]"
          aria-hidden="true"
        />
      </div>
      {compact ? null : (
        <div>
          <p className="text-lg font-semibold leading-none tracking-[-0.04em] text-[#17352b] dark:text-[#f4f1e7]">
            Dali
          </p>
          <p className="mt-1 text-[0.63rem] font-medium uppercase tracking-[0.18em] text-[#6f7f75] dark:text-[#9eaaa2]">
            Dani + Pali
          </p>
        </div>
      )}
    </div>
  )
}
