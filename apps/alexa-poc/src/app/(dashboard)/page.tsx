import { RemindersScreen } from "@/features/reminders/components/reminders-screen"

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const { error } = await searchParams
  return <RemindersScreen invalidReminder={error === "invalid-reminder"} />
}
