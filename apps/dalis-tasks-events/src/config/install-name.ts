export const installName =
  process.env.VERCEL_GIT_COMMIT_REF === "int"
    ? "dalis-tasks-int"
    : "dalis-tasks"
