import { createHash } from "node:crypto"
import Link from "next/link"
import { DigestIcon } from "@/components/ui/digest-icon"
import { RememberedFilters } from "@/components/ui/remembered-filters"
import { SearchButton } from "@/components/ui/search-button"
import { filterTopicLabels } from "@/features/topics/catalog"
import { TopicDeleteButton } from "@/features/topics/topic-delete-button"
import { TopicManagement } from "@/features/topics/topic-management"
import { requireAuthorizedSession } from "@/lib/auth/session"
import { listTopics } from "@/lib/db/topics"
import { topicSearch } from "@/schemas/topic"

const topicSearchFormId = "topic-search"

export default async function TopicsPage({
  searchParams,
}: {
  searchParams: Promise<{
    result?: string
    q?: string | string[]
    reset?: string
  }>
}) {
  const [{ user }, { result, q, reset }] = await Promise.all([
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
      <RememberedFilters
        accountKey={createHash("sha256").update(user.id).digest("hex")}
        path="/topics"
        restore={q === undefined && reset === undefined && result === undefined}
        applied={
          query.success && (q !== undefined || reset === "1")
            ? query.data
              ? `/topics?${new URLSearchParams({ q: query.data })}`
              : ""
            : undefined
        }
      />
      <h1 className="sr-only">Topics</h1>
      {result === "in_use" || result === "delete_failed" ? (
        <p role="alert">
          {result === "in_use"
            ? "This topic now has articles and could not be deleted."
            : "The topic could not be deleted. Try again."}
        </p>
      ) : null}
      {topics.length ? (
        <>
          <div className="digest-panel digest-search-panel digest-search-row">
            <form
              action="/topics"
              key={query.success ? (query.data ?? "") : "invalid"}
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
            {query.success && query.data ? (
              <Link
                href="/topics?reset=1"
                aria-label="Clear search"
                title="Clear search"
                className="digest-icon-button text-red-700 dark:text-red-300"
              >
                <DigestIcon name="close" />
              </Link>
            ) : null}
            <TopicManagement topics={topics} error={error} />
            <SearchButton label="Search topics" form={topicSearchFormId} />
          </div>
          {!query.success ? (
            <p role="alert">Use a topic or alias of up to 100 characters.</p>
          ) : filtered.length === 0 ? (
            <p>No matching topics.</p>
          ) : null}
          <ul className="space-y-2">
            {filtered.map((topic) => (
              <li
                key={topic.id}
                className="digest-panel min-w-0 break-words rounded-xl px-2"
              >
                <div className="flex min-h-8 items-center gap-2">
                  <Link
                    href={`/?${new URLSearchParams({ topic: topic.label })}`}
                    className="min-w-0 grow font-medium hover:text-teal-800 dark:hover:text-teal-300"
                  >
                    {topic.label}
                  </Link>
                  {topic.articleCount === 0 ? (
                    <TopicDeleteButton
                      id={topic.id}
                      label={topic.label}
                      query={query.success ? query.data : undefined}
                    />
                  ) : null}
                  <span className="shrink-0 text-sm">
                    {`(${topic.articleCount})`}
                    <span className="sr-only"> articles</span>
                  </span>
                </div>
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
