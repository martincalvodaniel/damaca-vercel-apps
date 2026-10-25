import "server-only"

interface SessionIdentity {
  user: { id: string; email: string; emailVerified: boolean }
  session: { userId: string; expiresAt: Date }
}

export function authorizePersistedSession<T extends SessionIdentity>(
  session: T | null,
  now: Date = new Date()
): T | null {
  if (!session) return null

  const expiresAt = session.session.expiresAt.getTime()
  if (
    !session.user.id.trim() ||
    session.session.userId !== session.user.id ||
    !session.user.emailVerified ||
    !Number.isFinite(expiresAt) ||
    expiresAt <= now.getTime()
  ) {
    return null
  }

  return session
}
