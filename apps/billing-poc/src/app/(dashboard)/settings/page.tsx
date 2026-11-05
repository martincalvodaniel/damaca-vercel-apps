import PageLayout from "@/components/shared/PageLayout"
import ThemeSettings from "@/features/settings/components/ThemeSettings"

export default function SettingsPage() {
  return (
    <PageLayout navigationSubtitle="Configuración">
      <ThemeSettings />
    </PageLayout>
  )
}
