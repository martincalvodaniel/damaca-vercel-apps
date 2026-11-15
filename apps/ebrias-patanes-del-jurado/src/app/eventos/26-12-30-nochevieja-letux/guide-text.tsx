import Markdown from "react-markdown"
import remarkBreaks from "remark-breaks"
import remarkGfm from "remark-gfm"
import styles from "./guide.module.css"

function safeLink(url: string) {
  try {
    const parsed = new URL(url)
    if (parsed.protocol === "http:" || parsed.protocol === "https:")
      return parsed.href
  } catch {
    return undefined
  }
}

export function GuideText({ text }: { text: string }) {
  if (!text) return null
  return (
    <div className={styles.copy}>
      <Markdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        skipHtml
        urlTransform={safeLink}
        components={{
          a: ({ href, children }) =>
            href ? (
              <a href={href} target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            ) : (
              <span>{children}</span>
            ),
          img: ({ alt }) => (alt ? <span>{alt}</span> : null),
          table: ({ children }) => (
            <div className={styles.tableScroll}>
              <table>{children}</table>
            </div>
          ),
        }}
      >
        {text}
      </Markdown>
    </div>
  )
}
