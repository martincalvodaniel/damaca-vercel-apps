// biome-ignore-all lint/performance/noJsxPropsBind: These local handlers capture small UI actions and do not drive expensive render trees.

"use client"

import { useState } from "react"
import { formatLocalDate } from "@/features/game/lib/date"
import type { CardWarsGame } from "@/schemas/game"

export function GamePlay({
  game,
  busy,
  onLifeChange,
  onUndo,
  onFinish,
  onAbandon,
  onBack,
}: {
  game: CardWarsGame
  busy: boolean
  onLifeChange: (playerId: string, delta: number) => void
  onUndo: () => void
  onFinish: (winnerId: string) => void
  onAbandon: () => void
  onBack: () => void
}) {
  const [winnerId, setWinnerId] = useState(game.players[0].id)
  const winner = game.players.find((player) => player.id === game.winnerId)
  const starter = game.players.find(
    (player) => player.id === game.startingPlayerId
  )
  const active = game.status === "active"
  const undoneIds = new Set(
    game.events.flatMap((event) =>
      event.type === "undo" ? [event.targetId] : []
    )
  )
  const lastUndoable = [...game.events]
    .reverse()
    .find((event) => event.type === "change" && !undoneIds.has(event.id))

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-2 px-2 pb-2 pt-1 sm:px-4">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onBack}
          className="min-h-11 rounded-lg px-2 font-bold focus-visible:outline-2"
        >
          ← Partidas
        </button>
        <p className="text-right text-xs text-[#345e4b] dark:text-[#c6d7bb]">
          Inicio · {formatLocalDate(game.startedAt)}
        </p>
      </div>
      <section aria-label="Marcador" className="grid grid-cols-2 gap-2">
        {game.players.map((player, index) => (
          <article
            key={player.id}
            className={`rounded-xl border-2 border-[#213f36] p-2 text-center text-[#21352d] shadow-[2px_2px_0_#213f36] ${index === 0 ? "bg-[#dceec3]" : "bg-[#d5ebf4]"}`}
          >
            <h2
              className="min-h-6 truncate text-sm font-black"
              title={player.name}
            >
              {player.name}
            </h2>
            {player.id === game.startingPlayerId ? (
              <p className="text-[10px] font-bold uppercase tracking-wide">
                ★ Tío guay
              </p>
            ) : (
              <p className="text-[10px]">Entra después</p>
            )}
            <p
              aria-live="polite"
              className="my-1 text-5xl font-black tabular-nums leading-none"
            >
              {game.lives[index]}
            </p>
            {active ? (
              <div className="grid grid-cols-4 gap-1">
                {[-5, -1, 1, 5].map((delta) => (
                  <button
                    key={delta}
                    type="button"
                    disabled={busy || game.lives[index] + delta < 0}
                    onClick={() => onLifeChange(player.id, delta)}
                    aria-label={`${delta > 0 ? "Sumar" : "Restar"} ${Math.abs(delta)} vidas a ${player.name}`}
                    className="min-h-11 rounded-lg border border-[#557b65] bg-white text-sm font-black disabled:opacity-40 focus-visible:outline-2"
                  >
                    {delta > 0 ? "+" : "−"}
                    {Math.abs(delta)}
                  </button>
                ))}
              </div>
            ) : null}
          </article>
        ))}
      </section>
      {game.lives.some((lives) => lives > 25) ? (
        <p className="rounded-lg bg-[#fff0b6] px-2 py-1 text-xs">
          Supera las 25 vidas iniciales; revisad las reglas.
        </p>
      ) : null}
      {!active ? (
        <p className="rounded-lg bg-[#fff0b6] px-2 py-2 text-sm font-bold">
          {game.status === "abandoned"
            ? "Partida abandonada"
            : `Ganó ${winner?.name ?? "—"}`}
        </p>
      ) : null}
      <section className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white/70 px-2 py-1 text-[#21352d]">
        {active ? (
          <>
            <button
              type="button"
              disabled={busy || !lastUndoable}
              onClick={onUndo}
              className="min-h-11 rounded-lg px-2 text-sm font-bold underline disabled:opacity-40"
            >
              ↶ Deshacer
            </button>
            <label className="flex min-h-11 items-center gap-1 text-xs font-semibold">
              Finalizar
              <select
                value={winnerId}
                onChange={(event) => setWinnerId(event.target.value)}
                className="min-h-10 max-w-32 rounded border border-[#557b65] bg-white px-1 text-sm"
              >
                {game.players.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={busy}
                onClick={() => onFinish(winnerId)}
                className="min-h-11 rounded-lg bg-[#213f36] px-2 font-bold text-white"
              >
                Guardar
              </button>
            </label>
            <button
              type="button"
              disabled={busy}
              onClick={onAbandon}
              className="min-h-11 rounded-lg px-2 text-xs underline"
            >
              Abandonar
            </button>
          </>
        ) : (
          <span className="text-sm font-bold">
            {starter?.name} empezó la partida
          </span>
        )}
      </section>
      <details className="rounded-lg border border-[#94ae88] bg-white/60 px-2 py-1">
        <summary className="min-h-10 cursor-pointer content-center text-sm font-bold">
          Movimientos · {game.events.length}
        </summary>
        {game.events.length ? (
          <ol className="max-h-52 divide-y divide-[#dce5d4] overflow-y-auto">
            {[...game.events].reverse().map((event) => {
              const player = game.players.find(
                (item) => item.id === event.playerId
              )
              return (
                <li
                  key={event.id}
                  className="flex justify-between gap-2 py-1 text-xs"
                >
                  <span>
                    {event.type === "undo" ? "Deshacer" : "Cambio"} ·{" "}
                    {player?.name} · {event.before} → {event.after}
                  </span>
                  <time dateTime={event.createdAt}>
                    {formatLocalDate(event.createdAt)}
                  </time>
                </li>
              )
            })}
          </ol>
        ) : (
          <p className="pb-2 text-xs text-[#526b58]">
            Aún no hay cambios de vidas.
          </p>
        )}
      </details>
      {game.status === "finished" && game.endedAt ? (
        <p className="text-right text-xs text-[#526b58]">
          Fin · {formatLocalDate(game.endedAt)}
        </p>
      ) : null}
    </main>
  )
}
