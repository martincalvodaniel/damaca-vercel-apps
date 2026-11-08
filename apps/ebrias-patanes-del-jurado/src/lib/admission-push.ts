import "server-only"

import webPush, { type PushSubscription } from "web-push"
import { getDatabaseConnection } from "./database"

export function pushDevices() {
  return getDatabaseConnection().db.collection<
    PushSubscription & { _id: string; email: string }
  >("admission-push-devices")
}

export async function notifyAdmission() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  const subject = process.env.VAPID_SUBJECT
  if (!publicKey || !privateKey || !subject) return
  const admins = (process.env.ALLOWED_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
  const devices = await pushDevices()
    .find({ email: { $in: admins } })
    .toArray()
  await Promise.allSettled(
    devices.map(async (device) => {
      try {
        await webPush.sendNotification(
          device,
          JSON.stringify({ body: "Hay una nueva solicitud de acceso." }),
          {
            vapidDetails: { subject, publicKey, privateKey },
            TTL: 3600,
            timeout: 4000,
          }
        )
      } catch (error) {
        if (
          error instanceof webPush.WebPushError &&
          [404, 410].includes(error.statusCode)
        ) {
          await pushDevices().deleteOne({
            _id: device._id,
            email: device.email,
          })
        }
      }
    })
  )
}
