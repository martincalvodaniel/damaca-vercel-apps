import { getAuth } from "@/lib/auth/auth"

async function handler(request: Request) {
  return (await getAuth()).handler(request)
}

export { handler as GET, handler as POST }
