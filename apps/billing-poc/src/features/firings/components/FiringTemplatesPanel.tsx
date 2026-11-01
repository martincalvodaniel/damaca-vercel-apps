"use client"
import { useId, useState } from "react"
import AddButton from "@/components/ui/AddButton"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { EmptyState } from "@/components/ui/EmptyState"
import { ErrorBanner } from "@/components/ui/ErrorBanner"
import FormField from "@/components/ui/FormField"
import { IconButton } from "@/components/ui/IconButton"
import { PencilIcon } from "@/components/ui/icons/PencilIcon"
import { TrashIcon } from "@/components/ui/icons/TrashIcon"
import { ConfirmFooter, Modal } from "@/components/ui/Modal"
import NumberStepperInput from "@/components/ui/NumberStepperInput"
import { extractErrorMessage } from "@/features/events/components/attendeesPanel-utils"
import { useStableCallback } from "@/hooks/useStableCallback"
import type { FiringTemplate } from "@/lib/domain/entities/firing-template"
import { formatCurrency } from "@/lib/utils/formatters"
import { firingTemplateSchema } from "@/schemas/firing-template-validator"
import {
  useCreateFiringTemplate,
  useDeleteFiringTemplate,
  useFiringTemplates,
  useUpdateFiringTemplate,
} from "../hooks/useFiringTemplates"

export default function FiringTemplatesPanel({
  onSuccess,
}: {
  onSuccess: (message: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const {
    templates,
    error: loadError,
    isLoading,
  } = useFiringTemplates(expanded)
  const [editing, setEditing] = useState<FiringTemplate | null>(null)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<FiringTemplate | null>(null)
  const [error, setError] = useState<string | null>(null)
  const remove = useDeleteFiringTemplate()
  async function confirmDelete() {
    if (!deleting?._id) return
    try {
      await remove.trigger({ id: deleting._id })
      setDeleting(null)
      onSuccess("Plantilla eliminada")
    } catch (error) {
      setError(extractErrorMessage(error, "No se pudo eliminar la plantilla"))
    }
  }
  function closeEditor() {
    setEditing(null)
    setCreating(false)
  }
  function toggle(event: React.SyntheticEvent<HTMLDetailsElement>) {
    setExpanded(event.currentTarget.open)
  }
  function openCreate() {
    setCreating(true)
  }
  function openDelete(template: FiringTemplate) {
    setError(null)
    setDeleting(template)
  }
  function saved() {
    closeEditor()
    onSuccess("Plantilla guardada")
  }
  function closeDelete() {
    if (!remove.isMutating) setDeleting(null)
  }
  function submitDelete() {
    void confirmDelete()
  }
  return (
    <>
      <details
        onToggle={toggle}
        className="rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
      >
        <summary className="cursor-pointer rounded-lg px-6 py-4 text-sm font-semibold text-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-zinc-100">
          Plantillas de cocción
        </summary>
        <div className="space-y-4 border-t border-zinc-200 p-4 dark:border-zinc-800">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
              Plantillas
            </h2>
            <AddButton
              ariaLabel="Añadir plantilla"
              title="Nueva plantilla"
              onClick={openCreate}
            />
          </div>
          {loadError ? (
            <ErrorBanner>No se pudieron cargar las plantillas</ErrorBanner>
          ) : null}
          {isLoading ? (
            <p
              role="status"
              className="text-sm text-zinc-600 dark:text-zinc-300"
            >
              Cargando plantillas…
            </p>
          ) : !templates.length ? (
            <EmptyState>
              No hay plantillas. Añade una para reutilizar su nombre y precio.
            </EmptyState>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
              <table className="w-full border-collapse text-sm text-zinc-900 dark:text-zinc-100">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800">
                    <th scope="col" className="px-4 py-3 text-left">
                      Nombre
                    </th>
                    <th scope="col" className="px-4 py-3 text-left">
                      Precio
                    </th>
                    <th scope="col" className="px-4 py-3 text-right">
                      <span className="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {templates.map((template) => (
                    <TemplateRow
                      key={template._id}
                      template={template}
                      onEdit={setEditing}
                      onDelete={openDelete}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </details>
      {creating || editing ? (
        <FiringTemplateModal
          key={editing?._id ?? "new"}
          template={editing ?? undefined}
          onClose={closeEditor}
          onSaved={saved}
        />
      ) : null}
      <ConfirmDialog
        isOpen={Boolean(deleting)}
        title="Eliminar plantilla"
        confirmLabel="Eliminar"
        pendingLabel="Eliminando…"
        variant="danger"
        isPending={remove.isMutating}
        error={error}
        onCancel={closeDelete}
        onConfirm={submitDelete}
      >
        <p className="text-sm text-zinc-700 dark:text-zinc-300">
          ¿Eliminar «{deleting?.name}»? Los conceptos de las cocciones
          existentes se conservarán.
        </p>
      </ConfirmDialog>
    </>
  )
}
function FiringTemplateModal({
  template,
  onClose,
  onSaved,
}: {
  template?: FiringTemplate
  onClose: () => void
  onSaved: () => void
}) {
  const id = useId()
  const [name, setName] = useState(template?.name ?? "")
  const [price, setPrice] = useState(template ? String(template.price) : "")
  const [error, setError] = useState<string | null>(null)
  const create = useCreateFiringTemplate()
  const update = useUpdateFiringTemplate()
  const pending = create.isMutating || update.isMutating
  async function save() {
    if (pending) return
    setError(null)
    const parsed = firingTemplateSchema.safeParse({
      name,
      price: price.trim() ? Number(price) : Number.NaN,
    })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Plantilla no válida")
      return
    }
    try {
      if (template?._id)
        await update.trigger({ id: template._id, ...parsed.data })
      else await create.trigger(parsed.data)
      onSaved()
    } catch (error) {
      setError(extractErrorMessage(error, "No se pudo guardar la plantilla"))
    }
  }
  const close = useStableCallback(() => {
    if (!pending) onClose()
  })
  const confirmSave = useStableCallback(() => {
    void save()
  })
  const submit = useStableCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      void save()
    }
  )
  const changeName = useStableCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setName(event.target.value)
    }
  )
  return (
    <Modal
      isOpen
      onClose={close}
      title={template ? "Editar plantilla" : "Nueva plantilla"}
      maxWidth="lg"
      footer={
        <ConfirmFooter
          onConfirm={confirmSave}
          onCancel={close}
          isPending={pending}
          confirmLabel="Guardar"
          pendingLabel="Guardando…"
        />
      }
    >
      <form className="space-y-4" onSubmit={submit}>
        {error ? <ErrorBanner>{error}</ErrorBanner> : null}
        <FormField id={`${id}-name`} label="Nombre" required>
          <input
            id={`${id}-name`}
            value={name}
            onChange={changeName}
            disabled={pending}
            required
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </FormField>
        <FormField id={`${id}-price`} label="Precio (€), IVA incluido" required>
          <NumberStepperInput
            id={`${id}-price`}
            value={price}
            onValueChange={setPrice}
            ariaLabel="Precio de la plantilla"
            step={5}
            min={0}
            inputMode="decimal"
            disabled={pending}
            required
          />
        </FormField>
        <button
          type="submit"
          className="sr-only"
          tabIndex={-1}
          disabled={pending}
        >
          Guardar
        </button>
      </form>
    </Modal>
  )
}

function TemplateRow({
  template,
  onEdit,
  onDelete,
}: {
  template: FiringTemplate
  onEdit: (template: FiringTemplate) => void
  onDelete: (template: FiringTemplate) => void
}) {
  const edit = useStableCallback(() => {
    onEdit(template)
  })
  const remove = useStableCallback(() => {
    onDelete(template)
  })
  return (
    <tr className="border-b border-zinc-200 last:border-0 dark:border-zinc-800">
      <td className="px-4 py-3 break-words">{template.name}</td>
      <td className="px-4 py-3 whitespace-nowrap">
        {formatCurrency(template.price)}
      </td>
      <td className="px-4 py-3">
        <div className="flex justify-end gap-2">
          <IconButton
            ariaLabel={`Editar plantilla ${template.name}`}
            title="Editar plantilla"
            onClick={edit}
          >
            <PencilIcon className="h-3.5 w-3.5" />
          </IconButton>
          <IconButton
            variant="danger"
            ariaLabel={`Eliminar plantilla ${template.name}`}
            title="Eliminar plantilla"
            onClick={remove}
          >
            <TrashIcon className="h-3.5 w-3.5" />
          </IconButton>
        </div>
      </td>
    </tr>
  )
}
