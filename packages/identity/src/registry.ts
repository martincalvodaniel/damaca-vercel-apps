import { z } from "zod"
import { appIdSchema } from "./contract"
import { validateServiceUrl } from "./hub-client"

export const oidcClientsSchema = z
  .array(
    z
      .object({
        appId: appIdSchema,
        clientId: z.string().min(8).max(128),
        clientSecret: z.string().min(32).max(256),
        redirectUri: z.url().refine((value) => {
          try {
            const url = new URL(value)
            validateServiceUrl(url.origin)
            return (
              url.pathname === "/api/auth/callback/damaca-hub" &&
              !url.search &&
              !url.hash &&
              !url.username &&
              !url.password
            )
          } catch {
            return false
          }
        }),
      })
      .strict()
  )
  .superRefine((clients, context) => {
    for (const key of ["clientId", "clientSecret", "redirectUri"] as const) {
      if (new Set(clients.map((client) => client[key])).size !== clients.length)
        context.addIssue({
          code: "custom",
          message: `Each ${key} must be unique`,
        })
    }
  })

export type OidcClient = z.infer<typeof oidcClientsSchema>[number]
