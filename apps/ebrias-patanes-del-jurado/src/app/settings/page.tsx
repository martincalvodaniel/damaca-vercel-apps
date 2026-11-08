import { redirect } from "next/navigation"
import { AccountControl } from "@/features/landing/account-control"
import {
  getDisplayAlias,
  getMemberDirectory,
} from "@/features/members/directory"
import { AdmissionForm } from "@/features/settings/admission-form"
import { AliasForm } from "@/features/settings/alias-form"
import { DeleteAdmissionForm } from "@/features/settings/delete-admission-form"
import { EmailChangeForm } from "@/features/settings/email-change-form"
import { listPendingAdmissions, normalizeEmail } from "@/lib/admission"
import { getAuthorizedUser } from "@/lib/session"

export default async function Settings() {
  const user = await getAuthorizedUser()
  if (!user) redirect("/")

  const isAdmin = user.role === "admin"
  const [alias, requests, members] = await Promise.all([
    getDisplayAlias(normalizeEmail(user.email), user.name),
    isAdmin ? listPendingAdmissions() : [],
    isAdmin ? getMemberDirectory() : [],
  ])
  const available = members.flatMap(({ id, alias, email }) =>
    email ? [] : [{ id, alias }]
  )

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
            <p>{alias}</p>
            <p>{user.email}</p>
          </div>
        </div>
        <AliasForm key={alias} alias={alias}>
          <AccountControl signedIn />
        </AliasForm>
      </section>
      {isAdmin ? (
        <>
          <section className="settings-card">
            <h2>Solicitudes de acceso ({requests.length})</h2>
            {requests.length === 0 ? (
              <p>No hay solicitudes pendientes.</p>
            ) : (
              <ul className="management-list">
                {requests.map(({ _id, name }) => (
                  <li key={_id}>
                    <AdmissionForm
                      members={available}
                      request={{ email: _id, name }}
                    />
                    <EmailChangeForm email={_id} members={members} />
                    <DeleteAdmissionForm email={_id} />
                  </li>
                ))}
              </ul>
            )}
            <details>
              <summary>Autorizar o asociar un correo manualmente</summary>
              <AdmissionForm members={available} />
            </details>
          </section>
          <section className="settings-card">
            <h2>Miembros ({members.length})</h2>
            <ul className="management-list">
              {members.map(({ id, alias, email }) => (
                <li key={id}>
                  <strong>{alias}</strong> · {email ?? "Sin correo asociado"}
                  <details>
                    <summary>Editar alias</summary>
                    <AliasForm key={alias} alias={alias} memberId={id} />
                  </details>
                </li>
              ))}
            </ul>
          </section>
        </>
      ) : null}
    </main>
  )
}
