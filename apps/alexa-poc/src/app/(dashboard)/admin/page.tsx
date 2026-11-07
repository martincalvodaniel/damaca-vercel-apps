import { AdminScreen } from "@/features/admin/components/admin-screen"

interface AdminPageProps {
  searchParams: Promise<{
    after?: string | string[]
    requestsAfter?: string | string[]
  }>
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  return <AdminScreen query={await searchParams} />
}
