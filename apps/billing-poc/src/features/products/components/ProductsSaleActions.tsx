"use client"

import { KilnIcon } from "@/components/ui/icons/KilnIcon"
import { LocalSaleIcon } from "@/components/ui/icons/LocalSaleIcon"
import { MarketSaleIcon } from "@/components/ui/icons/MarketSaleIcon"

interface ProductsSaleActionsProps {
  selectedCount: number
  hasSelection: boolean
  onLocalSaleClick: () => void
  onMarketSaleClick: () => void
  onKilnClick: () => void
}

const saleActionButtonClass =
  "inline-flex min-h-11 min-w-11 items-center gap-2 whitespace-nowrap rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700 dark:focus:ring-offset-zinc-900"

export default function ProductsSaleActions({
  selectedCount,
  hasSelection,
  onLocalSaleClick,
  onMarketSaleClick,
  onKilnClick,
}: ProductsSaleActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="rounded-full border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
        {selectedCount} selected
      </span>
      <button
        type="button"
        aria-label="Crear pago con etiqueta LocalSale"
        title={
          hasSelection
            ? "Crear pago con etiqueta LocalSale"
            : "Selecciona primero uno o varios productos"
        }
        onClick={onLocalSaleClick}
        disabled={!hasSelection}
        className={saleActionButtonClass}
      >
        <LocalSaleIcon />
        <span>Local</span>
      </button>
      <button
        type="button"
        aria-label="Crear pago con etiqueta MarketSale"
        title={
          hasSelection
            ? "Crear pago con etiqueta MarketSale"
            : "Selecciona primero uno o varios productos"
        }
        onClick={onMarketSaleClick}
        disabled={!hasSelection}
        className={saleActionButtonClass}
      >
        <MarketSaleIcon />
        <span>Mercado</span>
      </button>
      <button
        type="button"
        aria-label="Crear pago con etiqueta Cocción"
        title={
          hasSelection
            ? "Crear pago de cerámica"
            : "Selecciona primero uno o varios productos"
        }
        onClick={onKilnClick}
        disabled={!hasSelection}
        className={saleActionButtonClass}
      >
        <KilnIcon />
        <span>Horno</span>
      </button>
    </div>
  )
}
