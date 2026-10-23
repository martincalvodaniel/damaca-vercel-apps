export const primaryNavigationItems = [
  {
    href: "/",
    label: "Compra",
    paths: ["/", "/shopping-list"],
    iconPath:
      "M3 4h2l2.1 10.1a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L20 8H6m4 11.5h.01m6.99 0h.01",
  },
  {
    href: "/inventory",
    label: "Inventario",
    paths: ["/inventory"],
    iconPath: "M4 7.5h16v12H4v-12Zm2-3h12l2 3H4l2-3Zm3 7h6",
  },
  {
    href: "/meal-plan",
    label: "Menú",
    paths: ["/meal-plan"],
    iconPath:
      "M6.5 3.5v3m11-3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm3 8h3v3H8v-3Z",
  },
  {
    href: "/meals",
    label: "Platos",
    paths: ["/meals"],
    iconPath: "M4 13a8 8 0 0 1 16 0H4Zm-1 0h18M12 5V3.5M6 17h12",
  },
] as const
