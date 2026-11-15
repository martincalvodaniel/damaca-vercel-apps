import type { MetadataRoute } from "next"
import { installName } from "@/config/install-name"
import { defaultLocale } from "@/lib/i18n/locale"
import { messages } from "@/lib/i18n/messages"

export const dynamic = "force-static"

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: installName,
    short_name: installName,
    description: messages[defaultLocale].description,
    lang: defaultLocale,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#09090b",
    theme_color: "#047857",
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
