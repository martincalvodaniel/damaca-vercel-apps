interface BrandMarkProps {
  compact?: boolean
}

export function BrandMark({ compact = false }: BrandMarkProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-[0.9rem] bg-primary text-sm font-bold text-on-primary shadow-soft">
        <span aria-hidden="true">D·P</span>
        <div
          className="absolute -bottom-3 -right-2 size-6 rounded-full bg-accent"
          aria-hidden="true"
        />
      </div>
      {compact ? null : (
        <div>
          <p className="text-lg font-semibold leading-none tracking-[-0.04em] text-ink">
            Dali
          </p>
          <p className="mt-1 text-[0.63rem] font-medium uppercase tracking-[0.18em] text-muted">
            Dani + Pali
          </p>
        </div>
      )}
    </div>
  )
}
