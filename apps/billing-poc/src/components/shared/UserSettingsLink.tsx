import Image from "next/image"
import Link from "next/link"

interface UserSettingsLinkProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
  onNavigate?: () => void
  active?: boolean
}

export default function UserSettingsLink({
  user,
  onNavigate,
  active = false,
}: UserSettingsLinkProps) {
  return (
    <Link
      href="/settings"
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      aria-label={`Configuración de usuario: ${user.name ?? user.email ?? "Mi cuenta"}`}
      className="flex min-w-0 items-center gap-3 rounded-md p-2 hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:hover:bg-zinc-800 dark:focus:ring-offset-zinc-900"
    >
      {user.image ? (
        <Image
          src={user.image}
          alt=""
          width={32}
          height={32}
          className="h-8 w-8 rounded-full"
          referrerPolicy="no-referrer"
        />
      ) : null}
      <span className="min-w-0 text-left">
        <span className="block max-w-40 truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {user.name ?? "Mi cuenta"}
        </span>
        <span className="block max-w-40 truncate text-xs text-zinc-500 dark:text-zinc-400">
          {user.email}
        </span>
      </span>
    </Link>
  )
}
