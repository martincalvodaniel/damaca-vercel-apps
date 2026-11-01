export interface FiringTemplate {
  _id?: string
  name: string
  price: number
  createdAt: Date
  updatedAt: Date
}
export type FiringTemplateFields = Pick<FiringTemplate, "name" | "price">
export function buildFiringTemplateConcept(template: FiringTemplateFields) {
  return { name: template.name, amount: template.price, quantity: 1 }
}
