import { HubAccount } from "@damaca/identity/account"
import { redirect } from "next/navigation"
import { getIdentityConfiguration } from "@/config/identity"
import { getIdentity } from "@/lib/auth/identity"

// biome-ignore lint/style/useComponentExportOnlyModules: Next.js route configuration belongs beside its component.
export const dynamic = "force-dynamic"

export default async function AccessPage() {
  const identity = getIdentity()
  const decision = await identity.getAccess()
  if (decision === "signed-out") redirect("/auth/signin")
  if (decision === "approved") redirect("/")
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 p-4">
      <h1 className="text-2xl font-bold">Acceso pendiente</h1>
      <p>
        {decision === "refresh-required"
          ? "Tu sesión necesita renovarse. Reintenta con conexión o cierra sesión y vuelve a entrar."
          : decision === "unavailable"
            ? "Damaca Hub no está disponible. No se puede comprobar tu permiso."
            : "Necesitas un permiso vigente para esta aplicación. Abre Damaca Hub para solicitarlo o consultar su estado."}
      </p>
      <p>Tus partidas locales se conservan en este dispositivo.</p>
      <a className="inline-flex min-h-11 items-center underline" href="/">
        Volver a comprobar
      </a>
      <HubAccount hubUrl={getIdentityConfiguration().hubUrl} />
    </main>
  )
}
