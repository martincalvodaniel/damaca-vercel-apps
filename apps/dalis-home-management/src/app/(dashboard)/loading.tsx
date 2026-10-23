export default function DashboardLoading() {
  return (
    <main
      className="min-h-screen bg-[#f5f4ee] px-4 py-5 text-[#17352b] sm:px-8 sm:py-8 dark:bg-[#10221c] dark:text-[#f4f1e7]"
      aria-busy="true"
    >
      <p className="sr-only" role="status">
        Cargando Dali…
      </p>
      <div className="mx-auto w-full max-w-7xl animate-pulse motion-reduce:animate-none">
        <header className="border-b border-[#d9ded3] pb-6 dark:border-white/10">
          <div className="h-4 w-16 rounded-full bg-[#dce1d9] dark:bg-white/10" />
          <div className="mt-7 h-3 w-28 rounded-full bg-[#ead5ca] dark:bg-[#51372c]" />
          <div className="mt-3 h-11 w-64 max-w-full rounded-xl bg-[#d5dcd5] dark:bg-white/10 sm:w-80" />
          <div className="mt-4 h-4 w-full max-w-xl rounded-full bg-[#e0e4dd] dark:bg-white/10" />
        </header>

        <div className="grid gap-4 py-7 sm:grid-cols-2 lg:grid-cols-3 lg:py-10">
          <div className="h-52 rounded-2xl border border-[#dde1d8] bg-white/60 dark:border-white/10 dark:bg-white/5" />
          <div className="h-52 rounded-2xl border border-[#dde1d8] bg-white/60 dark:border-white/10 dark:bg-white/5" />
          <div className="h-52 rounded-2xl border border-[#dde1d8] bg-white/60 sm:col-span-2 lg:col-span-1 dark:border-white/10 dark:bg-white/5" />
        </div>
      </div>
    </main>
  )
}
