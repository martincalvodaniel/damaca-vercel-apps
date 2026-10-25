export const navigationDestinations = [
  { id: "home", label: "Home", href: "/" },
  { id: "settings", label: "Settings", href: "/settings" },
  {
    id: "admin",
    label: "Site administration",
    href: "/admin",
    adminOnly: true,
  },
] as const
