import "server-only"

import type { FiscalTask } from "@/lib/domain/entities/fiscal-task"
import type { FiscalTaskRepository } from "@/lib/domain/ports/fiscal-task-repository"
import { getDatabase } from "../client"
import type { MongoFiscalTask } from "../types"

function key(owner: string, id: string) {
  return JSON.stringify([owner, id])
}

function toDomain({
  _id,
  owner,
  revision,
  ...task
}: MongoFiscalTask): FiscalTask {
  return task
}

function toDocument(owner: string, task: FiscalTask): MongoFiscalTask {
  return {
    ...task,
    _id: key(owner, task.id),
    owner,
    revision: JSON.stringify(task),
  }
}

async function collection() {
  const db = await getDatabase()
  return db.collection<MongoFiscalTask>("fiscalTasks")
}

export class MongoFiscalTaskRepository implements FiscalTaskRepository {
  async list(owner: string, year: number) {
    const documents = await (await collection())
      .find({ owner, dueYear: year })
      .toArray()
    return documents.map(toDomain)
  }

  async incorporate(owner: string, task: FiscalTask) {
    const document = toDocument(owner, task)
    await (await collection()).updateOne(
      { _id: document._id },
      { $setOnInsert: document },
      { upsert: true }
    )
  }

  async create(owner: string, task: FiscalTask) {
    await (await collection()).insertOne(toDocument(owner, task))
  }

  async find(owner: string, id: string) {
    const document = await (await collection()).findOne({
      _id: key(owner, id),
      owner,
    })
    return document ? toDomain(document) : null
  }

  async replace(owner: string, previous: FiscalTask, task: FiscalTask) {
    const result = await (await collection()).replaceOne(
      { _id: key(owner, task.id), owner, revision: JSON.stringify(previous) },
      toDocument(owner, task)
    )
    return result.matchedCount === 1
  }

  async remove(owner: string, id: string) {
    const result = await (await collection()).deleteOne({
      _id: key(owner, id),
      owner,
    })
    return result.deletedCount === 1
  }
}
