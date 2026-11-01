import type { Client } from "../entities/client"
import type { Commission } from "../entities/commission"
import type { Payment } from "../entities/payment"
import type { ClientRepository } from "../ports/client-repository"
import type { CommissionRepository } from "../ports/commission-repository"
import type { PaymentRepository } from "../ports/payment-repository"

export interface ClientActivity {
  client: Client
  payments: Payment[]
  commissions: Commission[]
  firings: Commission[]
}

export async function loadClientActivity(
  id: string,
  repositories: {
    clients: Pick<ClientRepository, "findById">
    payments: Pick<PaymentRepository, "findAll">
    commissions: Pick<CommissionRepository, "findAll">
    firings: Pick<CommissionRepository, "findAll">
  }
): Promise<ClientActivity | null> {
  const client = await repositories.clients.findById(id)
  if (!client) return null
  const [payments, commissions, firings] = await Promise.all([
    repositories.payments.findAll({ clientId: id }),
    repositories.commissions.findAll(id),
    repositories.firings.findAll(id),
  ])
  return { client, payments, commissions, firings }
}
