import "server-only"

import { isIntegration } from "@/config/runtime"

export function getAuthEnvironment() {
  const {
    BETTER_AUTH_URL: baseURL,
    BETTER_AUTH_SECRET: secret,
    GOOGLE_CLIENT_ID: clientId,
    GOOGLE_CLIENT_SECRET: clientSecret,
    MONGODB_URI: mongoUri,
  } = process.env

  if (!baseURL || !secret || !clientId || !clientSecret || !mongoUri) {
    throw new Error("Authentication environment is incomplete")
  }

  return {
    baseURL,
    secret,
    clientId,
    clientSecret,
    mongoUri,
    databaseName:
      process.env.NODE_ENV === "development"
        ? "ebrias-patanes-del-jurado-local"
        : isIntegration
          ? "ebrias-patanes-del-jurado-int"
          : "ebrias-patanes-del-jurado",
  }
}
