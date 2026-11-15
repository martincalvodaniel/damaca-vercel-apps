"use client"

import {
  type KeyboardEvent,
  type PointerEvent,
  useCallback,
  useId,
  useState,
  useTransition,
} from "react"
import eventStyles from "@/app/eventos/26-12-30-nochevieja-letux/page.module.css"
import {
  notifyAction,
  useConfirmation,
} from "@/features/feedback/actions-client"
import { Confirmation } from "@/features/feedback/feedback"
import { changeShoppingList } from "./actions"
import type { ShoppingItem } from "./list"
import styles from "./shopping-list.module.css"

export function ShoppingList({
  items,
  canEdit,
}: {
  items: ShoppingItem[]
  canEdit: boolean
}) {
  const [pending, startTransition] = useTransition()
  const [dropTarget, setDropTarget] = useState<string>()
  const listId = useId()

  const submit = useCallback(async (form: FormData) => {
    try {
      const message = await changeShoppingList(form)
      if (message) notifyAction(message)
    } catch {
      notifyAction("No se pudo guardar la lista.")
    }
  }, [])

  const reorder = useCallback(
    (id: string, target?: string) => {
      if (!target || id === target || pending) return
      const form = new FormData()
      form.set("intent", "move")
      form.set("id", id)
      form.set("target", target)
      startTransition(() => submit(form))
    },
    [pending, submit]
  )

  const startDrag = useCallback((event: PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return
    event.currentTarget.setPointerCapture(event.pointerId)
    setDropTarget(event.currentTarget.value)
  }, [])

  const findTarget = useCallback(
    (event: PointerEvent<HTMLButtonElement>) => {
      const row = document
        .elementFromPoint(event.clientX, event.clientY)
        ?.closest<HTMLElement>("[data-shopping-item]")
      return row?.closest("[data-shopping-list]")?.id === listId
        ? row?.dataset.shoppingItem
        : undefined
    },
    [listId]
  )

  const previewDrag = useCallback(
    (event: PointerEvent<HTMLButtonElement>) => {
      if (event.currentTarget.hasPointerCapture(event.pointerId))
        setDropTarget(findTarget(event))
    },
    [findTarget]
  )

  const endDrag = useCallback(
    (event: PointerEvent<HTMLButtonElement>) => {
      if (!event.currentTarget.hasPointerCapture(event.pointerId)) return
      setDropTarget(undefined)
      reorder(event.currentTarget.value, findTarget(event))
    },
    [findTarget, reorder]
  )

  const cancelDrag = useCallback(() => setDropTarget(undefined), [])

  const handleArrow = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>) => {
      if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return
      event.preventDefault()
      const id = event.currentTarget.value
      const index = items.findIndex((item) => item.id === id)
      reorder(id, items[index + (event.key === "ArrowUp" ? -1 : 1)]?.id)
    },
    [items, reorder]
  )

  return (
    <details name="letux-sections" className={eventStyles.attendees}>
      <summary>Lista de la compra</summary>
      <section className={eventStyles.card} aria-label="Lista de la compra">
        {items.length ? (
          <ul id={listId} data-shopping-list="">
            {items.map((item) => (
              <li
                key={item.id}
                className={styles.item}
                data-shopping-item={item.id}
                data-drop={dropTarget === item.id}
              >
                {canEdit ? (
                  <>
                    <button
                      type="button"
                      value={item.id}
                      className={styles.handle}
                      aria-label={`Mover ${item.name} con arrastre o flechas arriba y abajo`}
                      disabled={pending}
                      onPointerDown={startDrag}
                      onPointerMove={previewDrag}
                      onPointerUp={endDrag}
                      onLostPointerCapture={cancelDrag}
                      onKeyDown={handleArrow}
                    >
                      ⠿
                    </button>
                    <ShoppingRow item={item} submit={submit} />
                  </>
                ) : (
                  <span className={item.checked ? styles.checked : undefined}>
                    {item.checked ? "✓ " : ""}
                    {item.name}
                  </span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p>La lista está vacía.</p>
        )}
        {canEdit ? (
          <form
            action={submit}
            className={`${eventStyles.picker} ${styles.add}`}
          >
            <input type="hidden" name="intent" value="add" />
            <input
              name="name"
              aria-label="Nuevo producto"
              placeholder="Añadir producto"
              required
              maxLength={100}
            />
            <button type="submit">Añadir</button>
          </form>
        ) : null}
      </section>
    </details>
  )
}

function ShoppingRow({
  item,
  submit,
}: {
  item: ShoppingItem
  submit: (form: FormData) => Promise<void>
}) {
  const confirmation = useConfirmation()
  const [editing, setEditing] = useState(false)
  const [pending, startTransition] = useTransition()
  const toggleEdit = useCallback(() => setEditing((current) => !current), [])
  const toggleCheck = useCallback(() => {
    const form = new FormData()
    form.set("intent", "check")
    form.set("id", item.id)
    form.set("checked", String(!item.checked))
    startTransition(() => submit(form))
  }, [item.id, item.checked, submit])
  const rename = useCallback(
    async (form: FormData) => {
      await submit(form)
      setEditing(false)
    },
    [submit]
  )

  return (
    <>
      <input
        type="checkbox"
        checked={item.checked}
        disabled={pending}
        onChange={toggleCheck}
        aria-label={`Marcar ${item.name}`}
      />
      {editing ? (
        <form action={rename} className={styles.rename}>
          <input type="hidden" name="intent" value="rename" />
          <input type="hidden" name="id" value={item.id} />
          <input
            name="name"
            defaultValue={item.name}
            aria-label="Nombre del producto"
            required
            maxLength={100}
          />
          <button type="submit" aria-label="Guardar nombre">
            ✓
          </button>
          <button
            type="button"
            aria-label="Cancelar edición"
            onClick={toggleEdit}
          >
            ×
          </button>
        </form>
      ) : (
        <button
          type="button"
          className={styles.name}
          onClick={toggleEdit}
          aria-label={`Editar ${item.name}`}
        >
          <span className={item.checked ? styles.checked : undefined}>
            {item.name}
          </span>
        </button>
      )}
      <form
        className={styles.remove}
        action={submit}
        onSubmit={confirmation.request}
      >
        <input type="hidden" name="intent" value="remove" />
        <input type="hidden" name="id" value={item.id} />
        <input type="hidden" name="confirm" value="yes" />
        <button type="submit" aria-label={`Borrar ${item.name}`}>
          ×
        </button>
      </form>
      <Confirmation controls={confirmation} title="Borrar producto">
        ¿Quitar «{item.name}» de la lista de la compra?
      </Confirmation>
    </>
  )
}
