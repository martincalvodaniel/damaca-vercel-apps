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
import { formatEventDate, letuxEventListing } from "@/features/events/catalog"
import {
  getAttendanceBlocks,
  getEventRoster,
  letuxEvent,
} from "@/features/members/attendance"
import {
  getMemberDirectory,
  readMemberAvatars,
} from "@/features/members/directory"
import { getCarBoard, unassignedCar } from "@/features/members/event-cars"
import { ShoppingList } from "@/features/shopping/shopping-list"
import { readShoppingList } from "@/features/shopping/store"
import { canManageAttendance, getAuthorizedUser } from "@/lib/session"
import {
  AttendanceBlocksSection,
  AttendanceBoard,
  CarSection,
} from "./attendance-form"
import guideStyles from "./guide.module.css"
import { GuideEditor } from "./guide-editor"
import { GuideText } from "./guide-text"
import { LumosGate } from "./lumos-gate"
import styles from "./page.module.css"

// biome-ignore lint/style/useComponentExportOnlyModules: Next.js requires this page export.
export const metadata: Metadata = {
  title: `${letuxEventListing.title} · Ebrias`,
}

export default async function NewYearsEve() {
  const user = await getAuthorizedUser()
  if (!user) redirect("/")

  const [roster, blocks, cars, { guide, revision }, canManage, shopping] =
    await Promise.all([
      getEventRoster(letuxEvent),
      getAttendanceBlocks(letuxEvent),
      getCarBoard(letuxEvent),
      readGuide(),
      canManageAttendance(),
      readShoppingList(),
    ])

  const members = canManage ? await getMemberDirectory() : []

  const avatars = await readMemberAvatars([
    ...roster.flatMap(({ memberId }) => (memberId ? [memberId] : [])),
    ...members.map(({ id }) => id),
  ])
  const guests = roster.map((guest) => ({
    ...guest,
    image: avatars.get(guest.memberId ?? "") ?? null,
  }))
  const memberOptions = members.map(({ id, alias }) => ({
    id,
    alias,
    image: avatars.get(id) ?? null,
  }))

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
            <h1 className={styles.title}>{letuxEventListing.title}</h1>
            <p className={styles.date}>
              <time dateTime={letuxEventListing.startDate}>
                {formatEventDate(letuxEventListing.startDate)}
              </time>{" "}
              –{" "}
              <time dateTime={letuxEventListing.endDate}>
                {formatEventDate(letuxEventListing.endDate)}
              </time>
            </p>
            <p className={styles.details}>
              {letuxEventListing.location} · Disfraces de Harry Potter
            </p>
          </header>

          <div className={guideStyles.guide}>
            {user.role === "admin" ? (
              <GuideEditor guide={guide} revision={revision} />
            ) : null}
            {guide.notes.lodging ? (
              <details name="letux-sections" className={styles.attendees}>
                <summary>Alojamiento</summary>
                <div className={styles.card}>
                  <GuideText text={guide.notes.lodging} />
                </div>
              </details>
            ) : null}
            <AttendanceBlocksSection canManage={canManage}>
              <AttendanceBoard
                blocks={blocks}
                roster={guests}
                members={memberOptions}
                canManage={canManage}
              />
            </AttendanceBlocksSection>
            <CarSection canManage={canManage}>
              <AttendanceBoard
                mode="cars"
                blocks={cars.blocks}
                roster={guests.map((guest) => ({
                  ...guest,
                  status: cars.assigned.get(guest.id) ?? unassignedCar,
                }))}
                members={[]}
                canManage={canManage}
              />
            </CarSection>
            <ShoppingList items={shopping.items} canEdit={canManage} />
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
            <h3>{guide.activityTitles?.[entry.id] ?? entry.title}</h3>
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
