import type {
  FiringTemplate,
  FiringTemplateFields,
} from "../entities/firing-template"
export interface FiringTemplateRepository {
  findAll(): Promise<FiringTemplate[]>
  create(data: Omit<FiringTemplate, "_id">): Promise<string>
  update(id: string, data: FiringTemplateFields): Promise<boolean>
  delete(id: string): Promise<boolean>
}
