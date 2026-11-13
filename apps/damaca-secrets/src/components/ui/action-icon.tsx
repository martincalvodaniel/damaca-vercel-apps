const paths = {
  add: "M12 5v14M5 12h14",
  back: "m12 19-7-7 7-7M5 12h14",
  check: "m5 12 4 4L19 6",
  close: "m6 6 12 12M18 6 6 18",
  copy: "M9 9h11v11H9zM15 5H5v10",
  delete: "M4 7h16M9 7V4h6v3m3 0-1 13H7L6 7m4 4v5m4-5v5",
  edit: "m4 16-1 5 5-1L20 8l-4-4L4 16Zm10-10 4 4",
  generate: "m9 11 8-8 4 4-8 8m-4-4 4 4-6 6-4-4 6-6M5 3v4M3 5h4m13 9v4m-2-2h4",
  hide: "m3 3 18 18M10 10a3 3 0 0 0 4 4M9 5a9 9 0 0 1 3-.5c6 0 10 7.5 10 7.5a19 19 0 0 1-3 4M6 6C3 8 2 12 2 12s4 7.5 10 7.5a10 10 0 0 0 5-1.5",
  lock: "M7 10V7a5 5 0 0 1 10 0v3M5 10h14v11H5zM12 14v3",
  refresh:
    "M20 7v5h-5M4 17v-5h5m-5 0a8 8 0 0 1 14-5l2 3M4 14l2 3a8 8 0 0 0 12 1",
  save: "M4 4h13l3 3v13H4zM8 4v6h8V4M8 20v-6h8v6",
  show: "M2 12s4-7.5 10-7.5S22 12 22 12s-4 7.5-10 7.5S2 12 2 12Zm13 0a3 3 0 1 0-6 0 3 3 0 0 0 6 0Z",
} as const

export type ActionIconName = keyof typeof paths

export function ActionIcon({ icon }: { icon: ActionIconName }) {
  return (
    <svg
      aria-hidden="true"
      className="size-4 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={paths[icon]} />
    </svg>
  )
}
