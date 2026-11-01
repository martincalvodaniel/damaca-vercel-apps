"use client"
import { useSWRConfig } from "swr"
import useSWRMutation from "swr/mutation"
import { runRequest } from "@/features/events/hooks/useEventMutations-runtime"
import {
  isPaymentKey,
  isPaymentsKey,
} from "@/features/payments/hooks/usePayments"
import type { CommissionFields } from "@/lib/domain/entities/commission"
import type { PaymentMethod } from "@/lib/domain/entities/payment"
import {
  type CommissionResource,
  useCommissionScope,
} from "../components/CommissionScope"
import { isCommissionByPaymentKey } from "./useCommissionByPayment"
import { isCommissionsKey } from "./useCommissions"

export interface CommissionMutationResponse {
  success: boolean
  id?: string
  paymentId?: string
  alreadyExists?: boolean
  paymentSync?: "unchanged" | "updated" | "invoiced"
}
export function buildCommissionRequest(
  method: "POST" | "PUT" | "DELETE",
  body: unknown,
  id?: string,
  resource: CommissionResource = "commissions"
) {
  return {
    url: id
      ? `/api/${resource}/${encodeURIComponent(id)}/payment`
      : `/api/${resource}`,
    method,
    body: JSON.stringify(body),
  }
}
export function isCommissionRelatedKey(key: unknown) {
  return (
    isCommissionsKey(key) ||
    isCommissionByPaymentKey(key) ||
    isPaymentsKey(key) ||
    isPaymentKey(key)
  )
}
type CommissionMutationInput =
  | CommissionFields
  | (Partial<CommissionFields> & { id: string })
  | { id: string }
  | { id: string; paymentMethod: PaymentMethod }
function useCommissionMutation<T extends CommissionMutationInput>(
  method: "POST" | "PUT" | "DELETE",
  payment = false
) {
  const { resource } = useCommissionScope()
  const { mutate } = useSWRConfig()
  const mutation = useSWRMutation<
    CommissionMutationResponse,
    Error,
    string,
    CommissionMutationInput
  >(
    payment ? `/api/${resource}/payment` : `/api/${resource}:${method}`,
    (_key, { arg }) => {
      if (payment) {
        const input = arg as { id: string; paymentMethod: PaymentMethod }
        return runRequest(
          buildCommissionRequest(
            "POST",
            { paymentMethod: input.paymentMethod },
            input.id,
            resource
          )
        )
      }
      return runRequest(
        buildCommissionRequest(method, arg, undefined, resource)
      )
    }
  )
  return {
    ...mutation,
    trigger: async (input: T) => {
      // Even a failed generation can leave a durable reservation or created payment.
      try {
        return await mutation.trigger(input)
      } finally {
        await mutate(isCommissionRelatedKey, undefined, { revalidate: true })
      }
    },
  }
}
export function useCreateCommission() {
  return useCommissionMutation<CommissionFields>("POST")
}
export function useUpdateCommission() {
  return useCommissionMutation<Partial<CommissionFields> & { id: string }>(
    "PUT"
  )
}
export function useDeleteCommission() {
  return useCommissionMutation<{ id: string }>("DELETE")
}
export function useGenerateCommissionPayment() {
  return useCommissionMutation<{ id: string; paymentMethod: PaymentMethod }>(
    "POST",
    true
  )
}
