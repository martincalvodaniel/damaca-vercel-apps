export const isIntegration = process.env.VERCEL_GIT_COMMIT_REF === "int"
export const installName = isIntegration ? "ebrias-int" : "ebrias"
