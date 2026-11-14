const baseName = "damaca-secrets"

export const installName =
  process.env.VERCEL_GIT_COMMIT_REF === "int" ? `${baseName}-int` : baseName
