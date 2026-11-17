import Link from "next/link"
import { SearchButton } from "@/components/ui/search-button"
import { filterTopicLabels } from "@/features/topics/catalog"
import { TopicManagement } from "@/features/topics/topic-management"
import { requireAuthorizedSession } from "@/lib/auth/session"
import { listTopics } from "@/lib/db/topics"
import { topicSearch } from "@/schemas/topic"

const topicSearchFormId = "topic-search"

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
      <h1 className="sr-only">Topics</h1>
      {topics.length ? (
        <>
          <div className="digest-panel digest-search-panel digest-search-row">
            <form
              action="/topics"
              id={topicSearchFormId}
              className="min-w-0 flex-1"
              aria-label="Search topics"
            >
              <label className="min-w-0 flex-1 text-sm">
                <input
                  type="search"
                  aria-label="Topic or alias"
                  placeholder="Topic or alias"
                  name="q"
                  maxLength={100}
                  defaultValue={query.success ? query.data : undefined}
                  className="digest-search-field"
                />
              </label>
            </form>
            <TopicManagement topics={topics} error={error} />
            <SearchButton label="Search topics" form={topicSearchFormId} />
          </div>
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
                className="digest-panel min-w-0 break-words rounded-xl px-2"
              >
                <Link
                  href={`/?${new URLSearchParams({ topic: topic.label })}`}
                  className="flex min-h-8 items-center justify-between gap-3 font-medium hover:text-teal-800 dark:hover:text-teal-300"
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
