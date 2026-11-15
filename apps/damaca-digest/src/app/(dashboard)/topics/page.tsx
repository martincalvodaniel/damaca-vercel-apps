import Link from "next/link"
import { TopicManagement } from "@/features/topics/topic-management"
import { requireAuthorizedSession } from "@/lib/auth/session"
import { listTopics } from "@/lib/db/topics"

export default async function TopicsPage({
  searchParams,
}: {
  searchParams: Promise<{ result?: string }>
}) {
  const [{ user }, { result }] = await Promise.all([
    requireAuthorizedSession(),
    searchParams,
  ])
  const topics = await listTopics(user.id, true)
  const error =
    result === "invalid"
      ? "Check the topic and operation."
      : result === "conflict"
        ? "The topic could not be changed. Check the selected topics and existing aliases."
        : undefined
  return (
    <section className="mx-auto max-w-2xl space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Topics</h1>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center text-sm underline"
        >
          Library
        </Link>
      </div>
      {error ? <p role="alert">{error}</p> : null}
      {topics.length ? (
        <>
          <TopicManagement topics={topics} open={!!error} />
          <ul className="space-y-2">
            {topics.map((topic) => (
              <li
                key={topic.id}
                className="min-w-0 break-words rounded-lg border border-zinc-300 px-3 dark:border-zinc-700"
              >
                <Link
                  href={`/?${new URLSearchParams({ topic: topic.label })}`}
                  className="flex min-h-11 items-center justify-between gap-3"
                >
                  <span>{topic.label}</span>
                  <span className="shrink-0 text-sm">
                    {`${topic.articleCount} ${topic.articleCount === 1 ? "article" : "articles"}`}
                  </span>
                </Link>
                {topic.aliases.length ? (
                  <p className="pb-2 text-sm text-zinc-600 dark:text-zinc-400">
                    Aliases: {topic.aliases.join(", ")}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p>Topics appear when you capture or edit an article.</p>
      )}
    </section>
  )
}
