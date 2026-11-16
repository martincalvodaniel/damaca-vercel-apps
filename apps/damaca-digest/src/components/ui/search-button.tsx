import { DigestIcon } from "@/components/ui/digest-icon"

export function SearchButton({ label }: { label: string }) {
  return (
    <button
      type="submit"
      aria-label={label}
      title={label}
      className="grid size-11 shrink-0 place-items-center rounded-lg text-white [&>span]:hover:bg-teal-900"
    >
      <span className="grid size-8 place-items-center rounded-lg bg-teal-800">
        <DigestIcon name="search" />
      </span>
    </button>
  )
}
