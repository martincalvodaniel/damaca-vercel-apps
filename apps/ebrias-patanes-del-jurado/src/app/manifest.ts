import type { MetadataRoute } from "next"
import { installName } from "@/config/runtime"

export const dynamic = "force-static"

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: installName,
    short_name: installName,
    lang: "es",
    start_url: "/",
    scope: "/",
    display: "standalone",
    theme_color: "#73caff",
    background_color: "#73caff",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  }
}
