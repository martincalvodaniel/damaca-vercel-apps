import { getDatabaseConnection } from "../src/lib/database"

const { client, db } = getDatabaseConnection()
const members = db.collection<{ _id: string; costumeOwnerId?: string }>(
  "members"
)
const guests = { _id: /^letux:/u, email: { $exists: false } }

try {
  console.log({
    database: db.databaseName,
    guests: await members.countDocuments(guests),
    legacyCostumeLinks: await members.countDocuments({
      costumeOwnerId: { $exists: true },
    }),
  })
  if (process.argv.includes("--apply")) {
    const deleted = await members.deleteMany(guests)
    const owners = db.collection<{ _id: string; ownerId: string }>(
      "261230-costume-owners"
    )
    for await (const member of members.find({
      costumeOwnerId: { $type: "string" },
    })) {
      if (member.costumeOwnerId) {
        await owners.updateOne(
          { _id: member._id },
          { $setOnInsert: { ownerId: member.costumeOwnerId } },
          { upsert: true }
        )
      }
    }
    const updated = await members.updateMany(
      { costumeOwnerId: { $exists: true } },
      { $unset: { costumeOwnerId: "" } }
    )
    console.log({
      deleted: deleted.deletedCount,
      cleared: updated.modifiedCount,
    })
  }
} finally {
  await client.close()
}
