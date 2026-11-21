import type { ArticleCapture } from "@/schemas/article"

export function ArticleLinkList({
  title,
  links,
}: {
  title: string
  links: NonNullable<ArticleCapture["relatedLinks"]>
}) {
  if (!links.length) return null

  return (
    <section>
      <h2 className="text-base font-semibold">{title}</h2>
      <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
        {links.map((link) => (
          <li key={link.url}>
            <a
              className="flex min-h-11 flex-col justify-center break-all py-1 text-sm underline underline-offset-4"
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {link.title && link.title !== link.url ? (
                <>
                  <span className="break-words font-medium">{link.title}</span>
                  <span className="text-xs text-zinc-600 dark:text-zinc-400">
                    {link.url}
                  </span>
                </>
              ) : (
                link.url
              )}
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
