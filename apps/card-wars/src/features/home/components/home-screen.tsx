// biome-ignore-all lint/performance/noJsxPropsBind: Handlers update the local game list and individual game view.

"use client"

import { useCallback, useEffect, useId, useMemo, useState } from "react"
import { GamePlay } from "@/features/game/components/game-play"
import { NewGameForm } from "@/features/game/components/new-game-form"
import { formatLocalDate } from "@/features/game/lib/date"
import {
  changeLives,
  finishGame,
  undoLastLifeChange,
} from "@/features/game/lib/game"
import {
  listGames,
  saveGame,
  createGame as storeGame,
} from "@/lib/storage/games"
import type { CardWarsGame } from "@/schemas/game"

function replaceGame(games: CardWarsGame[], next: CardWarsGame) {
  return [next, ...games.filter((game) => game.id !== next.id)].sort(
    (first, second) => second.startedAt.localeCompare(first.startedAt)
  )
}

export function HomeScreen() {
  const [games, setGames] = useState<CardWarsGame[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showNewGame, setShowNewGame] = useState(false)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const activeGamesTitleId = useId()
  const activeGames = useMemo(
    () => games.filter((game) => game.status === "active"),
    [games]
  )
  const selectedGame = games.find((game) => game.id === selectedId)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      setGames(await listGames())
      setError("")
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "No se pudieron cargar las partidas."
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  async function create(game: CardWarsGame) {
    const saved = await storeGame(game)
    setGames((current) => replaceGame(current, saved))
    setSelectedId(saved.id)
    setShowNewGame(false)
  }

  async function saveNext(current: CardWarsGame, next: CardWarsGame) {
    setBusy(true)
    setError("")
    try {
      const saved = await saveGame(next, current.revision)
      setGames((previous) => replaceGame(previous, saved))
      return saved
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "No se pudo guardar el cambio."
      )
      if (cause instanceof Error && cause.name === "GameConflictError")
        await refresh()
      return null
    } finally {
      setBusy(false)
    }
  }

  async function adjust(playerId: string, delta: number) {
    if (!selectedGame) return
    try {
      const next = changeLives(selectedGame, playerId, delta)
      const saved = await saveNext(selectedGame, next)
      if (!saved) return
      const index = saved.players.findIndex((player) => player.id === playerId)
      if (
        saved.lives[index] === 0 &&
        window.confirm(
          `${saved.players[index].name} se ha quedado sin vidas. ¿Confirmas como ganador a ${saved.players[1 - index].name}?`
        )
      ) {
        await saveNext(saved, finishGame(saved, saved.players[1 - index].id))
      }
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "No se pudo cambiar las vidas."
      )
    }
  }

  async function undo() {
    if (!selectedGame) return
    const next = undoLastLifeChange(selectedGame)
    if (next !== selectedGame) await saveNext(selectedGame, next)
  }

  async function finish(winnerId: string) {
    if (!selectedGame) return
    const winnerName = selectedGame.players.find(
      (player) => player.id === winnerId
    )?.name
    if (!window.confirm(`¿Guardar a ${winnerName} como ganador?`)) return
    await saveNext(selectedGame, finishGame(selectedGame, winnerId))
  }

  async function abandon() {
    if (
      !selectedGame ||
      !window.confirm(
        "¿Abandonar esta partida? Se conservará en el historial sin ganador."
      )
    )
      return
    await saveNext(selectedGame, finishGame(selectedGame, undefined))
  }

  if (selectedGame) {
    return (
      <>
        {error ? (
          <p
            role="alert"
            className="mx-auto mt-2 max-w-3xl px-2 text-sm font-semibold text-red-800"
          >
            {error}
          </p>
        ) : null}
        <GamePlay
          game={selectedGame}
          busy={busy}
          onLifeChange={(playerId, delta) => void adjust(playerId, delta)}
          onUndo={() => void undo()}
          onFinish={(winnerId) => void finish(winnerId)}
          onAbandon={() => void abandon()}
          onBack={() => setSelectedId(null)}
        />
      </>
    )
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-2 px-2 pb-2 pt-2 sm:px-4">
      <header className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#4c7450] dark:text-[#bbdf84]">
            Hora de jugar
          </p>
          <h1 className="text-2xl font-black leading-tight">
            Card Wars <span aria-hidden="true">⚔️</span>
          </h1>
        </div>
        <button
          type="button"
          onClick={() => {
            setSelectedId(null)
            setShowNewGame((show) => !show)
          }}
          className="min-h-11 rounded-lg border-2 border-[#213f36] bg-[#bbdf84] px-3 text-sm font-black shadow-[2px_2px_0_#213f36] focus-visible:outline-2"
        >
          {showNewGame ? "Cancelar" : "+ Nueva"}
        </button>
      </header>
      {error ? (
        <p
          role="alert"
          className="rounded-lg bg-red-100 px-2 py-2 text-sm font-semibold text-red-900"
        >
          {error}
        </p>
      ) : null}
      {showNewGame ? (
        <NewGameForm
          games={games}
          onCreate={create}
          onCancel={() => setShowNewGame(false)}
        />
      ) : null}
      <section
        aria-labelledby={activeGamesTitleId}
        className="flex flex-col gap-2"
      >
        <div className="flex items-baseline justify-between">
          <h2
            id={activeGamesTitleId}
            className="text-sm font-black uppercase tracking-wide"
          >
            En curso{" "}
            <span className="text-[#547355] dark:text-[#bbdf84]">
              {activeGames.length}
            </span>
          </h2>
          <button
            type="button"
            onClick={() => void refresh()}
            className="min-h-11 px-2 text-xs font-semibold underline"
          >
            Actualizar
          </button>
        </div>
        {loading ? (
          <p role="status" className="py-3 text-sm">
            Cargando partidas…
          </p>
        ) : activeGames.length ? (
          activeGames.map((game) => (
            <button
              key={game.id}
              type="button"
              onClick={() => setSelectedId(game.id)}
              className="grid min-h-16 grid-cols-[1fr_auto] items-center gap-x-2 rounded-lg border border-[#9fb493] bg-white/70 px-2 py-1 text-left text-[#21352d] focus-visible:outline-2"
            >
              <span className="truncate text-sm font-black">
                {game.players[0].name} <span className="font-normal">vs</span>{" "}
                {game.players[1].name}
              </span>
              <span className="row-span-2 rounded-md bg-[#dceec3] px-2 py-1 text-xs font-bold">
                ▶ Seguir
              </span>
              <span className="text-xs text-[#4e6450]">
                {game.lives[0]} · {game.lives[1]} vidas{" "}
                <span className="px-1">·</span>{" "}
                {formatLocalDate(game.startedAt)}
              </span>
            </button>
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-[#9fb493] px-3 py-5 text-center">
            <p className="text-sm font-semibold">
              {loading ? "" : "Aún no hay aventuras en curso."}
            </p>
            {!showNewGame ? (
              <button
                type="button"
                onClick={() => setShowNewGame(true)}
                className="mt-2 min-h-11 rounded-lg bg-[#213f36] px-4 text-sm font-bold text-white"
              >
                Crear primera partida
              </button>
            ) : null}
          </div>
        )}
      </section>
    </main>
  )
}
