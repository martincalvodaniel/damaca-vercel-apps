"use client"
import { useState } from "react"
import ClientQueryInput from "@/components/shared/ClientQueryInput"
import { useStableCallback } from "@/hooks/useStableCallback"
import type { FiringTemplate } from "@/lib/domain/entities/firing-template"
import { buildFiringTemplateConcept } from "@/lib/domain/entities/firing-template"
import type { PaymentConcept } from "@/lib/domain/entities/payment"
import { formatCurrency } from "@/lib/utils/formatters"
import { useFiringTemplates } from "../hooks/useFiringTemplates"
export default function FiringTemplateSelector({
  onSelect,
}: {
  onSelect: (concept: PaymentConcept) => void
}) {
  const [query, setQuery] = useState("")
  const { templates, error, isLoading } = useFiringTemplates()
  const suggestions = templates.filter((template) =>
    template.name
      .toLocaleLowerCase("es")
      .includes(query.trim().toLocaleLowerCase("es"))
  )
  function select(template: (typeof templates)[number]) {
    onSelect(buildFiringTemplateConcept(template))
    setQuery("")
  }
  function keyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") return
    event.preventDefault()
    if (!isLoading && !error && query.trim() && suggestions[0])
      select(suggestions[0])
  }
  function dropdown({
    closeDropdown,
  }: {
    closeDropdown: () => void
    trimmedValue: string
  }) {
    return (
      <div className="absolute top-full left-0 right-0 z-10 mt-1 rounded-md border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
        {error ? (
          <p
            role="alert"
            className="p-3 text-sm text-red-700 dark:text-red-400"
          >
            No se pudieron cargar las plantillas. Puedes añadir conceptos
            libres.
          </p>
        ) : isLoading ? (
          <p
            role="status"
            className="p-3 text-sm text-zinc-500 dark:text-zinc-400"
          >
            Cargando…
          </p>
        ) : suggestions.length ? (
          <ul className="max-h-60 overflow-y-auto py-1">
            {suggestions.map((template) => (
              <TemplateSuggestion
                key={template._id}
                template={template}
                onSelect={select}
                closeDropdown={closeDropdown}
              />
            ))}
          </ul>
        ) : (
          <p className="p-3 text-sm text-zinc-500 dark:text-zinc-400">
            No se encontraron plantillas
          </p>
        )}
      </div>
    )
  }
  return (
    <ClientQueryInput
      value={query}
      onChange={setQuery}
      label="Añadir plantilla"
      placeholder="Buscar plantillas por nombre..."
      ariaLabel="Buscar plantillas por nombre"
      clearAriaLabel="Borrar búsqueda de plantillas"
      onKeyDown={keyDown}
      renderDropdown={dropdown}
    />
  )
}
function TemplateSuggestion({
  template,
  onSelect,
  closeDropdown,
}: {
  template: FiringTemplate
  onSelect: (template: FiringTemplate) => void
  closeDropdown: () => void
}) {
  const choose = useStableCallback(() => {
    onSelect(template)
    closeDropdown()
  })
  const mouseDown = useStableCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => event.preventDefault()
  )
  return (
    <li>
      <button
        type="button"
        onMouseDown={mouseDown}
        onClick={choose}
        className="flex w-full items-center justify-between gap-3 px-4 py-2 text-left text-sm text-zinc-900 hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-zinc-100 dark:hover:bg-zinc-700"
      >
        <span>{template.name}</span>
        <span>{formatCurrency(template.price)}</span>
      </button>
    </li>
  )
}
