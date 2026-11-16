"use client"

import { type ChangeEvent, useCallback, useState } from "react"
import { SearchDialog } from "@/components/ui/search-dialog"
import { updateTopic } from "@/features/topics/actions"

type TopicChoice = { id: string; label: string }

export function TopicManagement({
  topics,
  error,
}: {
  topics: TopicChoice[]
  error?: string
}) {
  const [operation, setOperation] = useState("rename")
  const changeOperation = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) =>
      setOperation(event.currentTarget.value),
    []
  )
  const reset = useCallback(() => setOperation("rename"), [])
  const options = topics.map((topic) => (
    <option key={topic.id} value={topic.id}>
      {topic.label}
    </option>
  ))

  return (
    <form action={updateTopic} onReset={reset}>
      <SearchDialog
        label="Manage topics"
        icon="topics"
        applyLabel="Apply topic change"
        clearLabel="Clear topic form"
        openOnError={!!error}
      >
        <div className="grid gap-2 text-sm">
          {error ? <p role="alert">{error}</p> : null}
          <label>
            Action
            <select
              name="operation"
              value={operation}
              onChange={changeOperation}
              className="digest-search-field"
            >
              <option value="rename">Rename</option>
              <option value="alias">Add alias</option>
              {topics.length > 1 ? (
                <option value="merge">Merge topics</option>
              ) : null}
            </select>
          </label>
          <label>
            Topic
            <select name="topicId" className="digest-search-field">
              {options}
            </select>
          </label>
          {operation === "merge" ? (
            <label>
              Into topic
              <select
                name="targetId"
                defaultValue={topics[1]?.id}
                className="digest-search-field"
              >
                {options}
              </select>
            </label>
          ) : (
            <label>
              {operation === "rename" ? "New name" : "New alias"}
              <input
                key={operation}
                name="label"
                className="digest-search-field"
                required
                maxLength={100}
              />
            </label>
          )}
        </div>
      </SearchDialog>
    </form>
  )
}
