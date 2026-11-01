import "server-only"
import type {
  FiringTemplate,
  FiringTemplateFields,
} from "@/lib/domain/entities/firing-template"
import type { FiringTemplateRepository } from "@/lib/domain/ports/firing-template-repository"
import { getDatabase } from "../client"
import type { MongoFiringTemplate } from "../types"
import { isValidObjectId, MongoUpdateBuilder, toObjectId } from "./mongo-utils"

function toDomain(doc: MongoFiringTemplate): FiringTemplate {
  return { ...doc, _id: doc._id?.toString() }
}
export class MongoFiringTemplateRepository implements FiringTemplateRepository {
  private async collection() {
    return (await getDatabase()).collection<MongoFiringTemplate>(
      "firingTemplates"
    )
  }
  async findAll() {
    return (
      await (
        await this.collection()
      )
        .find({})
        .sort({ name: 1, _id: 1 })
        .toArray()
    ).map(toDomain)
  }
  async create(data: Omit<FiringTemplate, "_id">) {
    return (
      await (
        await this.collection()
      ).insertOne({
        name: data.name,
        price: data.price,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      })
    ).insertedId.toString()
  }
  async update(id: string, data: FiringTemplateFields) {
    if (!isValidObjectId(id)) return false
    const update = new MongoUpdateBuilder()
      .set("name", data.name)
      .set("price", data.price)
      .set("updatedAt", new Date())
      .build()
    return (
      (
        await (
          await this.collection()
        ).updateOne({ _id: toObjectId(id) }, update)
      ).matchedCount > 0
    )
  }
  async delete(id: string) {
    if (!isValidObjectId(id)) return false
    return (
      (await (await this.collection()).deleteOne({ _id: toObjectId(id) }))
        .deletedCount > 0
    )
  }
}
