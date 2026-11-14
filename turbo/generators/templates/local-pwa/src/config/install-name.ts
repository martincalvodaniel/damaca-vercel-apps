const baseName = "@@APP_SLUG@@"

export const installName =
  process.env.VERCEL_GIT_COMMIT_REF === "int" ? `${baseName}-int` : baseName
