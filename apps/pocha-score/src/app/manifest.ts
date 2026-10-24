import type { MetadataRoute } from "next"
import { appConfig } from "@/config/app"

export const dynamic = "force-static"

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: appConfig.name,
    short_name: appConfig.shortName,
    description: appConfig.description,
    lang: "es",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#fafafa",
    theme_color: "#047857",
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
