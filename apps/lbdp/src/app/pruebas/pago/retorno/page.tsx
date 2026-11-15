import Link from "next/link"
import { notFound } from "next/navigation"
import { connection } from "next/server"
import { getSandboxConfig } from "@/lib/redsys"

export default async function SandboxReturnPage() {
  await connection()
  if (!getSandboxConfig()) notFound()

  return (
    <section className="section-wrap listing-page">
      <h1>Sesión de pago finalizada</h1>
      <p className="page-lead">
        El resultado de la prueba se verifica en el servidor.
      </p>
      <Link className="button" href="/pruebas/pago/">
        Volver al producto de prueba
      </Link>
    </section>
  )
}
