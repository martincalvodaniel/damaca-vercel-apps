import { getDatabaseConnection } from "../src/lib/database"

const { client, db } = getDatabaseConnection()
const members = db.collection<{ _id: string }>("members")
const legacy = { _id: /^letux:/u }

try {
  const apply = process.argv.includes("--apply")
  console.log({
    database: db.databaseName,
    apply,
    members: await members.countDocuments(legacy),
  })
  if (apply) {
    const collections = await db
      .listCollections({}, { nameOnly: true })
      .toArray()
    const eventCollections = collections.filter(({ name }) =>
      /^\d{6}-(attendees|attendance|car-assignments|costume-owners)$/u.test(
        name
      )
    )
    for await (const { _id: oldId } of members.find(legacy)) {
      const id = crypto.randomUUID()
      await client.withSession((session) =>
        session.withTransaction(async () => {
          const member = await members.findOne({ _id: oldId }, { session })
          if (!member) return
          await members.insertOne({ ...member, _id: id }, { session })
          await db
            .collection("admitted-emails")
            .updateMany(
              { memberId: oldId },
              { $set: { memberId: id } },
              { session }
            )
          for (const { name } of eventCollections) {
            const collection = db.collection<{ _id: string }>(name)
            if (name.endsWith("-attendees")) {
              await collection.updateMany(
                { memberId: oldId },
                { $set: { memberId: id } },
                { session }
              )
            }
            for (const [from, to] of [
              [oldId, id],
              [`member:${oldId}`, `member:${id}`],
            ]) {
              const record = await collection.findOne(
                { _id: from },
                { session }
              )
              if (!record) continue
              await collection.insertOne({ ...record, _id: to }, { session })
              await collection.deleteOne({ _id: from }, { session })
            }
          }
          await members.deleteOne({ _id: oldId }, { session })
        })
      )
    }
    console.log({ remaining: await members.countDocuments(legacy) })
  }
} finally {
  await client.close()
}
