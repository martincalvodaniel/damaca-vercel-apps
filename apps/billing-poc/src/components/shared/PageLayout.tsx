import NavigationBar from "./NavigationBar"

interface PageLayoutProps {
  navigationSubtitle: string
  children: React.ReactNode
  headerContent?: React.ReactNode
  navigationActions?: React.ReactNode
  headerInDesktopNavigation?: boolean
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
  headerInDesktopNavigation = false,
}: PageLayoutProps) {
  return (
    <div className="min-h-screen overflow-x-clip bg-zinc-50 p-2 font-sans dark:bg-zinc-950">
      <div
        className={
          headerInDesktopNavigation
            ? "contents xl:sticky xl:top-0 xl:z-30 xl:-mx-2 xl:-mt-2 xl:block xl:bg-zinc-50 xl:px-2 xl:pb-2 xl:pt-3 xl:dark:bg-zinc-950"
            : "contents"
        }
      >
        <div
          className={`sticky top-0 z-30 -mx-2 -mt-2 bg-zinc-50 px-2 py-2 sm:pt-3 dark:bg-zinc-950 ${headerInDesktopNavigation ? "xl:static xl:m-0 xl:p-0" : ""}`}
        >
          <div className="mx-auto max-w-6xl">
            <NavigationBar
              subtitle={navigationSubtitle}
              actions={navigationActions}
              hasDesktopHeader={headerInDesktopNavigation}
            />
          </div>
        </div>
        {headerInDesktopNavigation ? (
          <div className="mx-auto mb-2 max-w-6xl xl:mb-0 xl:[&>div]:rounded-t-none xl:[&>div]:border-t-0">
            {headerContent}
          </div>
        ) : null}
      </div>

      <main className="mx-auto max-w-6xl space-y-2 sm:pb-1">
        {!headerInDesktopNavigation ? headerContent : null}

        {children}
      </main>
    </div>
  )
}
