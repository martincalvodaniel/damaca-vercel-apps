import { notFound } from "next/navigation"
import { connection } from "next/server"
import { getSandboxConfig } from "@/lib/redsys"

export default async function SandboxPaymentPage() {
  await connection()
  if (!getSandboxConfig()) notFound()

  return (
    <section className="section-wrap listing-page">
      <h1>Producto de prueba</h1>
      <p className="page-lead">1,00 €</p>
      <p>
        Usa una tarjeta de prueba de Redsys. No se realizará ningún cargo real.
      </p>
      <form action="/pruebas/pago/iniciar/" method="post">
        <button className="button" type="submit">
          Pagar 1,00 €
        </button>
      </form>
    </section>
  )
}
