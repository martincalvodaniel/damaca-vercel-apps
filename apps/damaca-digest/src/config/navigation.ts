export const swipeDestinations = [
  { id: "home", label: "Library", href: "/" },
  { id: "topics", label: "Topics", href: "/topics" },
  { id: "settings", label: "Settings", href: "/settings" },
] as const

export const navigationDestinations = [
  { id: "capture", label: "Capture", href: "/share" },
  ...swipeDestinations,
] as const
