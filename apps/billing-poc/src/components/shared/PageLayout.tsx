import NavigationBar from "./NavigationBar"

interface PageLayoutProps {
  navigationSubtitle: string
  children: React.ReactNode
  headerContent?: React.ReactNode
  navigationActions?: React.ReactNode
}

/**
 * Shared layout component for all main pages.
 * Enforces consistent structure: outer container, main wrapper, navigation.
 * Use headerContent prop for page-specific content between nav and main content.
 */
export default function PageLayout({
  navigationSubtitle,
  children,
  headerContent,
  navigationActions,
}: PageLayoutProps) {
  return (
    <div className="min-h-screen overflow-x-clip bg-zinc-50 p-2 font-sans dark:bg-zinc-950">
      <div className="sticky top-0 z-30 -mx-2 -mt-2 bg-zinc-50 px-2 py-2 sm:pt-3 dark:bg-zinc-950">
        <div className="mx-auto max-w-6xl">
          <NavigationBar
            subtitle={navigationSubtitle}
            actions={navigationActions}
          />
        </div>
      </div>

      <main className="mx-auto max-w-6xl space-y-2 sm:pb-1">
        {headerContent}

        {children}
      </main>
    </div>
  )
}
