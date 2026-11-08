import "server-only"

import { getDatabaseConnection } from "@/lib/database"
import { aliases, memberCollection } from "./directory"

export async function deleteMember(memberId: string) {
  const { client, db } = getDatabaseConnection()
  const collections = await db.listCollections({}, { nameOnly: true }).toArray()

  return client.withSession((session) =>
    session.withTransaction(async () => {
      const member = await memberCollection().findOneAndDelete(
        { _id: memberId },
        { session }
      )
      if (!member) return false

      const admissions = db.collection<{ _id: string }>("admitted-emails")
      const linked = await admissions.find({ memberId }, { session }).toArray()
      const emails = [
        ...new Set([
          ...linked.map(({ _id }) => _id),
          ...(member.email ? [member.email] : []),
        ]),
      ]
      const users = await db
        .collection("user")
        .find({ email: { $in: emails } }, { session })
        .toArray()
      const userIds = users.map(({ _id }) => _id)

      for (const { name } of collections) {
        if (/^\d{6}-(attendees|attendance)$/u.test(name)) {
          await db.collection<{ _id: string }>(name).deleteMany(
            {
              $or: [
                { memberId },
                { _id: { $in: [memberId, `member:${memberId}`] } },
              ],
            },
            { session }
          )
        }
      }

      for (const { name } of collections) {
        if (/^\d{6}-car-assignments$/u.test(name)) {
          await db
            .collection<{ _id: string }>(name)
            .deleteMany(
              { _id: { $in: [memberId, `member:${memberId}`] } },
              { session }
            )
        }
      }

      const eventPrefixes = new Set(
        collections.flatMap(({ name }) =>
          /^\d{6}-costume-(choices|owners)$/u.test(name)
            ? [name.slice(0, 6)]
            : []
        )
      )
      for (const event of eventPrefixes) {
        const owners = db.collection<{ _id: string; ownerId: string }>(
          `${event}-costume-owners`
        )
        const owner = await owners.findOneAndDelete(
          { _id: memberId },
          { session }
        )
        const ids = [...userIds.map(String), ...(owner ? [owner.ownerId] : [])]
        await db
          .collection<{ _id: string }>(`${event}-costume-choices`)
          .deleteMany({ _id: { $in: ids } }, { session })
      }

      await admissions.deleteMany(
        { $or: [{ memberId }, { _id: { $in: emails } }] },
        { session }
      )
      await aliases().deleteMany({ _id: { $in: emails } }, { session })
      await db
        .collection("admission-push-devices")
        .deleteMany({ email: { $in: emails } }, { session })
      await db
        .collection("session")
        .deleteMany(
          { userId: { $in: [...userIds, ...userIds.map(String)] } },
          { session }
        )
      await db
        .collection("account")
        .deleteMany(
          { userId: { $in: [...userIds, ...userIds.map(String)] } },
          { session }
        )
      await db
        .collection("user")
        .deleteMany({ _id: { $in: userIds } }, { session })
      await db
        .collection("verification")
        .deleteMany({ identifier: { $in: emails } }, { session })
      return true
    })
  )
}
