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
import {
  childrenOf,
  type DropTarget,
  moveItem,
  removalGroup,
  removalSnapshot,
  type ShoppingItem,
} from "./list"
import styles from "./shopping-list.module.css"

export function ShoppingList({
  items,
  canEdit,
}: {
  items: ShoppingItem[]
  canEdit: boolean
}) {
  const [pending, startTransition] = useTransition()
  const [drag, setDrag] = useState<{
    id: string
    x: number
    y: number
    target?: DropTarget
  }>()
  const listId = useId()
  const ordered = items
    .filter(({ parentId }) => !parentId)
    .flatMap((item) => [item, ...childrenOf(items, item.id)])

  const submit = useCallback(async (form: FormData) => {
    try {
      const message = await changeShoppingList(form)
      if (message) notifyAction(message)
    } catch {
      notifyAction("No se pudo guardar la lista.")
    }
  }, [])

  const reorder = useCallback(
    (id: string, target?: DropTarget) => {
      if (!target || pending || !moveItem(items, id, target)) return
      const form = new FormData()
      form.set("intent", "move")
      form.set("id", id)
      form.set("target", target.id)
      form.set("placement", target.placement)
      startTransition(() => submit(form))
    },
    [items, pending, submit]
  )

  const startDrag = useCallback((event: PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return
    event.currentTarget.setPointerCapture(event.pointerId)
    setDrag({
      id: event.currentTarget.value,
      x: event.clientX,
      y: event.clientY,
    })
  }, [])

  const findTarget = useCallback(
    (event: PointerEvent<HTMLButtonElement>): DropTarget | undefined => {
      const row = document
        .elementFromPoint(event.clientX, event.clientY)
        ?.closest<HTMLElement>("[data-shopping-item]")
      const id = row?.dataset.shoppingItem
      if (!row || !id || row.closest("[data-shopping-list]")?.id !== listId)
        return
      const rect = row.getBoundingClientRect()
      const position = (event.clientY - rect.top) / rect.height
      const relative = position < 0.5 ? "before" : "after"
      const source = event.currentTarget.value
      if (
        position >= 0.25 &&
        position <= 0.75 &&
        moveItem(items, source, { id, placement: "inside" })
      )
        return { id, placement: "inside" }
      const target: DropTarget = { id, placement: relative }
      if (moveItem(items, source, target)) return target
    },
    [items, listId]
  )

  const previewDrag = useCallback(
    (event: PointerEvent<HTMLButtonElement>) => {
      if (!event.currentTarget.hasPointerCapture(event.pointerId)) return
      setDrag({
        id: event.currentTarget.value,
        x: event.clientX,
        y: event.clientY,
        target: findTarget(event),
      })
    },
    [findTarget]
  )

  const endDrag = useCallback(
    (event: PointerEvent<HTMLButtonElement>) => {
      if (!event.currentTarget.hasPointerCapture(event.pointerId)) return
      const target = findTarget(event)
      setDrag(undefined)
      reorder(event.currentTarget.value, target)
    },
    [findTarget, reorder]
  )

  const cancelDrag = useCallback(() => setDrag(undefined), [])

  const handleArrow = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>) => {
      const { key } = event
      if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(key))
        return
      event.preventDefault()
      const item = items.find(({ id }) => id === event.currentTarget.value)
      if (!item) return
      const siblings = items.filter(
        ({ parentId }) => parentId === item.parentId
      )
      const index = siblings.indexOf(item)
      if (key === "ArrowLeft" && item.parentId)
        reorder(item.id, { id: item.parentId, placement: "after" })
      if (key === "ArrowRight" && !item.parentId && siblings[index - 1])
        reorder(item.id, { id: siblings[index - 1].id, placement: "inside" })
      if (key === "ArrowUp" && siblings[index - 1])
        reorder(item.id, { id: siblings[index - 1].id, placement: "before" })
      if (key === "ArrowDown" && siblings[index + 1])
        reorder(item.id, { id: siblings[index + 1].id, placement: "after" })
    },
    [items, reorder]
  )

  const dragged = drag && items.find(({ id }) => id === drag.id)
  const markerId =
    drag?.target?.placement === "after"
      ? (childrenOf(items, drag.target.id).at(-1)?.id ?? drag.target.id)
      : drag?.target?.id

  return (
    <details name="letux-sections" className={eventStyles.attendees}>
      <summary>Lista de la compra</summary>
      <section className={eventStyles.card} aria-label="Lista de la compra">
        {items.length ? (
          <ul id={listId} data-shopping-list="">
            {ordered.map((item) => (
              <li
                key={item.id}
                className={styles.item}
                data-shopping-item={item.id}
                data-child={Boolean(item.parentId)}
                data-dragging={drag?.id === item.id}
                data-drop={
                  markerId === item.id ? drag?.target?.placement : undefined
                }
              >
                {canEdit ? (
                  <>
                    <button
                      type="button"
                      value={item.id}
                      className={styles.handle}
                      aria-label={`Mover ${item.name} con arrastre o flechas; derecha para anidar, izquierda para sacar`}
                      disabled={pending}
                      onPointerDown={startDrag}
                      onPointerMove={previewDrag}
                      onPointerUp={endDrag}
                      onLostPointerCapture={cancelDrag}
                      onPointerCancel={cancelDrag}
                      onKeyDown={handleArrow}
                    >
                      ⠿
                    </button>
                    <ShoppingRow
                      item={item}
                      group={removalGroup(items, item)}
                      submit={submit}
                    />
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
        {dragged && drag ? (
          <div
            className={styles.ghost}
            aria-hidden="true"
            style={{
              left: `clamp(0.5rem, ${drag.x + 12}px, calc(100vw - min(16rem, 65vw) - 0.5rem))`,
              top: drag.y < 100 ? drag.y + 12 : drag.y - 12,
              transform: drag.y < 100 ? "none" : undefined,
            }}
          >
            {dragged.name}
            {childrenOf(items, dragged.id).length
              ? ` +${childrenOf(items, dragged.id).length}`
              : null}
          </div>
        ) : null}
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
  group,
  submit,
}: {
  item: ShoppingItem
  group: ShoppingItem[]
  submit: (form: FormData) => Promise<void>
}) {
  const confirmation = useConfirmation()
  const [confirmedGroup, setConfirmedGroup] = useState(group)
  const previewRemoval = useCallback(() => setConfirmedGroup(group), [group])
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
        <input
          type="hidden"
          name="snapshot"
          value={removalSnapshot(confirmedGroup)}
        />
        <button
          type="submit"
          aria-label={`Borrar ${item.name}`}
          onClick={previewRemoval}
        >
          ×
        </button>
      </form>
      <Confirmation controls={confirmation} title="Borrar producto">
        {confirmedGroup.length === 1 ? (
          <>Se eliminará: «{confirmedGroup[0].name}».</>
        ) : (
          <div className={styles.removalList}>
            Se eliminarán:
            <ul>
              <li>
                {confirmedGroup[0].name}
                <ul>
                  {confirmedGroup.slice(1).map(({ id, name }) => (
                    <li key={id}>{name}</li>
                  ))}
                </ul>
              </li>
            </ul>
          </div>
        )}
      </Confirmation>
    </>
  )
}
