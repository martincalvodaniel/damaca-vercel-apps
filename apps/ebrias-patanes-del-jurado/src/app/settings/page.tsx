import { redirect } from "next/navigation"
import { AccountControl } from "@/features/landing/account-control"
import { AdmissionForm } from "@/features/settings/admission-form"
import { getAuthorizedUser } from "@/lib/session"

export default async function Settings() {
  const user = await getAuthorizedUser()
  if (!user) redirect("/")

  return (
    <main className="settings">
      <h1>Ajustes</h1>
      <section className="settings-card">
        <h2>Tu cuenta de Google</h2>
        <p>{user.name}</p>
        <p>{user.email}</p>
        <AccountControl signedIn />
      </section>
      {user.role === "admin" && (
        <section className="settings-card">
          <h2>Admisión</h2>
          <p>
            Autoriza el correo antes de que la persona entre por primera vez.
          </p>
          <AdmissionForm />
        </section>
      )}
    </main>
  )
}
