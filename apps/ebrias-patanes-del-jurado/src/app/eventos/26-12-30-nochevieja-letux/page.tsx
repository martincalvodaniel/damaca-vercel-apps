import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import {
  type ActivityDay,
  type EventGuide,
  type GuideBlock,
  guideEntries,
  guideSections,
} from "@/features/event-guide/guide"
import { readGuide } from "@/features/event-guide/store"
import {
  getAttendanceBlocks,
  getEventRoster,
  letuxEvent,
} from "@/features/members/attendance"
import { getMemberDirectory } from "@/features/members/directory"
import { getCarBoard, unassignedCar } from "@/features/members/event-cars"
import { canManageAttendance, getAuthorizedUser } from "@/lib/session"
import {
  AttendanceBlocksSection,
  AttendanceBoard,
  CarSection,
} from "./attendance-form"
import guideStyles from "./guide.module.css"
import { GuideEditor } from "./guide-editor"
import { LumosGate } from "./lumos-gate"
import styles from "./page.module.css"

// biome-ignore lint/style/useComponentExportOnlyModules: Next.js requires this page export.
export const metadata: Metadata = { title: "Nochevieja en Letux · Ebrias" }

export default async function NewYearsEve() {
  const user = await getAuthorizedUser()
  if (!user) redirect("/")

  const [roster, blocks, cars, { guide, revision }, canManage] =
    await Promise.all([
      getEventRoster(letuxEvent),
      getAttendanceBlocks(letuxEvent),
      getCarBoard(letuxEvent),
      readGuide(),
      canManageAttendance(),
    ])

  const members = canManage ? await getMemberDirectory() : []

  return (
    <LumosGate>
      <main className={styles.event}>
        <div className={styles.content}>
          <header className={styles.header}>
            <div className={styles.crest} aria-hidden="true">
              <svg viewBox="0 0 24 32" fill="currentColor" aria-hidden="true">
                <path d="M14.5 0 4 18h6.5L8 32l12-20h-7L14.5 0Z" />
              </svg>
            </div>
            <h1 className={styles.title}>Nochevieja en Letux</h1>
            <p className={styles.date}>
              <time dateTime="2026-12-30">30 dic 2026</time> –{" "}
              <time dateTime="2027-01-01">1 ene 2027</time>
            </p>
            <p className={styles.details}>
              Casa rural en Letux · Disfraces de Harry Potter
            </p>
          </header>

          <div className={guideStyles.guide}>
            {user.role === "admin" ? (
              <GuideEditor guide={guide} revision={revision} />
            ) : null}
            {guide.notes.lodging ? (
              <section className={guideStyles.panel}>
                <h2>Alojamiento</h2>
                <GuideText text={guide.notes.lodging} />
              </section>
            ) : null}
            <AttendanceBlocksSection canManage={canManage}>
              <AttendanceBoard
                blocks={blocks}
                roster={roster}
                members={members}
                canManage={canManage}
              />
            </AttendanceBlocksSection>
            <CarSection canManage={canManage}>
              <AttendanceBoard
                mode="cars"
                blocks={cars.blocks}
                roster={roster.map((guest) => ({
                  ...guest,
                  status: cars.assigned.get(guest.id) ?? unassignedCar,
                }))}
                members={[]}
                canManage={canManage}
              />
            </CarSection>
            <ProgramDay
              day="dec30"
              label={guideSections[0].label}
              guide={guide}
            />
            <ProgramDay
              day="dec31"
              label={guideSections[1].label}
              guide={guide}
            />
            <OptionalSection
              label={guideSections[2].label}
              blocks={guide.sections.jan01}
            />
            <OptionalSection
              label={guideSections[3].label}
              blocks={guide.sections.other}
            />
          </div>
        </div>
      </main>
    </LumosGate>
  )
}

function GuideText({ text }: { text: string }) {
  return text ? <p className={guideStyles.copy}>{text}</p> : null
}

function ProgramDay({
  day,
  label,
  guide,
}: {
  day: ActivityDay
  label: string
  guide: EventGuide
}) {
  return (
    <section className={guideStyles.panel}>
      <h2>{label}</h2>
      {guideEntries(guide, day).map((entry) =>
        "link" in entry ? (
          <article key={entry.id}>
            <GuideText text={guide.notes[entry.id]} />
            <Link
              className={styles.back}
              href={
                entry.id === "tapas"
                  ? "/eventos/26-12-30-nochevieja-letux/tapas"
                  : "/eventos/26-12-30-nochevieja-letux/disfraces"
              }
            >
              {entry.link} →
            </Link>
          </article>
        ) : (
          <GuideArticle key={entry.id} block={entry} />
        )
      )}
    </section>
  )
}

function GuideArticle({ block }: { block: GuideBlock }) {
  return (
    <article>
      <h3>{block.title}</h3>
      <GuideText text={block.text} />
    </article>
  )
}

function OptionalSection({
  label,
  blocks,
}: {
  label: string
  blocks: GuideBlock[]
}) {
  return blocks.length ? (
    <section className={guideStyles.panel}>
      <h2>{label}</h2>
      {blocks.map((block) => (
        <GuideArticle key={block.id} block={block} />
      ))}
    </section>
  ) : null
}
