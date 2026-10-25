export const navigationDestinations = [
  { id: "home", label: "Home", href: "/" },
  {
    id: "admin",
    label: "Site administration",
    href: "/admin",
    adminOnly: true,
  },
  { id: "settings", label: "Settings", href: "/settings" },
] as const
