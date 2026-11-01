import ClientDetail from "@/features/clients/components/ClientDetail"

export default async function ClientPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <ClientDetail key={id} id={id} />
}
