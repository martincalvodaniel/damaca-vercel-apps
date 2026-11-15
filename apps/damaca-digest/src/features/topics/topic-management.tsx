import { updateTopic } from "@/features/topics/actions"

const field =
  "block min-h-11 w-full min-w-0 rounded-lg border border-zinc-300 bg-transparent px-2 dark:border-zinc-700"
const button = "min-h-11 rounded-lg bg-emerald-800 px-3 font-medium text-white"

type TopicChoice = { id: string; label: string }

export function TopicManagement({
  topics,
  open,
}: {
  topics: TopicChoice[]
  open: boolean
}) {
  const options = topics.map((topic) => (
    <option key={topic.id} value={topic.id}>
      {topic.label}
    </option>
  ))
  return (
    <details
      open={open}
      className="rounded-lg border border-zinc-300 px-3 dark:border-zinc-700"
    >
      <summary className="min-h-11 cursor-pointer py-3 text-sm font-medium">
        Manage topics
      </summary>
      <form action={updateTopic} className="space-y-2 pb-3 text-sm">
        <label className="block">
          Topic
          <select name="topicId" className={field}>
            {options}
          </select>
        </label>
        <label className="block">
          New name or alias
          <input name="label" className={field} required maxLength={100} />
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            className={button}
            type="submit"
            name="operation"
            value="rename"
          >
            Rename
          </button>
          <button
            className={button}
            type="submit"
            name="operation"
            value="alias"
          >
            Add alias
          </button>
        </div>
      </form>
      {topics.length > 1 ? (
        <form
          action={updateTopic}
          className="space-y-2 border-t border-zinc-300 py-3 text-sm dark:border-zinc-700"
        >
          <label className="block">
            Merge topic
            <select name="topicId" className={field}>
              {options}
            </select>
          </label>
          <label className="block">
            Into topic
            <select
              name="targetId"
              defaultValue={topics[1]?.id}
              className={field}
            >
              {options}
            </select>
          </label>
          <button
            className={button}
            type="submit"
            name="operation"
            value="merge"
          >
            Merge topics
          </button>
        </form>
      ) : null}
    </details>
  )
}
