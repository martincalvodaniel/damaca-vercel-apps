import "server-only"

export function getAuthEnv() {
  const {
    BETTER_AUTH_SECRET: secret,
    BETTER_AUTH_URL: explicitUrl,
    GOOGLE_CLIENT_ID: clientId,
    GOOGLE_CLIENT_SECRET: clientSecret,
    MONGODB_DB: mongoDatabase,
    MONGODB_URI: mongoUri,
    VERCEL_BRANCH_URL: branchHost,
  } = process.env

  if (!secret || !clientId || !clientSecret || !mongoUri) {
    throw new Error("Google, Better Auth, and MongoDB credentials are required")
  }

  return {
    baseURL:
      explicitUrl ||
      (branchHost ? `https://${branchHost}` : "http://localhost:3008"),
    secret,
    clientId,
    clientSecret,
    mongoUri,
    mongoDatabase: mongoDatabase?.trim() || "damaca-pocs",
  }
}
