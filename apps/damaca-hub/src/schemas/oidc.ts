import { z } from "zod"

export const oidcEnvironmentSchema = z.enum(["production", "int"])
export const oidcRedirectUriSchema = z
  .url()
  .max(2048)
  .refine((value) => {
    try {
      const url = new URL(value)
      const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)
      return (
        (url.protocol === "https:" || (local && url.protocol === "http:")) &&
        !url.hostname.includes("*") &&
        !url.username &&
        !url.password &&
        !url.search &&
        !url.hash &&
        url.pathname === "/api/auth/callback/damaca-hub"
      )
    } catch {
      return false
    }
  })

export const oidcClientMutationSchema = z
  .object({
    appId: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u),
    environment: oidcEnvironmentSchema,
    operation: z.enum(["create", "update", "enable", "disable", "rotate"]),
    clientId: z.union([z.literal(""), z.string().min(8).max(128)]).optional(),
    redirectUri: z.string().optional(),
    revision: z.coerce.number().int().min(0),
  })
  .strict()
  .superRefine((value, context) => {
    if (value.operation === "create" || value.operation === "update") {
      if (!oidcRedirectUriSchema.safeParse(value.redirectUri).success)
        context.addIssue({
          code: "custom",
          path: ["redirectUri"],
          message: "Enter a valid exact OIDC callback URL.",
        })
    }
    if (value.operation !== "create" && !value.clientId)
      context.addIssue({
        code: "custom",
        path: ["clientId"],
        message: "A client identifier is required.",
      })
  })

export interface OidcActionState {
  status: "idle" | "success" | "error"
  message: string
  clientSecret?: string
}
