import Link from "next/link"
import { redirect } from "next/navigation"
import { getMemberDirectory } from "@/features/members/directory"
import {
  ballotOptions,
  type Contest,
  canSeeResults,
  categories,
  finalRunoffCounts,
  nextReveal,
  type Person,
  podium,
  results,
  revealedPodium,
  revealVersion,
  selectVoter,
  settleReveal,
  type Tapa,
} from "@/features/tapas/contest"
import {
  contestPath,
  eventPath,
  getContestActor,
  readContest,
} from "@/features/tapas/store"
import eventStyles from "../page.module.css"
import { Ballot, ContestForm, EntryControls } from "./controls"
import { RevealSync } from "./reveal-sync"
import styles from "./tapas.module.css"

const reasons = {
  runoff: "Votación de desempate",
  categories: "Prioridad de las categorías",
  draw: "Sorteo presencial",
}

const medals: Record<number, { icon: string; label: string }> = {
  1: { icon: "🥇", label: "Primer puesto" },
  2: { icon: "🥈", label: "Segundo puesto" },
  3: { icon: "🥉", label: "Tercer puesto" },
}

function Medal({ place }: { place: number }) {
  const medal = medals[place]
  return medal ? (
    <span role="img" aria-label={medal.label}>
      {medal.icon}
    </span>
  ) : null
}

function Results({ contest, sort }: { contest: Contest; sort?: string }) {
  const key = categories.find(([category]) => category === sort)?.[0] ?? "total"
  const places = new Map(
    podium(contest).flatMap(({ place, tapas }) =>
      tapas.map(({ id }) => [id, place] as const)
    )
  )
  const runoffCounts = finalRunoffCounts(contest)
  const winner = contest.tapas.find(({ id }) => id === contest.winner)
  const format = new Intl.NumberFormat("es-ES", { maximumFractionDigits: 2 })
  return (
    <section className={styles.panel}>
      <h2>Resultados</h2>
      {winner ? (
        <p>
          <strong>Ganadora: {winner.name}</strong>
          {contest.reason ? ` · ${reasons[contest.reason]}` : null}
        </p>
      ) : ["resolved", "published"].includes(contest.phase) ? (
        <p>Sin ganadora: no se recibieron valoraciones.</p>
      ) : null}
      <nav className={styles.sort} aria-label="Ordenar clasificación">
        <Link
          href={contestPath}
          aria-current={key === "total" ? "true" : undefined}
        >
          Puntuación final
        </Link>
        {categories.map(([category, label]) => (
          <Link
            key={category}
            href={`${contestPath}?sort=${category}`}
            aria-current={key === category ? "true" : undefined}
          >
            {label}
          </Link>
        ))}
      </nav>
      <ol className={styles.ranking}>
        {results(contest, key).map(
          ({ id, name, authors, count, total, sums }) => (
            <li key={id}>
              <Medal place={places.get(id) ?? 0} />
              {id === contest.winner ? (
                <span role="img" aria-label="Ganadora del concurso">
                  💎
                </span>
              ) : null}{" "}
              <strong>{name}</strong> ·{" "}
              {authors.map(({ alias }) => alias).join(" y ")}
              {count ? (
                <>
                  <p>
                    <strong>{format.format(total / count)} / 40</strong> ·{" "}
                    {count} {count === 1 ? "valoración" : "valoraciones"}
                  </p>
                  {runoffCounts.has(id) ? (
                    <p>
                      Votos de desempate:{" "}
                      <strong>{runoffCounts.get(id)}</strong>
                    </p>
                  ) : null}
                  <dl className={styles.scores}>
                    {categories.map(([category, label]) => (
                      <div key={category}>
                        <dt>{label}</dt>
                        <dd>{format.format(sums[category] / count)} / 10</dd>
                      </div>
                    ))}
                  </dl>
                </>
              ) : (
                <p>Sin valoraciones</p>
              )}
            </li>
          )
        )}
      </ol>
    </section>
  )
}

function AdminEntry({ tapa, people }: { tapa?: Tapa; people: Person[] }) {
  return (
    <ContestForm
      intent="admin-save"
      label={tapa ? "Guardar cambios" : "Inscribir tapa"}
    >
      <input type="hidden" name="tapa" value={tapa?.id ?? ""} />
      <label>
        Nombre de la tapa
        <input name="name" maxLength={80} required defaultValue={tapa?.name} />
      </label>
      <label>
        Autor o autora
        <select
          name="author"
          required
          defaultValue={tapa?.authors[0]?.id ?? ""}
        >
          <option value="">Elige un miembro</option>
          {people.map(({ id, alias }) => (
            <option key={id} value={id}>
              {alias}
            </option>
          ))}
        </select>
      </label>
      <label>
        Coautor o coautora (opcional)
        <select name="partner" defaultValue={tapa?.authors[1]?.id ?? ""}>
          <option value="">En solitario</option>
          {people.map(({ id, alias }) => (
            <option key={id} value={id}>
              {alias}
            </option>
          ))}
        </select>
      </label>
    </ContestForm>
  )
}

function Management({ contest }: { contest: Contest }) {
  if (contest.countdown) return <p>Revelación en curso…</p>
  switch (contest.phase) {
    case "registration":
      return (
        <ContestForm intent="open" label="Abrir votación">
          <p>Fija las tapas y la lista de asistentes.</p>
        </ContestForm>
      )
    case "rubric":
      return (
        <ContestForm intent="resolve" label="Resolver votación">
          <p>
            {contest.rubric.length} papeletas recibidas. Al resolver, se cierra
            la rúbrica y queda listo el podio para revelarlo.
          </p>
        </ContestForm>
      )
    case "runoff":
      return (
        <ContestForm intent="resolve-runoff" label="Cerrar desempate">
          <p>{contest.runoff.length} papeletas de desempate recibidas.</p>
        </ContestForm>
      )
    case "draw":
      return (
        <ContestForm intent="record-draw" label="Registrar ganadora del sorteo">
          <p>Realiza el sorteo presencial entre estas tapas.</p>
          <label>
            Ganadora
            <select name="winner" required defaultValue="">
              <option value="" disabled>
                Elige la ganadora
              </option>
              {contest.tapas
                .filter(({ id }) => contest.draw.includes(id))
                .map(({ id, name }) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
            </select>
          </label>
        </ContestForm>
      )
    case "published":
      return (
        <ContestForm
          intent="unpublish"
          label="Retirar publicación"
          confirmation="Los resultados volverán a ser privados."
        ></ContestForm>
      )
    case "preview":
    case "resolved": {
      const next = nextReveal(contest)
      if (!next) return null
      const labels = [
        "Publicar cierre sin ganadora",
        "Revelar primer puesto",
        "Revelar segundo puesto",
        "Revelar tercer puesto",
      ]
      return (
        <ContestForm
          key={next.token}
          intent="reveal"
          label={
            next.needsRunoff ? "Preparar primer puesto" : labels[next.place]
          }
        >
          <input type="hidden" name="step" value={next.token} />
        </ContestForm>
      )
    }
    default:
      return null
  }
}

export default async function TapasContest({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; assisted?: string; handoff?: string }>
}) {
  const actor = await getContestActor()
  if (!actor) redirect("/")
  const [stored, { sort, assisted, handoff }] = await Promise.all([
    readContest(),
    searchParams,
  ])
  const serverNow = Date.now()
  const contest = settleReveal(stored.contest, serverNow)
  const round =
    contest.phase === "rubric" || contest.phase === "runoff"
      ? contest.phase
      : null
  const voter = round ? selectVoter(contest, actor, assisted ?? "") : undefined
  const options = voter ? ballotOptions(contest, voter) : []
  const own =
    actor.member &&
    contest.tapas.find(({ authors }) => authors[0]?.id === actor.member?.id)
  const registered =
    actor.member &&
    contest.tapas.some(({ authors }) =>
      authors.some(({ id }) => id === actor.member?.id)
    )
  const directory =
    !assisted &&
    contest.phase === "registration" &&
    (actor.admin || (actor.member && (own || !registered)))
      ? await getMemberDirectory()
      : []
  const available = (tapa?: Tapa) =>
    directory.filter(
      ({ id }) =>
        !contest.tapas.some(
          (entry) =>
            entry !== tapa && entry.authors.some((author) => author.id === id)
        )
    )
  const people = available(own || undefined).filter(
    ({ id }) => id !== actor.member?.id
  )
  const eligible =
    !assisted && actor.admin && round
      ? contest.roster.filter((person) => ballotOptions(contest, person).length)
      : []

  if (assisted && !actor.admin) redirect(contestPath)

  return (
    <main className={eventStyles.event}>
      <RevealSync
        version={revealVersion(contest)}
        countdown={contest.countdown ?? null}
        serverNow={serverNow}
      />
      <div className={eventStyles.content}>
        <header className={eventStyles.header}>
          <h1 className={eventStyles.title}>
            {assisted ? "Papeleta de tapas" : "Concurso de tapas"}
          </h1>
          <p className={eventStyles.details}>
            {assisted && voter
              ? voter.alias
              : "Letux · 30 de diciembre de 2026"}
          </p>
        </header>
        <div className={eventStyles.eventActions}>
          {assisted ? (
            <section className={styles.panel}>
              {round && voter && options.length ? (
                <Ballot
                  key={`${contest.votingGeneration}:${round}:${voter.id}`}
                  options={options}
                  round={round}
                  canRandomize={false}
                  generation={contest.votingGeneration}
                  assisted={voter.id}
                  completed={`${contestPath}?handoff=done`}
                />
              ) : (
                <p>Esta papeleta ya no está disponible.</p>
              )}
              <Link
                className={eventStyles.back}
                href={`${contestPath}?handoff=done`}
                replace
              >
                Cancelar y devolver el móvil
              </Link>
            </section>
          ) : handoff === "done" ? (
            <section className={styles.panel}>
              <p>Devuelve el móvil al administrador.</p>
              <Link className={eventStyles.back} href={contestPath} replace>
                Volver al concurso
              </Link>
            </section>
          ) : (
            <>
              <Link className={eventStyles.back} href={eventPath}>
                ← Nochevieja en Letux
              </Link>
              {contest.phase === "registration" && (
                <section className={styles.panel}>
                  <h2>Inscripciones ({contest.tapas.length})</h2>
                  {contest.tapas.length ? (
                    <ul>
                      {contest.tapas.map((tapa) => (
                        <li key={tapa.id}>
                          <EntryControls
                            authors={tapa.authors
                              .map(({ alias }) => alias)
                              .join(" y ")}
                            edit={
                              actor.admin ? (
                                <AdminEntry
                                  tapa={tapa}
                                  people={available(tapa)}
                                />
                              ) : tapa.authors[0]?.id === actor.member?.id ? (
                                <ContestForm
                                  intent="save"
                                  label="Guardar cambios"
                                >
                                  <label>
                                    Nombre de tu tapa
                                    <input
                                      name="name"
                                      maxLength={80}
                                      required
                                      defaultValue={tapa.name}
                                    />
                                    <small>
                                      El resto de participantes no verá el
                                      nombre hasta que se abra la votación.
                                    </small>
                                  </label>
                                  <label>
                                    Coautor o coautora (opcional)
                                    <select
                                      name="partner"
                                      defaultValue={tapa.authors[1]?.id ?? ""}
                                    >
                                      <option value="">En solitario</option>
                                      {available(tapa)
                                        .filter(
                                          ({ id }) => id !== actor.member?.id
                                        )
                                        .map(({ id, alias }) => (
                                          <option key={id} value={id}>
                                            {alias}
                                          </option>
                                        ))}
                                    </select>
                                  </label>
                                </ContestForm>
                              ) : tapa.authors.some(
                                  ({ id }) => id === actor.member?.id
                                ) ? (
                                <ContestForm
                                  intent="rename-own"
                                  label="Guardar cambios"
                                >
                                  <input
                                    type="hidden"
                                    name="tapa"
                                    value={tapa.id}
                                  />
                                  <label>
                                    Nombre de tu tapa
                                    <input
                                      name="name"
                                      maxLength={80}
                                      required
                                      defaultValue={tapa.name}
                                    />
                                    <small>
                                      El resto de participantes no verá el
                                      nombre hasta que se abra la votación.
                                    </small>
                                  </label>
                                </ContestForm>
                              ) : null
                            }
                            remove={
                              actor.admin ||
                              tapa.authors[0]?.id === actor.member?.id ? (
                                <ContestForm
                                  intent={
                                    actor.admin ? "admin-remove" : "remove"
                                  }
                                  label="Borrar tapa"
                                  iconLabel={`Borrar tapa de ${tapa.authors.map(({ alias }) => alias).join(" y ")}`}
                                  confirmation="Se eliminará esta inscripción."
                                >
                                  <input
                                    type="hidden"
                                    name="tapa"
                                    value={tapa.id}
                                  />
                                </ContestForm>
                              ) : null
                            }
                          />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>Todavía no hay tapas inscritas.</p>
                  )}
                  {!actor.admin && actor.member && !registered ? (
                    <>
                      {contest.tapas.length > 0 ? (
                        <hr className={styles.entryDivider} />
                      ) : null}
                      <ContestForm intent="save" label="Inscribir mi tapa">
                        <label>
                          Nombre de tu tapa
                          <input name="name" maxLength={80} required />
                          <small>
                            El resto de participantes no verá el nombre hasta
                            que se abra la votación.
                          </small>
                        </label>
                        <label>
                          Coautor o coautora (opcional)
                          <select name="partner" defaultValue="">
                            <option value="">En solitario</option>
                            {people.map(({ id, alias }) => (
                              <option key={id} value={id}>
                                {alias}
                              </option>
                            ))}
                          </select>
                        </label>
                      </ContestForm>
                    </>
                  ) : actor.admin || actor.member ? null : (
                    <p>
                      Para inscribir una tapa necesitas una cuenta vinculada al
                      club.
                    </p>
                  )}
                </section>
              )}
              {round !== null && (
                <section className={styles.panel}>
                  <h2>
                    {round === "rubric"
                      ? "Votación con rúbrica"
                      : "Votación de desempate"}
                  </h2>
                  {voter && options.length ? (
                    <>
                      <p>
                        {round === "rubric"
                          ? "Puntúa todas las tapas ajenas del 0 al 10."
                          : "Elige tu favorita entre las finalistas."}{" "}
                        Puedes cambiar tu papeleta hasta el cierre.
                      </p>
                      <Ballot
                        key={`${contest.votingGeneration}:${round}`}
                        round={round}
                        canRandomize={actor.admin}
                        generation={contest.votingGeneration}
                        options={options}
                        initial={
                          round === "rubric"
                            ? contest.rubric.find(
                                ({ voter: id }) => id === voter.id
                              )?.value
                            : undefined
                        }
                        choice={
                          round === "runoff"
                            ? contest.runoff.find(
                                ({ voter: id }) => id === voter.id
                              )?.value
                            : undefined
                        }
                      />
                    </>
                  ) : (
                    <p>
                      {voter
                        ? round === "rubric"
                          ? "No tienes tapas ajenas que puntuar."
                          : "Los autores de las tapas finalistas no votan en el desempate."
                        : "Solo pueden votar los asistentes inscritos al abrir la votación."}
                    </p>
                  )}
                </section>
              )}
              {canSeeResults(contest) && (
                <Results contest={contest} sort={sort} />
              )}
              {!canSeeResults(contest) &&
                revealedPodium(contest).map(({ place, tapas }) => (
                  <section key={place} className={styles.panel}>
                    <h2>
                      <span aria-hidden="true">{medals[place]?.icon}</span>{" "}
                      {medals[place]?.label}
                    </h2>
                    <ul>
                      {tapas.map(({ id, name, authors }) => (
                        <li key={id}>
                          <strong>{name}</strong> ·{" "}
                          {authors.map(({ alias }) => alias).join(" y ")}
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              {!actor.admin &&
                !round &&
                !canSeeResults(contest) &&
                contest.phase !== "registration" && (
                  <section className={styles.panel}>
                    <p>
                      La votación está cerrada. Los resultados están pendientes
                      de publicación.
                    </p>
                  </section>
                )}
              {actor.admin ? (
                <section className={styles.panel}>
                  <h2>Administración</h2>
                  <Management key={contest.phase} contest={contest} />
                  {contest.phase === "registration" ? (
                    <details>
                      <summary>Inscribir una tapa</summary>
                      <AdminEntry people={available()} />
                    </details>
                  ) : null}
                  {!contest.countdown &&
                    contest.phase !== "registration" &&
                    contest.phase !== "published" && (
                      <ContestForm
                        key={`reopen:${contest.phase}`}
                        intent="reopen-registration"
                        label="Reabrir inscripciones"
                        confirmation="Se conservarán las tapas inscritas y se borrarán todas las papeletas y resultados."
                      ></ContestForm>
                    )}
                  {round && eligible.length > 0 && (
                    <form className={styles.form} action={contestPath}>
                      <label>
                        Preparar voto asistido
                        <select name="assisted" required defaultValue="">
                          <option value="" disabled>
                            Elige un asistente
                          </option>
                          {eligible.map(({ id, alias }) => (
                            <option key={id} value={id}>
                              {alias}
                            </option>
                          ))}
                        </select>
                      </label>
                      <button type="submit">
                        Abrir papeleta en este móvil
                      </button>
                    </form>
                  )}
                </section>
              ) : null}
            </>
          )}
        </div>
      </div>
    </main>
  )
}
