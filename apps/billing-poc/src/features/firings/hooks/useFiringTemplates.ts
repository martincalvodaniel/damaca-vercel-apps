"use client"
import useSWR, { useSWRConfig } from "swr"
import useSWRMutation from "swr/mutation"
import { runRequest } from "@/features/events/hooks/useEventMutations-runtime"
import { fetcher } from "@/lib/client/swr-fetcher"
import type {
  FiringTemplate,
  FiringTemplateFields,
} from "@/lib/domain/entities/firing-template"
export function buildFiringTemplatesKey() {
  return ["/api/firing-templates"] as const
}
export function buildFiringTemplatesUrl() {
  return "/api/firing-templates"
}
export function isFiringTemplatesKey(key: unknown): boolean {
  return (
    Array.isArray(key) &&
    key.length === 1 &&
    key[0] === buildFiringTemplatesUrl()
  )
}
export function buildFiringTemplateRequest(
  method: "POST" | "PUT" | "DELETE",
  body: unknown
) {
  return { url: buildFiringTemplatesUrl(), method, body: JSON.stringify(body) }
}
export function useFiringTemplates(enabled = true) {
  const { data, error, isLoading } = useSWR<{ templates: FiringTemplate[] }>(
    enabled ? buildFiringTemplatesKey() : null,
    () => fetcher(buildFiringTemplatesUrl())
  )
  return { templates: data?.templates ?? [], error, isLoading }
}
interface MutationResponse {
  success: boolean
  id?: string
}
type TemplateMutationInput =
  | FiringTemplateFields
  | (FiringTemplateFields & { id: string })
  | { id: string }
function useTemplateMutation<T extends TemplateMutationInput>(
  method: "POST" | "PUT" | "DELETE"
) {
  const { mutate } = useSWRConfig()
  const mutation = useSWRMutation<
    MutationResponse,
    Error,
    string,
    TemplateMutationInput
  >(`${buildFiringTemplatesUrl()}:${method}`, (_key, { arg }) =>
    runRequest(buildFiringTemplateRequest(method, arg))
  )
  return {
    ...mutation,
    trigger: async (input: T) => {
      const result = await mutation.trigger(input)
      await mutate(isFiringTemplatesKey, undefined, { revalidate: true })
      return result
    },
  }
}
export function useCreateFiringTemplate() {
  return useTemplateMutation<FiringTemplateFields>("POST")
}
export function useUpdateFiringTemplate() {
  return useTemplateMutation<FiringTemplateFields & { id: string }>("PUT")
}
export function useDeleteFiringTemplate() {
  return useTemplateMutation<{ id: string }>("DELETE")
}
