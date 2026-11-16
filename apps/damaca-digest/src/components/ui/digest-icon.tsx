const paths = {
  capture: "M12 5v14m-7-7h14",
  topics: "M4 4h8l8 8-8 8-8-8V4Zm4 4h.01",
  original: "M13 5h6v6m0-6-9 9m7-1v6H5V7h6",
  edit: "m4 16 11-11 4 4L8 20H4v-4Zm9-9 4 4",
  favorite:
    "m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z",
  read: "M4 12l5 5L20 6",
  unread: "M6 5h12v14l-6-4-6 4V5Z",
  markdown: "M3 6h18v12H3V6Zm3 9V9l3 3 3-3v6m4-6v6m-2-2 2 2 2-2",
  json: "M9 4H7v4l-2 4 2 4v4h2m6-16h2v4l2 4-2 4v4h-2",
  delete: "M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13m-8 3v7m4-7v7",
} as const

export function DigestIcon({
  name,
  filled = false,
}: {
  name: keyof typeof paths
  filled?: boolean
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-5"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  )
}
