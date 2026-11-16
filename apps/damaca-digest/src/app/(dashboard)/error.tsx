"use client"

export default function DashboardError({ retry }: { retry: () => void }) {
  return (
    <section className="digest-panel mx-auto mt-4 max-w-3xl space-y-3 rounded-xl p-4 sm:mt-6 sm:p-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        This page could not load
      </h1>
      <button
        type="button"
        onClick={retry}
        className="min-h-11 rounded-lg bg-teal-800 px-3 text-sm font-semibold text-white hover:bg-teal-900"
      >
        Try again
      </button>
    </section>
  )
}
