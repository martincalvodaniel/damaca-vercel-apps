// biome-ignore-all lint/performance/noJsxPropsBind: Row handlers capture the selected local game action.

"use client"

import { useEffect, useState } from "react"
import { formatLocalDate } from "@/features/game/lib/date"
import { deleteGame, listGames } from "@/lib/storage/games"
import type { CardWarsGame } from "@/schemas/game"

export function HistoryScreen() {
  const [games, setGames] = useState<CardWarsGame[]>([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)

  useEffect(() => {
    void listGames()
      .then(setGames)
      .catch((cause: unknown) => {
        setError(
          cause instanceof Error
            ? cause.message
            : "No se pudo cargar el historial."
        )
      })
      .finally(() => setLoading(false))
  }, [])

  async function remove(game: CardWarsGame) {
    const players = game.players.map((player) => player.name).join(" y ")
    if (
      !window.confirm(
        `¿Eliminar definitivamente la partida de ${players}? Esta acción no se puede deshacer.`
      )
    )
      return
    setBusyId(game.id)
    setError("")
    try {
      await deleteGame(game.id, game.revision)
      setGames((current) => current.filter((item) => item.id !== game.id))
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "No se pudo eliminar la partida."
      )
      if (cause instanceof Error && cause.name === "GameConflictError") {
        try {
          setGames(await listGames())
        } catch {
          setError("La partida cambió y no se pudo actualizar el historial.")
        }
      }
    } finally {
      setBusyId(null)
    }
  }

  const history = games.filter((game) => game.status !== "active")
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-2 px-2 pb-2 pt-2 sm:px-4">
      <header>
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#4c7450] dark:text-[#bbdf84]">
          Crónicas
        </p>
        <h1 className="text-2xl font-black">Historial</h1>
      </header>
      {error ? (
        <p
          role="alert"
          className="rounded-lg bg-red-100 px-2 py-2 text-sm text-red-900"
        >
          {error}
        </p>
      ) : null}
      {loading ? (
        <p role="status" className="py-3 text-sm">
          Cargando historial…
        </p>
      ) : history.length ? (
        <ol className="flex flex-col gap-2">
          {history.map((game) => {
            const winner = game.players.find(
              (player) => player.id === game.winnerId
            )
            return (
              <li
                key={game.id}
                className="rounded-lg border border-[#9fb493] bg-white/70 px-2 py-2 text-[#21352d]"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                  <h2 className="text-sm font-black">
                    {game.players[0].name}{" "}
                    <span className="font-normal">vs</span>{" "}
                    {game.players[1].name}
                  </h2>
                  <span
                    className={`text-xs font-bold ${game.status === "finished" ? "text-[#315d3e]" : "text-[#806317]"}`}
                  >
                    {game.status === "finished"
                      ? `Ganó ${winner?.name ?? "—"}`
                      : "Abandonada"}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[#4e6450]">
                  Inicio · {formatLocalDate(game.startedAt)}
                  {game.endedAt
                    ? ` · Fin ${formatLocalDate(game.endedAt)}`
                    : ""}
                </p>
                <p className="text-xs">
                  Vidas finales · {game.lives[0]} — {game.lives[1]}
                </p>
                <details className="mt-1">
                  <summary className="min-h-10 cursor-pointer content-center text-xs font-semibold">
                    Movimientos · {game.events.length}
                  </summary>
                  {game.events.length ? (
                    <ol className="max-h-48 divide-y divide-[#dce5d4] overflow-y-auto">
                      {[...game.events].reverse().map((event) => (
                        <li
                          key={event.id}
                          className="flex justify-between gap-2 py-1 text-xs"
                        >
                          <span>
                            {event.type === "undo" ? "Deshacer" : "Cambio"} ·{" "}
                            {
                              game.players.find(
                                (player) => player.id === event.playerId
                              )?.name
                            }{" "}
                            · {event.before} → {event.after}
                          </span>
                          <time dateTime={event.createdAt}>
                            {formatLocalDate(event.createdAt)}
                          </time>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="pb-2 text-xs">Sin cambios de vidas.</p>
                  )}
                </details>
                <div className="mt-1 flex justify-end">
                  <button
                    type="button"
                    disabled={busyId !== null}
                    onClick={() => void remove(game)}
                    aria-label={`Eliminar partida de ${game.players[0].name} y ${game.players[1].name}`}
                    className="min-h-10 px-2 text-xs font-semibold text-red-800 underline disabled:opacity-40"
                  >
                    Eliminar partida
                  </button>
                </div>
              </li>
            )
          })}
        </ol>
      ) : (
        <p className="rounded-lg border border-dashed border-[#9fb493] px-3 py-6 text-center text-sm">
          Las partidas finalizadas y abandonadas aparecerán aquí.
        </p>
      )}
    </main>
  )
}
