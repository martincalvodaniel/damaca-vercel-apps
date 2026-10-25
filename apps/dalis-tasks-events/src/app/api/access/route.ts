import { identity } from "@/lib/auth/auth"

export async function GET() {
  return identity.accessResponse()
}
