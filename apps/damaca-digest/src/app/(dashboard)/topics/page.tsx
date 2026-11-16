import Link from "next/link"
import { filterTopicLabels } from "@/features/topics/catalog"
import { TopicManagement } from "@/features/topics/topic-management"
import { requireAuthorizedSession } from "@/lib/auth/session"
import { listTopics } from "@/lib/db/topics"
import { topicSearch } from "@/schemas/topic"

export default async function TopicsPage({
  searchParams,
}: {
  searchParams: Promise<{ result?: string; q?: string | string[] }>
}) {
  const [{ user }, { result, q }] = await Promise.all([
    requireAuthorizedSession(),
    searchParams,
  ])
  const topics = await listTopics(user.id, true)
  const query = topicSearch.safeParse(q)
  const filtered = query.success ? filterTopicLabels(topics, query.data) : []
  const error =
    result === "invalid"
      ? "Check the topic and operation."
      : result === "conflict"
        ? "The topic could not be changed. Check the selected topics and existing aliases."
        : undefined
  return (
    <section className="mx-auto max-w-3xl space-y-3 py-2 sm:space-y-4 sm:py-5">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Topics
        </h1>
        <Link
          href="/"
          className="digest-panel inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold hover:border-teal-600"
        >
          Library
        </Link>
      </div>
      {error ? <p role="alert">{error}</p> : null}
      {topics.length ? (
        <>
          <form
            action="/topics"
            className="flex flex-wrap items-end gap-2"
            aria-label="Search topics"
          >
            <label className="min-w-0 flex-1 text-sm font-medium">
              Topic or alias
              <input
                type="search"
                name="q"
                maxLength={100}
                defaultValue={query.success ? query.data : undefined}
                className="digest-panel mt-1 block min-h-11 w-full min-w-0 rounded-lg px-2.5"
              />
            </label>
            <button
              type="submit"
              className="digest-panel min-h-11 rounded-lg px-3 text-sm font-semibold hover:border-teal-600"
            >
              Search
            </button>
          </form>
          <TopicManagement topics={topics} open={!!error} />
          {!query.success ? (
            <p role="alert">Use a topic or alias of up to 100 characters.</p>
          ) : filtered.length === 0 ? (
            <p>
              No matching topics.{" "}
              <Link href="/topics" className="underline">
                Clear search
              </Link>
            </p>
          ) : null}
          <ul className="space-y-2">
            {filtered.map((topic) => (
              <li
                key={topic.id}
                className="digest-panel min-w-0 break-words rounded-xl px-3"
              >
                <Link
                  href={`/?${new URLSearchParams({ topic: topic.label })}`}
                  className="flex min-h-11 items-center justify-between gap-3 font-medium hover:text-teal-800 dark:hover:text-teal-300"
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
