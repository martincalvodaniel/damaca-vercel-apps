import Link from "next/link"

export default function ArticleNotFound() {
  return (
    <section className="digest-panel mx-auto mt-4 max-w-3xl space-y-3 rounded-xl p-4 sm:mt-6 sm:p-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        Article not found
      </h1>
      <Link
        href="/"
        className="inline-flex min-h-11 items-center font-medium underline underline-offset-4"
      >
        Back to library
      </Link>
    </section>
  )
}
