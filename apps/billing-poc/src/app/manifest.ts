import type { MetadataRoute } from "next"
import { installName } from "@/config/install-name"

export const dynamic = "force-static"

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: installName,
    short_name: installName,
    description: "Aplicación de facturación",
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
