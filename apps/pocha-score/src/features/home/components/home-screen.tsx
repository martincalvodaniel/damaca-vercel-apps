// biome-ignore-all lint/performance/noJsxPropsBind: These handlers update this screen directly and are not passed to memoized children.
"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  biddingOrder,
  createRound,
  createSchedule,
  defaultMaximumByPlayers,
  gameTotals,
  isGameComplete,
  leaders,
  roundScores,
  validateBids,
  validateTricks,
} from "@/features/game/lib/rules"
import { NumberStepper } from "@/features/home/components/number-stepper"
import {
  createGame,
  deleteGame,
  exportGames,
  GameConflictError,
  importGames,
  listGames,
  parseGameBackup,
  readGame,
  saveGame,
} from "@/lib/storage/games"
import type { PochaGame, PochaRound } from "@/schemas/game"

type Screen = "home" | "create" | "history"
const panel =
  "rounded-xl border border-zinc-200 bg-white p-1.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-1.5"
const primary =
  "inline-flex min-h-10 items-center justify-center rounded-lg bg-emerald-700 px-1.5 py-1 font-semibold text-white hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-emerald-600 disabled:opacity-50"
const secondary =
  "inline-flex min-h-10 items-center justify-center rounded-lg border border-zinc-300 px-1.5 py-1.5 font-semibold hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-3 dark:border-zinc-700 dark:hover:bg-zinc-800"
const dateLabel = (date: string) =>
  new Intl.DateTimeFormat("es-ES", { dateStyle: "medium" }).format(
    new Date(date)
  )

export function HomeScreen() {
  const [screen, setScreen] = useState<Screen>("home")
  const [games, setGames] = useState<PochaGame[]>([])
  const [game, setGame] = useState<PochaGame | null>(null)
  const gameRef = useRef<PochaGame | null>(null)
  const revisionsRef = useRef<Record<string, number>>({})
  const queueRef = useRef(Promise.resolve())
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [draft, setDraft] = useState<PochaRound | null>(null)
  const [names, setNames] = useState([
    "Jugador 1",
    "Jugador 2",
    "Jugador 3",
    "Jugador 4",
  ])
  const [playerKeys, setPlayerKeys] = useState(() =>
    Array.from({ length: 4 }, () => crypto.randomUUID())
  )
  const [dealerIndex, setDealerIndex] = useState(0)
  const [maximum, setMaximum] = useState(10)
  const [openingRepeats, setOpeningRepeats] = useState(4)
  const [maximumRepeats, setMaximumRepeats] = useState(4)
  const [closingRepeats, setClosingRepeats] = useState(4)
  const [preview, setPreview] = useState<number[] | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      setGames(await listGames())
    } catch {
      setError(
        "No se pudieron leer las partidas. Comprueba el almacenamiento del navegador e inténtalo de nuevo."
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  useEffect(() => {
    function returnToHome() {
      setGame(null)
      gameRef.current = null
      setScreen("home")
      setError("")
    }
    window.addEventListener("pocha:home", returnToHome)
    return () => window.removeEventListener("pocha:home", returnToHome)
  }, [])

  const openGame = useCallback(async (id: string) => {
    try {
      const result = await readGame(id)
      if (!result) throw new Error("Missing game")
      gameRef.current = result
      revisionsRef.current[result.id] = result.revision
      setGame(result)
      setScreen("home")
      setMessage("")
      setError("")
    } catch {
      setError("No se pudo abrir la partida.")
    }
  }, [])

  const persist = useCallback(
    (candidate: PochaGame, successMessage = "Guardado") => {
      gameRef.current = candidate
      setGame(candidate)
      setMessage("Guardando…")
      setError("")
      queueRef.current = queueRef.current
        .then(async () => {
          const expectedRevision =
            revisionsRef.current[candidate.id] ?? candidate.revision
          const saved = await saveGame(candidate, expectedRevision)
          revisionsRef.current[saved.id] = saved.revision
          if (gameRef.current?.id === saved.id) {
            const current = {
              ...gameRef.current,
              revision: saved.revision,
              updatedAt: saved.updatedAt,
            }
            gameRef.current = current
            setGame(current)
          }
          setGames((items) =>
            items.map((item) => (item.id === saved.id ? saved : item))
          )
          setMessage(successMessage)
        })
        .catch((reason: unknown) => {
          setMessage("")
          setError(
            reason instanceof GameConflictError
              ? "La partida cambió en otra pestaña. Recárgala para conservar los datos más recientes."
              : "No se pudo guardar. Comprueba el espacio disponible e inténtalo de nuevo."
          )
        })
      return queueRef.current
    },
    []
  )

  const currentRoundIndex =
    game?.rounds.findIndex((round) => round.status !== "complete") ?? -1
  const currentRound =
    game && currentRoundIndex >= 0 ? game.rounds[currentRoundIndex] : null
  const bidTotalBeforeDealer =
    currentRound?.bids.reduce<number>(
      (sum, bid, index) =>
        sum + (index === currentRound.dealerIndex ? 0 : (bid ?? 0)),
      0
    ) ?? 0
  const dealerForbiddenBid = currentRound
    ? currentRound.cards - bidTotalBeforeDealer
    : null
  const totals = game ? gameTotals(game) : []
  const leadersList = game ? leaders(game) : []
  const activeGames = games.filter((item) => item.status === "active")
  const finishedGames = games.filter((item) => item.status === "finished")

  function updateRound(
    index: number,
    change: (round: PochaRound) => PochaRound
  ) {
    const current = gameRef.current
    if (!current) return
    const next = {
      ...current,
      rounds: current.rounds.map((round, itemIndex) =>
        itemIndex === index ? change(round) : round
      ),
    }
    persist(next)
  }

  async function submitConfiguration(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalized = names.map((name) => name.trim())
    if (normalized.some((name) => !name))
      return setError("Escribe el nombre de cada jugador.")
    if (
      new Set(normalized.map((name) => name.toLocaleLowerCase("es"))).size !==
      normalized.length
    )
      return setError("Cada jugador necesita un nombre distinto.")
    let schedule: number[]
    try {
      schedule = createSchedule(
        normalized.length,
        maximum,
        openingRepeats,
        maximumRepeats,
        closingRepeats
      )
    } catch {
      return setError("Revisa el máximo de cartas y las repeticiones.")
    }
    setBusy(true)
    const now = new Date().toISOString()
    const created: PochaGame = {
      id: crypto.randomUUID(),
      revision: 0,
      createdAt: now,
      updatedAt: now,
      players: normalized.map((name) => ({ id: crypto.randomUUID(), name })),
      schedule,
      rounds: [createRound(schedule[0], dealerIndex, normalized.length)],
      status: "active",
      tieResolution: null,
    }
    try {
      await createGame(created)
      setGames((items) => [created, ...items])
      gameRef.current = created
      revisionsRef.current[created.id] = 0
      setGame(created)
      setScreen("home")
      setPreview(null)
      setMessage("Partida creada")
    } catch {
      setError(
        "No se pudo crear la partida. Comprueba el almacenamiento del navegador."
      )
    } finally {
      setBusy(false)
    }
  }

  async function advanceRound() {
    if (!game || !currentRound) return
    const issue =
      currentRound.status === "bidding"
        ? validateBids(currentRound, game.players.length)
        : validateTricks(currentRound, game.players.length)
    if (issue) {
      setError(
        issue.includes("bids") || issue.includes("bid")
          ? "Completa las pedidas. No pueden sumar las bazas disponibles."
          : `Las bazas conseguidas deben sumar ${currentRound.cards}.`
      )
      return
    }
    setError("")
    if (currentRound.status === "bidding") {
      updateRound(currentRoundIndex, (round) => ({
        ...round,
        status: "playing",
      }))
      return
    }
    const next: PochaGame = {
      ...game,
      rounds: game.rounds.map((round, index) =>
        index === currentRoundIndex ? { ...round, status: "complete" } : round
      ),
    }
    if (next.rounds.length < next.schedule.length) {
      const nextDealer = (currentRound.dealerIndex + 1) % game.players.length
      next.rounds = [
        ...next.rounds,
        createRound(
          next.schedule[next.rounds.length],
          nextDealer,
          game.players.length
        ),
      ]
    } else if (leaders(next).length === 1) next.status = "finished"
    await persist(
      next,
      next.status === "finished" ? "Partida terminada" : "Ronda guardada"
    )
  }

  async function resolveTie(choice: "shared" | "extra") {
    if (!game) return
    if (choice === "shared") {
      await persist(
        { ...game, status: "finished", tieResolution: "shared" },
        "Partida terminada con victoria compartida"
      )
      return
    }
    const dealer =
      ((game.rounds.at(-1)?.dealerIndex ?? dealerIndex) + 1) %
      game.players.length
    await persist(
      {
        ...game,
        schedule: [...game.schedule, 1],
        rounds: [...game.rounds, createRound(1, dealer, game.players.length)],
        status: "active",
        tieResolution: "extra",
      },
      "Ronda de desempate añadida"
    )
  }

  function changeEntry(
    playerIndex: number,
    field: "bids" | "tricks",
    raw: string
  ) {
    if (!currentRound) return
    const value = raw === "" ? null : Number(raw)
    if (
      value !== null &&
      (!Number.isInteger(value) || value < 0 || value > currentRound.cards)
    )
      return
    updateRound(currentRoundIndex, (round) => {
      const values = [...round[field]]
      values[playerIndex] = value
      return { ...round, [field]: values }
    })
  }

  async function saveCorrection() {
    if (!game || editingIndex === null || !draft) return
    const issue =
      validateBids(draft, game.players.length) ??
      validateTricks(draft, game.players.length)
    if (issue)
      return setError(
        "Revisa las pedidas y las conseguidas; estas últimas deben sumar " +
          draft.cards +
          "."
      )
    const next: PochaGame = {
      ...game,
      rounds: game.rounds.map((round, index) =>
        index === editingIndex ? { ...draft, status: "complete" } : round
      ),
      status: "active",
      tieResolution: null,
    }
    if (isGameComplete(next) && leaders(next).length === 1)
      next.status = "finished"
    await persist(next, "Corrección guardada")
    setEditingIndex(null)
    setDraft(null)
  }

  async function removeGame(target: PochaGame) {
    if (
      window.confirm(
        "¿Exportar una copia de todas las partidas antes de eliminar?"
      )
    ) {
      await exportBackup()
    }
    if (
      !window.confirm(
        "¿Eliminar esta partida? Esta acción no se puede deshacer."
      )
    )
      return
    try {
      await deleteGame(target.id, target.revision)
      setGames((items) => items.filter((item) => item.id !== target.id))
      if (game?.id === target.id) {
        setGame(null)
        gameRef.current = null
      }
    } catch {
      setError("No se pudo eliminar: la partida pudo cambiar en otra pestaña.")
    }
  }

  async function exportBackup() {
    try {
      const content = exportGames(await listGames())
      const url = URL.createObjectURL(
        new Blob([content], { type: "application/json" })
      )
      const link = document.createElement("a")
      link.href = url
      link.download = `pocha-score-${new Date().toISOString().slice(0, 10)}.json`
      link.click()
      URL.revokeObjectURL(url)
      setMessage("Copia exportada")
    } catch {
      setError("No se pudo preparar la copia de seguridad.")
    }
  }

  async function importBackup(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return
    try {
      const backup = parseGameBackup(await file.text())
      if (
        !window.confirm(
          "El archivo contiene " +
            backup.games.length +
            " partidas. Se añadirán como copias nuevas; repetir una importación crea duplicados. ¿Continuar?"
        )
      )
        return
      const copies = await importGames(backup.games)
      setGames((items) => [...copies, ...items])
      setMessage(`${copies.length} partidas importadas`)
    } catch {
      setError(
        "El archivo no es una copia válida de Pocha Score. No se importó ninguna partida."
      )
    }
  }

  let title = "Pocha Score"
  if (screen === "create") title = "Nueva partida"
  else if (screen === "history") title = "Historial"
  else if (game) title = "Marcador"

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-1.5 p-1.5 py-1 sm:gap-1.5 sm:p-1.5">
      <header className="flex flex-wrap items-center justify-between gap-1.5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-400">
            Pocha Score
          </p>
          <h1 className="mt-0.5 text-3xl font-bold tracking-tight">{title}</h1>
        </div>
        {screen !== "home" || game ? (
          <button
            type="button"
            className={secondary}
            onClick={() => {
              setGame(null)
              gameRef.current = null
              setScreen("home")
              setError("")
            }}
          >
            Volver
          </button>
        ) : null}
      </header>
      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-rose-300 bg-rose-50 p-1.5 text-sm text-rose-900 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-100"
        >
          {error}
          <button
            type="button"
            className="ml-3 underline"
            onClick={() => {
              setError("")
              if (game) void openGame(game.id)
              else void refresh()
            }}
          >
            Reintentar / recargar
          </button>
        </div>
      ) : null}
      {message ? (
        <p role="status" className="text-sm text-zinc-600 dark:text-zinc-400">
          {message}
        </p>
      ) : null}

      {screen === "create" ? (
        <form onSubmit={submitConfiguration} className="flex flex-col gap-1.5">
          <section className={panel}>
            <h2 className="text-lg font-semibold">Jugadores y turnos</h2>
            <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
              Ordénalos alrededor de la mesa. El repartidor se elige abajo.
            </p>
            <div className="mt-0.5 grid gap-1.5 sm:grid-cols-2">
              {names.map((name, index) => (
                <label
                  key={playerKeys[index]}
                  className="flex flex-col gap-0.5 text-sm font-medium"
                >
                  Jugador {index + 1}
                  <input
                    required
                    maxLength={32}
                    value={name}
                    onChange={(event) =>
                      setNames((items) =>
                        items.map((item, i) =>
                          i === index ? event.target.value : item
                        )
                      )
                    }
                    className="min-h-10 rounded-xl border border-zinc-300 bg-transparent px-1.5 dark:border-zinc-700"
                  />
                </label>
              ))}
            </div>
            <div className="mt-0.5 flex flex-wrap items-end gap-1.5">
              {names.length < 6 ? (
                <button
                  type="button"
                  className={secondary}
                  onClick={() => {
                    const count = names.length + 1
                    setNames((items) => [...items, `Jugador ${count}`])
                    setPlayerKeys((items) => [...items, crypto.randomUUID()])
                    setOpeningRepeats(count)
                    setMaximumRepeats(count)
                    setClosingRepeats(count)
                    setMaximum(defaultMaximumByPlayers[count])
                  }}
                >
                  Añadir jugador
                </button>
              ) : null}
              {names.length > 3 ? (
                <button
                  type="button"
                  className={secondary}
                  onClick={() => {
                    setNames((items) => items.slice(0, -1))
                    setPlayerKeys((items) => items.slice(0, -1))
                    setOpeningRepeats(names.length - 1)
                    setMaximumRepeats(names.length - 1)
                    setClosingRepeats(names.length - 1)
                    setMaximum(defaultMaximumByPlayers[names.length - 1])
                    setDealerIndex((index) => Math.min(index, names.length - 2))
                  }}
                >
                  Quitar último
                </button>
              ) : null}
              <label className="flex flex-col gap-0.5 text-sm font-medium">
                Primer repartidor
                <select
                  value={dealerIndex}
                  onChange={(event) =>
                    setDealerIndex(Number(event.target.value))
                  }
                  className="min-h-10 rounded-xl border border-zinc-300 bg-transparent px-1.5 dark:border-zinc-700"
                >
                  {names.map((name, index) => (
                    <option key={playerKeys[index]} value={index}>
                      {name.trim() || `Jugador ${index + 1}`}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>
          <section className={panel}>
            <h2 className="text-lg font-semibold">Secuencia de rondas</h2>
            <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
              Baraja española de 40 cartas
              {names.length === 3 ? ", sin doses" : ""}. Puedes reducir el
              máximo según vuestra mesa.
            </p>
            <div className="mt-0.5 grid gap-1.5 sm:grid-cols-2">
              <label className="flex flex-col gap-0.5 text-sm font-medium">
                Máximo de cartas
                <select
                  value={maximum}
                  onChange={(event) => setMaximum(Number(event.target.value))}
                  className="min-h-10 rounded-xl border border-zinc-300 bg-transparent px-1.5 dark:border-zinc-700"
                >
                  {Array.from(
                    { length: defaultMaximumByPlayers[names.length] },
                    (_, i) => i + 1
                  )
                    .reverse()
                    .map((value) => (
                      <option key={value}>{value}</option>
                    ))}
                </select>
              </label>
              {[
                [
                  "Repeticiones de una carta al inicio",
                  openingRepeats,
                  setOpeningRepeats,
                ],
                ["Repeticiones del máximo", maximumRepeats, setMaximumRepeats],
                [
                  "Repeticiones de una carta al final",
                  closingRepeats,
                  setClosingRepeats,
                ],
              ].map(([label, value, setter]) => (
                <div
                  key={String(label)}
                  className="flex flex-col gap-0.5 text-sm font-medium"
                >
                  <span>{String(label)}</span>
                  <NumberStepper
                    label={String(label)}
                    value={Number(value)}
                    min={1}
                    max={20}
                    onChange={(next) => {
                      if (next !== null)
                        (setter as (value: number) => void)(next)
                    }}
                  />
                </div>
              ))}
            </div>
            <button
              type="button"
              className={`${secondary} mt-0.5`}
              onClick={() => {
                try {
                  setPreview(
                    createSchedule(
                      names.length,
                      maximum,
                      openingRepeats,
                      maximumRepeats,
                      closingRepeats
                    )
                  )
                  setError("")
                } catch {
                  setError("Las repeticiones deben estar entre uno y veinte.")
                }
              }}
            >
              Previsualizar secuencia
            </button>
            {preview ? (
              <p className="mt-0.5 rounded-xl bg-emerald-50 p-1.5 text-sm leading-5 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-100">
                {preview.length} rondas · {preview.join(" · ")} bazas
              </p>
            ) : null}
          </section>
          <button disabled={busy} type="submit" className={primary}>
            Crear partida
          </button>
        </form>
      ) : null}

      {screen === "home" && !game ? (
        <>
          <section
            className={
              panel +
              " bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950 dark:to-zinc-900"
            }
          >
            <p className="text-sm leading-5 text-zinc-700 dark:text-zinc-300">
              Anota las bazas de cada ronda y deja que Pocha Score lleve la
              cuenta. Tus partidas se guardan en este dispositivo.
            </p>
            <button
              type="button"
              className={`${primary} mt-0.5`}
              onClick={() => {
                setNames(["Jugador 1", "Jugador 2", "Jugador 3", "Jugador 4"])
                setPlayerKeys(
                  Array.from({ length: 4 }, () => crypto.randomUUID())
                )
                setDealerIndex(0)
                setMaximum(10)
                setOpeningRepeats(4)
                setMaximumRepeats(4)
                setClosingRepeats(4)
                setPreview(null)
                setScreen("create")
              }}
            >
              Crear partida
            </button>
          </section>
          {loading ? <p role="status">Cargando partidas…</p> : null}
          <section>
            <h2 className="mb-0.5 text-xl font-semibold">En curso</h2>
            {activeGames.length === 0 && !loading ? (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Todavía no hay partidas en curso.
              </p>
            ) : (
              <div className="grid gap-1.5 sm:grid-cols-2">
                {activeGames.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => void openGame(item.id)}
                    className={`${panel} text-left transition hover:border-emerald-500`}
                  >
                    <span className="font-semibold">
                      {item.players.map((player) => player.name).join(" · ")}
                    </span>
                    <span className="mt-0.5 block text-sm text-zinc-600 dark:text-zinc-400">
                      Ronda {item.rounds.length} de {item.schedule.length} ·{" "}
                      {dateLabel(item.updatedAt)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </section>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              className={secondary}
              onClick={() => setScreen("history")}
            >
              Ver historial ({finishedGames.length})
            </button>
            <button
              type="button"
              className={secondary}
              onClick={() => void exportBackup()}
            >
              Exportar copia
            </button>
            <button
              type="button"
              className={secondary}
              onClick={() => fileRef.current?.click()}
            >
              Importar copia
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              onChange={(event) => void importBackup(event)}
              className="sr-only"
              aria-label="Seleccionar copia de seguridad"
            />
          </div>
          <p className="text-xs leading-5 text-zinc-500">
            Las partidas pertenecen a este navegador y pueden perderse si borras
            los datos del sitio. Exporta una copia para guardarla fuera del
            dispositivo.
          </p>
        </>
      ) : null}

      {screen === "history" ? (
        <section className="flex flex-col gap-1.5">
          {finishedGames.length === 0 ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Las partidas terminadas aparecerán aquí.
            </p>
          ) : (
            finishedGames.map((item) => {
              const scores = gameTotals(item)
              const high = Math.max(...scores)
              return (
                <article key={item.id} className={panel}>
                  <button
                    type="button"
                    className="w-full text-left"
                    onClick={() => void openGame(item.id)}
                  >
                    <span className="font-semibold">
                      {item.players.map((player) => player.name).join(" · ")}
                    </span>
                    <span className="mt-0.5 block text-sm text-zinc-600 dark:text-zinc-400">
                      {dateLabel(item.updatedAt)} · Ganador
                      {scores.filter((score) => score === high).length > 1
                        ? "es"
                        : ""}
                      :{" "}
                      {item.players
                        .filter((_, index) => scores[index] === high)
                        .map((player) => player.name)
                        .join(", ")}
                    </span>
                  </button>
                  <button
                    type="button"
                    className={`${secondary} mt-0.5`}
                    onClick={() => void removeGame(item)}
                  >
                    Eliminar partida
                  </button>
                </article>
              )
            })
          )}
        </section>
      ) : null}

      {screen === "home" && game ? (
        <>
          {currentRound ? (
            <>
              <section className={panel}>
                <div className="flex flex-wrap items-baseline justify-between gap-1.5">
                  <h2 className="text-xl font-bold">
                    Ronda {currentRoundIndex + 1}{" "}
                    <span className="text-sm font-medium text-zinc-500">
                      de {game.schedule.length}
                    </span>
                  </h2>
                  <p className="font-semibold text-emerald-800 dark:text-emerald-300">
                    {currentRound.cards}{" "}
                    {currentRound.cards === 1 ? "baza" : "bazas"}
                  </p>
                </div>
                <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
                  Reparte {game.players[currentRound.dealerIndex].name}. Pide
                  primero{" "}
                  {
                    game.players[
                      (currentRound.dealerIndex + 1) % game.players.length
                    ].name
                  }
                  ; el repartidor pide último.
                </p>
              </section>
              <section className={panel}>
                <div className="flex items-start justify-between gap-1.5">
                  <div>
                    <h2 className="text-lg font-semibold">
                      {currentRound.status === "bidding"
                        ? "Bazas pedidas"
                        : "Bazas conseguidas"}
                    </h2>
                    <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
                      {currentRound.status === "bidding"
                        ? `La suma de las pedidas no puede coincidir con las bazas de la ronda.${dealerForbiddenBid !== null && dealerForbiddenBid >= 0 && dealerForbiddenBid <= currentRound.cards ? ` El repartidor no puede pedir ${dealerForbiddenBid}.` : ""}`
                        : `Las conseguidas deben sumar ${currentRound.cards}.`}
                    </p>
                  </div>
                  <span className="rounded-full bg-zinc-100 px-1.5 py-1 text-sm font-semibold dark:bg-zinc-800">
                    {(currentRound.status === "bidding"
                      ? currentRound.bids
                      : currentRound.tricks
                    ).reduce<number>(
                      (sum, value) => sum + (value ?? 0),
                      0
                    )}{" "}
                    / {currentRound.cards}
                  </span>
                </div>
                <div className="mt-0.5 flex flex-col gap-1.5">
                  {biddingOrder(
                    currentRound.dealerIndex,
                    game.players.length
                  ).map((playerIndex) => {
                    const player = game.players[playerIndex]
                    const values =
                      currentRound.status === "bidding"
                        ? currentRound.bids
                        : currentRound.tricks
                    return (
                      <div
                        key={player.id}
                        className="grid grid-cols-[1fr_auto] items-center gap-1.5 rounded-lg border border-zinc-200 p-1.5 dark:border-zinc-800"
                      >
                        <span className="font-medium">
                          {player.name}
                          {playerIndex === currentRound.dealerIndex &&
                          currentRound.status === "bidding" ? (
                            <span className="ml-1 text-xs text-zinc-500">
                              reparte · último
                            </span>
                          ) : null}
                        </span>
                        <NumberStepper
                          label={`${player.name}: ${currentRound.status === "bidding" ? "bazas pedidas" : "bazas conseguidas"}`}
                          value={values[playerIndex]}
                          min={0}
                          max={currentRound.cards}
                          onChange={(value) =>
                            changeEntry(
                              playerIndex,
                              currentRound.status === "bidding"
                                ? "bids"
                                : "tricks",
                              value === null ? "" : String(value)
                            )
                          }
                        />
                      </div>
                    )
                  })}
                </div>
                <button
                  type="button"
                  className={`${primary} mt-0.5 w-full sm:w-auto`}
                  onClick={() => void advanceRound()}
                >
                  {currentRound.status === "bidding"
                    ? "Guardar pedidas"
                    : "Cerrar ronda"}
                </button>
              </section>
            </>
          ) : null}
          <section className={panel}>
            <div className="flex flex-wrap items-center justify-between gap-1.5">
              <h2 className="text-lg font-semibold">Clasificación</h2>
              <span className="text-sm text-zinc-500">
                {message || "Acumulado"}
              </span>
            </div>
            <ol className="mt-0.5 grid gap-1.5 sm:grid-cols-2">
              {game.players
                .map((player, index) => ({ player, score: totals[index] }))
                .sort((a, b) => b.score - a.score)
                .map(({ player, score }, index) => (
                  <li
                    key={player.id}
                    className="flex items-center justify-between rounded-lg bg-zinc-50 px-1.5 py-1 dark:bg-zinc-800"
                  >
                    <span>
                      {index + 1}. {player.name}
                    </span>
                    <strong className="tabular-nums">{score}</strong>
                  </li>
                ))}
            </ol>
          </section>
          <section className={panel}>
            <h2 className="text-lg font-semibold">Rondas anotadas</h2>
            <div className="mt-0.5 overflow-x-auto">
              <table className="w-full min-w-[36rem] text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-700">
                    <th className="py-1 pr-1">#</th>
                    {game.players.map((player) => (
                      <th key={player.id} className="px-1.5 py-1">
                        {player.name}
                      </th>
                    ))}
                    <th className="py-1 pl-1">Editar</th>
                  </tr>
                </thead>
                <tbody>
                  {game.rounds.map((round, index) => (
                    <tr
                      key={round.id}
                      className="border-b border-zinc-100 dark:border-zinc-800"
                    >
                      <th className="py-1 pr-1 font-medium">
                        {index + 1} · {round.cards}
                      </th>
                      {game.players.map((player, playerIndex) => {
                        const score = roundScores(round, game.players.length)[
                          playerIndex
                        ]
                        return (
                          <td
                            key={player.id}
                            className="px-1.5 py-1 tabular-nums"
                          >
                            {round.status === "complete"
                              ? round.bids[playerIndex] +
                                " / " +
                                round.tricks[playerIndex] +
                                " · " +
                                (score > 0 ? "+" : "") +
                                score
                              : "En curso"}
                          </td>
                        )
                      })}
                      <td className="py-1 pl-1">
                        {round.status === "complete" ? (
                          <button
                            type="button"
                            className="underline"
                            onClick={() => {
                              setEditingIndex(index)
                              setDraft(structuredClone(round))
                              setError("")
                            }}
                          >
                            Editar
                          </button>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          {editingIndex !== null && draft ? (
            <section className={`${panel} border-amber-400`}>
              <h2 className="text-lg font-semibold">
                Corregir ronda {editingIndex + 1}
              </h2>
              <div className="mt-0.5 grid gap-1.5 sm:grid-cols-2">
                {game.players.map((player, index) => (
                  <div
                    key={player.id}
                    className="grid grid-cols-[minmax(3.5rem,1fr)_auto_auto] items-center gap-0.5"
                  >
                    <span className="text-sm font-medium">{player.name}</span>
                    {(["bids", "tricks"] as const).map((field) => (
                      <NumberStepper
                        key={field}
                        label={`${player.name}${field === "bids" ? ": pedidas" : ": conseguidas"}`}
                        value={draft[field][index]}
                        min={0}
                        max={draft.cards}
                        onChange={(value) => {
                          setDraft({
                            ...draft,
                            [field]: draft[field].map((item, i) =>
                              i === index ? value : item
                            ),
                          })
                        }}
                      />
                    ))}
                  </div>
                ))}
              </div>
              <p className="mt-0.5 text-xs text-zinc-500">
                Los campos aparecen como pedidas / conseguidas.
              </p>
              <div className="mt-0.5 flex gap-1.5">
                <button
                  type="button"
                  className={primary}
                  onClick={() => void saveCorrection()}
                >
                  Guardar corrección
                </button>
                <button
                  type="button"
                  className={secondary}
                  onClick={() => {
                    setEditingIndex(null)
                    setDraft(null)
                    setError("")
                  }}
                >
                  Cancelar
                </button>
              </div>
            </section>
          ) : null}
          <button
            type="button"
            className={`${secondary} self-start`}
            onClick={() => void removeGame(game)}
          >
            Eliminar partida
          </button>
          {isGameComplete(game) &&
          leadersList.length > 1 &&
          game.status === "active" ? (
            <section className={`${panel} border-amber-400`}>
              <h2 className="text-lg font-semibold">
                Empate entre{" "}
                {leadersList
                  .map((index) => game.players[index].name)
                  .join(", ")}
              </h2>
              <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
                Comparte la victoria o juega una ronda de desempate con una
                carta.
              </p>
              <div className="mt-0.5 flex flex-wrap gap-1.5">
                <button
                  type="button"
                  className={primary}
                  onClick={() => void resolveTie("shared")}
                >
                  Victoria compartida
                </button>
                <button
                  type="button"
                  className={secondary}
                  onClick={() => void resolveTie("extra")}
                >
                  Jugar desempate
                </button>
              </div>
            </section>
          ) : null}
          {game.status === "finished" ? (
            <section className={`${panel} border-emerald-500`}>
              <h2 className="text-xl font-bold">Partida terminada</h2>
              <p className="mt-0.5">
                {leadersList
                  .map((index) => game.players[index].name)
                  .join(", ")}{" "}
                {leadersList.length > 1
                  ? "comparten la victoria"
                  : "gana la partida"}{" "}
                con {Math.max(...totals)} puntos.
              </p>
            </section>
          ) : null}
        </>
      ) : null}
    </main>
  )
}
