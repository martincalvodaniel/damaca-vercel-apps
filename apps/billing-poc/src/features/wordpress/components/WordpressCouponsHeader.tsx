import { IconButton } from "@/components/ui/IconButton"
import { PlusIcon } from "@/components/ui/icons/PlusIcon"

interface WordpressCouponsHeaderProps {
  onCreate: () => void
  onReload: () => void
  isReloadDisabled: boolean
}

export function WordpressCouponsHeader({
  onCreate,
  onReload,
  isReloadDisabled,
}: WordpressCouponsHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          WordPress Coupons
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          Fixed-cart, single-use coupons available in WooCommerce.
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <IconButton
          onClick={onCreate}
          ariaLabel="Crear cupón"
          title="Crear cupón"
          size="md"
          variant="info"
        >
          <PlusIcon className="h-4 w-4" />
        </IconButton>
        <IconButton
          onClick={onReload}
          ariaLabel="Recargar cupones e ir a la página 1"
          title="Recargar"
          size="md"
          variant="info"
          disabled={isReloadDisabled}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path d="M21 12a9 9 0 1 1-2.64-6.36" />
            <path d="M21 3v6h-6" />
          </svg>
        </IconButton>
      </div>
    </div>
  )
}
