"use client"

import {
  type FormEvent,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react"
import { MemberAvatar } from "./member-avatar"

export type PersonOption = {
  id: string
  alias: string
  image?: string | null
  value?: string
  detail?: string
}

export function PersonSelect({
  name,
  label,
  options,
  placeholder,
  defaultValue = "",
  required = false,
  extra,
}: {
  name: string
  label: string
  options: PersonOption[]
  placeholder: string
  defaultValue?: string
  required?: boolean
  extra?: { value: string; label: string }
}) {
  const id = useId()
  const select = useRef<HTMLSelectElement>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const [value, setValue] = useState(defaultValue)
  const selected = options.find(
    (option) => (option.value ?? option.id) === value
  )

  useEffect(() => {
    const form = select.current?.form
    const reset = () => setValue(defaultValue)
    form?.addEventListener("reset", reset)
    return () => form?.removeEventListener("reset", reset)
  }, [defaultValue])

  const open = useCallback(() => {
    if (!dialog.current?.open) dialog.current?.showModal()
  }, [])
  const invalid = useCallback(
    (event: FormEvent<HTMLSelectElement>) => {
      event.preventDefault()
      open()
    },
    [open]
  )
  const close = useCallback(() => dialog.current?.close(), [])
  const choose = useCallback(
    (event: FormEvent<HTMLButtonElement>) => {
      setValue(event.currentTarget.value)
      close()
    },
    [close]
  )
  const change = useCallback((event: FormEvent<HTMLSelectElement>) => {
    setValue(event.currentTarget.value)
  }, [])

  return (
    <div className="person-select">
      <span id={`${id}-label`}>{label}</span>
      <button
        type="button"
        className="person-select-trigger"
        aria-haspopup="dialog"
        aria-labelledby={`${id}-label ${id}-value`}
        onClick={open}
      >
        <span id={`${id}-value`}>
          {selected ? (
            <>
              <MemberAvatar
                compact
                alias={selected.alias}
                image={selected.image ?? null}
              />
              {selected.alias}
              {selected.detail ? ` · ${selected.detail}` : ""}
            </>
          ) : value === extra?.value ? (
            extra.label
          ) : (
            placeholder
          )}
        </span>
        <span aria-hidden="true">▾</span>
      </button>
      <select
        ref={select}
        className="person-select-value"
        name={name}
        required={required}
        value={value}
        onInvalid={invalid}
        tabIndex={-1}
        aria-label={label}
        aria-hidden="true"
        onChange={change}
      >
        <option value="">{placeholder}</option>
        {extra ? <option value={extra.value}>{extra.label}</option> : null}
        {options.map((option) => (
          <option key={option.id} value={option.value ?? option.id}>
            {option.alias}
          </option>
        ))}
      </select>
      <dialog
        ref={dialog}
        className="action-confirmation person-select-dialog"
        aria-labelledby={`${id}-title`}
      >
        <header>
          <h2 id={`${id}-title`}>{label}</h2>
          <button
            type="button"
            className="action-cancel"
            aria-label="Cancelar"
            onClick={close}
          >
            ×
          </button>
        </header>
        <div className="person-select-options">
          {!required ? (
            <button
              type="button"
              value=""
              aria-pressed={value === ""}
              onClick={choose}
            >
              {placeholder}
            </button>
          ) : null}
          {extra ? (
            <button
              type="button"
              value={extra.value}
              aria-pressed={value === extra.value}
              onClick={choose}
            >
              {extra.label}
            </button>
          ) : null}
          {options.map((option) => {
            const optionValue = option.value ?? option.id
            return (
              <button
                type="button"
                key={option.id}
                value={optionValue}
                aria-pressed={value === optionValue}
                onClick={choose}
              >
                <MemberAvatar
                  compact
                  alias={option.alias}
                  image={option.image ?? null}
                />
                {option.alias}
                {option.detail ? ` · ${option.detail}` : ""}
              </button>
            )
          })}
        </div>
      </dialog>
    </div>
  )
}
