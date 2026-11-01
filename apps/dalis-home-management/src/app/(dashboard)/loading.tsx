export default function DashboardLoading() {
  return (
    <main
      className="min-h-screen bg-canvas px-4 py-5 text-ink sm:px-8 sm:py-8"
      aria-busy="true"
    >
      <p className="sr-only" role="status">
        Cargando Dali…
      </p>
      <div className="mx-auto w-full max-w-7xl animate-pulse motion-reduce:animate-none">
        <header className="border-b border-border pb-6">
          <div className="h-4 w-16 rounded-full bg-surface" />
          <div className="mt-7 h-3 w-28 rounded-full bg-surface-raised" />
          <div className="mt-3 h-11 w-64 max-w-full rounded-xl bg-surface sm:w-80" />
          <div className="mt-4 h-4 w-full max-w-xl rounded-full bg-surface" />
        </header>

        <div className="grid gap-4 py-7 sm:grid-cols-2 lg:grid-cols-3 lg:py-10">
          <div className="h-52 rounded-2xl border border-border bg-field" />
          <div className="h-52 rounded-2xl border border-border bg-field" />
          <div className="h-52 rounded-2xl border border-border bg-field sm:col-span-2 lg:col-span-1" />
        </div>
      </div>
    </main>
  )
}
