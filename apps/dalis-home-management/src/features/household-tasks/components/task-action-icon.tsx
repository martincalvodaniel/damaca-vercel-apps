const iconPaths = {
  add: "M12 5v14M5 12h14",
  schedule:
    "M7 3v4m10-4v4M4 9h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm3 8h3v3H8v-3Z",
  record: "m7 12 3 3 7-7M21 12a9 9 0 1 1-5-8",
  update: "m15 5 4 4M4 20l4-1L20 7a2.8 2.8 0 0 0-4-4L4 15v5Z",
  history: "M12 7v5l3 2M21 12a9 9 0 1 1-9-9 9 9 0 0 1 9 9Z",
  archive: "M4 8h16v12H4V8ZM3 4h18v4H3V4Zm6 8h6",
  active: "m4 6 2 2 3-4m3 2h8M4 14l2 2 3-4m3 2h8M4 21h16",
  complete: "m5 12 4 4L19 6",
  move: "M4 7h15m-4-4 4 4-4 4M20 17H5m4-4-4 4 4 4",
  cancel: "m6 6 12 12M18 6 6 18",
  "edit-execution": "m15 5 4 4M4 20l4-1L20 7a2.8 2.8 0 0 0-4-4L4 15v5Z",
  "delete-execution": "M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v5m4-5v5",
} as const

export type TaskActionIconName = keyof typeof iconPaths

export function TaskActionIcon({ name }: { name: TaskActionIconName }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4 shrink-0"
    >
      <path d={iconPaths[name]} />
    </svg>
  )
}
