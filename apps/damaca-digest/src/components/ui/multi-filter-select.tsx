export function MultiFilterSelect({
  name,
  label,
  options,
  selected = [],
}: {
  name: string
  label: string
  options: readonly string[]
  selected?: readonly string[]
}) {
  return (
    <fieldset className="min-w-0 rounded-lg border border-(--panel-line) px-2 pb-1">
      <legend className="px-1">{label}</legend>
      <div className="grid max-h-32 grid-cols-2 gap-x-2 overflow-y-auto">
        {options.length ? (
          options.map((value) => (
            <label key={value} className="flex min-h-8 items-center gap-2">
              <input
                type="checkbox"
                className="shrink-0"
                name={name}
                value={value}
                defaultChecked={selected.includes(value)}
              />
              <span className="min-w-0 wrap-anywhere">{value}</span>
            </label>
          ))
        ) : (
          <p className="col-span-full py-1">No values available.</p>
        )}
      </div>
    </fieldset>
  )
}
