// biome-ignore-all lint/performance/noJsxPropsBind: Form handlers update only this compact form's local state.

"use client"

import { useMemo, useState } from "react"
import {
  createGame,
  getGameDefaults,
  suggestStarterForNames,
} from "@/features/game/lib/game"
import type { CardWarsGame } from "@/schemas/game"

export function NewGameForm({
  games,
  onCreate,
  onCancel,
}: {
  games: CardWarsGame[]
  onCreate: (game: CardWarsGame) => Promise<void>
  onCancel: () => void
}) {
  const defaults = useMemo(() => getGameDefaults(games), [games])
  const [names, setNames] = useState<[string, string]>(defaults.names)
  const [starterName, setStarterName] = useState<string | null>(
    defaults.suggestedStarter
  )
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const suggestion = suggestStarterForNames(games, names)
  const namesMatchDefaults = names.every(
    (name, index) =>
      name.trim().toLocaleLowerCase("es") ===
      defaults.names[index].trim().toLocaleLowerCase("es")
  )

  function updateName(index: 0 | 1, value: string) {
    const next: [string, string] = [...names]
    next[index] = value
    setNames(next)
    setStarterName(
      namesMatchDefaults &&
        suggestion &&
        next[index].trim().toLocaleLowerCase("es") ===
          defaults.names[index].trim().toLocaleLowerCase("es")
        ? suggestion
        : suggestStarterForNames(games, next)
    )
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    const normalized = names.map((name) => name.trim().toLocaleLowerCase("es"))
    if (!names[0].trim() || !names[1].trim()) {
      setError("Escribe el nombre de los dos jugadores.")
      return
    }
    if (normalized[0] === normalized[1]) {
      setError("Los dos jugadores necesitan nombres distintos.")
      return
    }
    if (
      !starterName ||
      !names.some(
        (name) =>
          name.trim().toLocaleLowerCase("es") ===
          starterName.trim().toLocaleLowerCase("es")
      )
    ) {
      setError("Elige quién empieza la partida.")
      return
    }
    setSaving(true)
    try {
      const starterIndex = names.findIndex(
        (name) =>
          name.trim().toLocaleLowerCase("es") ===
          starterName.trim().toLocaleLowerCase("es")
      ) as 0 | 1
      await onCreate(createGame(names, starterIndex))
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "No se pudo crear la partida."
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-xl border-2 border-[#213f36] bg-[#fff6d8] p-3 text-[#21352d] shadow-[3px_3px_0_#213f36]"
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className="text-lg font-black">Nueva aventura</h2>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Cancelar"
          className="min-h-11 min-w-11 rounded-lg text-xl font-bold focus-visible:outline-2"
        >
          ×
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {([0, 1] as const).map((index) => {
          const name = names[index]
          return (
            <label
              key={index === 0 ? "first-player-name" : "second-player-name"}
              className="min-w-0 text-xs font-bold"
            >
              Jugador {index + 1}
              <input
                maxLength={32}
                required
                value={name}
                onChange={(event) =>
                  updateName(index as 0 | 1, event.target.value)
                }
                placeholder={`Nombre ${index + 1}`}
                className="mt-1 min-h-11 w-full rounded-lg border-2 border-[#557b65] bg-white px-2 text-base font-medium outline-offset-2"
              />
            </label>
          )
        })}
      </div>
      {suggestion ? (
        <p className="mt-2 text-sm">
          Ganó la última partida: <strong>{suggestion}</strong>. Lo hemos
          elegido para empezar.
        </p>
      ) : null}
      <fieldset className="mt-2">
        <legend className="text-sm font-bold">
          ¿Quién es el tío guay y empieza?
        </legend>
        <div className="mt-1 grid grid-cols-2 gap-2">
          {([0, 1] as const).map((index) => {
            const name = names[index]
            return (
              <button
                key={
                  index === 0 ? "first-player-starter" : "second-player-starter"
                }
                type="button"
                disabled={!name.trim()}
                aria-pressed={Boolean(
                  starterName &&
                    name.trim().toLocaleLowerCase("es") ===
                      starterName.trim().toLocaleLowerCase("es")
                )}
                onClick={() => setStarterName(name.trim())}
                className="min-h-11 rounded-lg border-2 border-[#557b65] bg-white px-2 text-sm font-bold aria-pressed:border-[#213f36] aria-pressed:bg-[#bbdf84] disabled:opacity-50"
              >
                {name.trim() || `Jugador ${index + 1}`}{" "}
                {starterName &&
                name.trim().toLocaleLowerCase("es") ===
                  starterName.trim().toLocaleLowerCase("es")
                  ? "★"
                  : ""}
              </button>
            )
          })}
        </div>
      </fieldset>
      {error ? (
        <p role="alert" className="mt-2 text-sm font-semibold text-red-800">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={saving}
        className="mt-3 min-h-11 w-full rounded-lg border-2 border-[#213f36] bg-[#213f36] px-3 py-2 font-bold text-white disabled:opacity-60"
      >
        {saving ? "Guardando…" : "Empezar partida · 25 vidas"}
      </button>
    </form>
  )
}
