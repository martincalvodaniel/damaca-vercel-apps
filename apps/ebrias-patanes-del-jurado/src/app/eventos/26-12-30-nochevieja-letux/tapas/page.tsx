import Link from "next/link"
import { redirect } from "next/navigation"
import { getMemberDirectory } from "@/features/members/directory"
import {
  ballotOptions,
  type Contest,
  canSeeResults,
  categories,
  results,
  selectVoter,
} from "@/features/tapas/contest"
import {
  contestPath,
  eventPath,
  getContestActor,
  readContest,
} from "@/features/tapas/store"
import eventStyles from "../page.module.css"
import { Ballot, ContestForm } from "./controls"
import styles from "./tapas.module.css"

const reasons = {
  runoff: "Votación de desempate",
  categories: "Prioridad de las categorías",
  draw: "Sorteo presencial",
}

function Results({ contest, sort }: { contest: Contest; sort?: string }) {
  const key = categories.find(([category]) => category === sort)?.[0] ?? "total"
  const winner = contest.tapas.find(({ id }) => id === contest.winner)
  const format = new Intl.NumberFormat("es-ES", { maximumFractionDigits: 2 })
  return (
    <section className={styles.panel}>
      <h2>
        {contest.phase === "published" ? "Resultados" : "Vista previa privada"}
      </h2>
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
              <strong>{name}</strong> ·{" "}
              {authors.map(({ alias }) => alias).join(" y ")}
              {count ? (
                <>
                  <p>
                    <strong>{format.format(total / count)} / 40</strong> ·{" "}
                    {count} {count === 1 ? "valoración" : "valoraciones"}
                  </p>
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

function Management({ contest }: { contest: Contest }) {
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
            la rúbrica y se abre la vista previa privada.
          </p>
        </ContestForm>
      )
    case "preview":
      return (
        <ContestForm intent="open-runoff" label="Abrir desempate">
          <p>Hay un empate en el primer puesto.</p>
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
    case "resolved":
      return (
        <ContestForm intent="publish" label="Publicar resultados">
          <label className={styles.confirm}>
            <input type="checkbox" required name="confirm" value="yes" />{" "}
            Confirmo la publicación definitiva.
          </label>
        </ContestForm>
      )
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
  const [{ contest }, { sort, assisted, handoff }] = await Promise.all([
    readContest(),
    searchParams,
  ])
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
  const people =
    !assisted &&
    contest.phase === "registration" &&
    actor.member &&
    (own || !registered)
      ? (await getMemberDirectory()).filter(
          ({ id }) =>
            id !== actor.member?.id &&
            !contest.tapas.some(
              (entry) =>
                entry !== own &&
                entry.authors.some((author) => author.id === id)
            )
        )
      : []
  const eligible =
    !assisted && actor.admin && round
      ? contest.roster.filter((person) => ballotOptions(contest, person).length)
      : []

  if (assisted && !actor.admin) redirect(contestPath)

  return (
    <main className={eventStyles.event}>
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
                  key={`${round}:${voter.id}`}
                  options={options}
                  round={round}
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
                  <h2>Inscripciones</h2>
                  {contest.tapas.length ? (
                    <ul>
                      {contest.tapas.map(({ id, name, authors }) => (
                        <li key={id}>
                          <strong>{name}</strong> ·{" "}
                          {authors.map(({ alias }) => alias).join(" y ")}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>Todavía no hay tapas inscritas.</p>
                  )}
                  {actor.member && (own || !registered) ? (
                    <>
                      <ContestForm
                        key={own?.id ?? "new"}
                        intent="save"
                        label={own ? "Guardar cambios" : "Inscribir mi tapa"}
                      >
                        <label>
                          Nombre de la tapa
                          <input
                            name="name"
                            maxLength={80}
                            required
                            defaultValue={own?.name}
                          />
                        </label>
                        <label>
                          Coautor o coautora (opcional)
                          <select
                            name="partner"
                            defaultValue={own?.authors[1]?.id ?? ""}
                          >
                            <option value="">En solitario</option>
                            {people.map(({ id, alias }) => (
                              <option key={id} value={id}>
                                {alias}
                              </option>
                            ))}
                          </select>
                        </label>
                      </ContestForm>
                      {Boolean(own) && (
                        <ContestForm intent="remove" label="Retirar mi tapa" />
                      )}
                    </>
                  ) : registered ? (
                    <p>Ya figuras como coautor en una tapa.</p>
                  ) : (
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
                        key={round}
                        round={round}
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
              {canSeeResults(contest, actor.admin) && (
                <Results contest={contest} sort={sort} />
              )}
              {!actor.admin &&
                !round &&
                !canSeeResults(contest, false) &&
                contest.phase !== "registration" && (
                  <section className={styles.panel}>
                    <p>
                      La votación está cerrada. Los resultados están pendientes
                      de publicación.
                    </p>
                  </section>
                )}
              {actor.admin && contest.phase !== "published" && (
                <section className={styles.panel}>
                  <h2>Administración</h2>
                  <Management key={contest.phase} contest={contest} />
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
              )}
            </>
          )}
        </div>
      </div>
    </main>
  )
}
