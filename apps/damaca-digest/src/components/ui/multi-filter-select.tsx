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
      <div className="max-h-32 overflow-y-auto">
        {options.length ? (
          options.map((value) => (
            <label
              key={value}
              className="flex min-h-8 items-center gap-2 break-all"
            >
              <input
                type="checkbox"
                name={name}
                value={value}
                defaultChecked={selected.includes(value)}
              />
              <span>{value}</span>
            </label>
          ))
        ) : (
          <p className="py-1">No values available.</p>
        )}
      </div>
    </fieldset>
  )
}
