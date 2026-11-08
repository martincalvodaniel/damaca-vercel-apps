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
        <div className="account-profile">
          {user.image ? (
            // biome-ignore lint/performance/noImgElement: The avatar is a small, external Google profile image.
            <img
              className="account-avatar"
              src={user.image}
              width={64}
              height={64}
              alt=""
              referrerPolicy="no-referrer"
            />
          ) : null}
          <div>
            <p>{user.name}</p>
            <p>{user.email}</p>
          </div>
        </div>
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
