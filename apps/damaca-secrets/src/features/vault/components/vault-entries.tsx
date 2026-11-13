"use client"

import {
  type ChangeEvent,
  type MouseEvent,
  useCallback,
  useDeferredValue,
  useState,
} from "react"
import { IconButton } from "@/components/ui/icon-button"
import { EntryDetail } from "@/features/vault/components/entry-detail"
import { EntryForm } from "@/features/vault/components/entry-form"
import { inputClass } from "@/features/vault/components/styles"
import type { VaultEntry } from "@/schemas/vault"

interface VaultEntriesProps {
  busy: boolean
  entries: VaultEntry[]
  onUpdate?: (entries: VaultEntry[]) => Promise<boolean>
}

export function VaultEntries({ busy, entries, onUpdate }: VaultEntriesProps) {
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<string>()
  const [editing, setEditing] = useState(false)
  const deferred = useDeferredValue(query.trim().toLocaleLowerCase())
  const current = entries.find(({ id }) => id === selected)
  const filtered = entries
    .filter(({ title, username, url, notes }) =>
      [title, username, url, notes].some((field) =>
        field.toLocaleLowerCase().includes(deferred)
      )
    )
    .sort((first, second) => first.title.localeCompare(second.title))

  const search = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setQuery(event.target.value),
    []
  )
  const select = useCallback(
    (event: MouseEvent<HTMLButtonElement>) =>
      setSelected(event.currentTarget.value),
    []
  )
  const back = useCallback(() => setSelected(undefined), [])
  const cancel = useCallback(() => setEditing(false), [])
  const edit = useCallback(() => setEditing(true), [])
  const add = useCallback(() => {
    setSelected(undefined)
    setEditing(true)
  }, [])

  const save = useCallback(
    async (entry: VaultEntry) => {
      const next = current
        ? entries.map((item) => (item.id === current.id ? entry : item))
        : [...entries, entry]
      if (await onUpdate?.(next)) {
        setSelected(entry.id)
        setEditing(false)
      }
    },
    [current, entries, onUpdate]
  )

  const remove = useCallback(async () => {
    if (!current || !window.confirm("Delete this credential?")) return
    if (await onUpdate?.(entries.filter(({ id }) => id !== current.id))) back()
  }, [back, current, entries, onUpdate])

  if (editing && onUpdate) {
    return (
      <EntryForm
        key={current?.id ?? "new"}
        busy={busy}
        entry={current}
        onCancel={cancel}
        onSave={save}
      />
    )
  }
  if (current) {
    return (
      <EntryDetail
        key={current.id}
        busy={busy}
        entry={current}
        onBack={back}
        onEdit={onUpdate ? edit : undefined}
        onDelete={onUpdate ? remove : undefined}
      />
    )
  }

  return (
    <section aria-label="Saved credentials" className="grid gap-2">
      <div className="flex items-center gap-2">
        <input
          aria-label="Search credentials"
          type="search"
          className={inputClass}
          placeholder="Search credentials"
          value={query}
          onChange={search}
        />
        {onUpdate ? (
          <IconButton
            type="button"
            onClick={add}
            disabled={busy}
            icon="add"
            label="Add entry"
            tone="primary"
          />
        ) : null}
      </div>
      {filtered.length ? (
        <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
          {filtered.map(({ id, title, username, url }) => (
            <li key={id}>
              <button
                type="button"
                value={id}
                onClick={select}
                className="flex min-h-10 w-full items-center gap-3 rounded-lg px-2.5 py-1 text-left focus-visible:outline-2 focus-visible:-outline-offset-2"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">
                    {title}
                  </span>
                  {username || url ? (
                    <span className="block truncate text-xs text-zinc-600 dark:text-zinc-400">
                      {username || url}
                    </span>
                  ) : null}
                </span>
                <span aria-hidden="true" className="text-zinc-500">
                  ›
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-xl border border-dashed border-zinc-300 p-3 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
          {entries.length
            ? "No matching credentials."
            : "No saved credentials yet."}
        </p>
      )}
    </section>
  )
}
