import type { MetadataRoute } from "next"

export const dynamic = "force-static"

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Dali — Nuestro hogar, más fácil",
    short_name: "Dali",
    description: "Utilidades para organizar y gestionar el hogar.",
    lang: "es",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#fafafa",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  }
}
