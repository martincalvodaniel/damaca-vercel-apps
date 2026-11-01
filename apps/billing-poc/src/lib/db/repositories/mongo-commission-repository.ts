import "server-only"
import { ObjectId } from "mongodb"
import {
  type Commission,
  type CommissionFields,
  type CommissionPaymentGeneration,
  sortCommissions,
} from "@/lib/domain/entities/commission"
import type { PaymentMethod } from "@/lib/domain/entities/payment"
import type { CommissionRepository } from "@/lib/domain/ports/commission-repository"
import { getDatabase } from "../client"
import type { MongoCommission } from "../types"
import {
  buildCommissionUpdate,
  commissionToDomain,
  commissionToMongo,
} from "./mongo-commission-repository-helpers"
import { isValidObjectId, toObjectId } from "./mongo-utils"

export class MongoCommissionRepository implements CommissionRepository {
  private async collection() {
    return (await getDatabase()).collection<MongoCommission>("commissions")
  }
  async findAll() {
    return sortCommissions(
      (await (await this.collection()).find({}).toArray()).map(
        commissionToDomain
      )
    )
  }
  async findById(id: string) {
    if (!isValidObjectId(id)) return null
    const doc = await (await this.collection()).findOne({ _id: toObjectId(id) })
    return doc ? commissionToDomain(doc) : null
  }
  async findByPaymentId(paymentId: string) {
    if (!isValidObjectId(paymentId)) return null
    const doc = await (await this.collection()).findOne({
      paymentId: toObjectId(paymentId),
    })
    return doc ? commissionToDomain(doc) : null
  }
  async create(data: Omit<Commission, "_id">) {
    return (
      await (await this.collection()).insertOne(commissionToMongo(data))
    ).insertedId.toString()
  }
  async update(id: string, fields: Partial<CommissionFields>) {
    if (!isValidObjectId(id)) return false
    const result = await (await this.collection()).updateOne(
      {
        _id: toObjectId(id),
        paymentGeneration: { $exists: false },
        ...(fields.concepts?.length === 0
          ? { paymentId: { $exists: false } }
          : {}),
      },
      buildCommissionUpdate(fields)
    )
    return result.matchedCount > 0
  }
  async delete(id: string) {
    if (!isValidObjectId(id)) return false
    return (
      (
        await (
          await this.collection()
        ).deleteOne({
          _id: toObjectId(id),
          paymentGeneration: { $exists: false },
        })
      ).deletedCount > 0
    )
  }
  async reservePayment(id: string, date: string, method: PaymentMethod) {
    if (!isValidObjectId(id)) return null
    const col = await this.collection()
    const doc = await col.findOneAndUpdate(
      {
        _id: toObjectId(id),
        paymentId: { $exists: false },
        paymentGeneration: { $exists: false },
        "concepts.0": { $exists: true },
      },
      {
        $set: {
          paymentGeneration: {
            paymentId: new ObjectId(),
            date,
            paymentMethod: method,
          },
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    )
    return doc ? commissionToDomain(doc) : this.findById(id)
  }
  async completePayment(id: string, generation: CommissionPaymentGeneration) {
    if (!isValidObjectId(id)) return false
    const paymentId = toObjectId(generation.paymentId)
    const result = await (await this.collection()).updateOne(
      {
        _id: toObjectId(id),
        $or: [{ "paymentGeneration.paymentId": paymentId }, { paymentId }],
      },
      {
        $set: { paymentId, updatedAt: new Date() },
        $unset: { paymentGeneration: "" },
      }
    )
    return result.matchedCount > 0
  }
  async unlinkPayment(paymentId: string) {
    if (!isValidObjectId(paymentId)) return
    const objectId = toObjectId(paymentId)
    await (await this.collection()).updateMany(
      {
        $or: [
          { paymentId: objectId },
          { "paymentGeneration.paymentId": objectId },
        ],
      },
      {
        $unset: { paymentId: "", paymentGeneration: "" },
        $set: { updatedAt: new Date() },
      }
    )
  }
}
