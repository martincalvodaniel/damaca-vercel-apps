import Image from "next/image"

const applicationIconIds = new Set([
  "billing-poc",
  "dalis-home-management",
  "dalis-tasks-events",
  "pocha-score",
  "card-wars",
])

export function ApplicationIcon({ appId }: { appId: string }) {
  const source = applicationIconIds.has(appId)
    ? `/app-icons/${appId}.svg`
    : "/icon.svg"

  return (
    <Image
      src={source}
      alt=""
      width={48}
      height={48}
      unoptimized
      className="size-12 shrink-0 rounded-xl"
    />
  )
}
