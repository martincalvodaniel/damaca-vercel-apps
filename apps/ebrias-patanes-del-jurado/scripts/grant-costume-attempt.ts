import { grantFinalAttempt } from "../src/features/costumes/reservations"
import { getDatabaseConnection } from "../src/lib/database"

const email = process.argv[2]?.trim().toLowerCase()
if (!email?.includes("@") || process.argv.length !== 3) {
  throw new Error("Pass exactly one participant email address")
}

const { client, db } = getDatabaseConnection()
try {
  const user = await db
    .collection("user")
    .findOne({ email, emailVerified: true }, { projection: { _id: 1 } })
  if (!user || !(await grantFinalAttempt(String(user._id)))) {
    throw new Error(
      "No eligible account found, or the extra attempt was already granted"
    )
  }
  console.info("Final attempt granted")
} finally {
  await client.close()
}
