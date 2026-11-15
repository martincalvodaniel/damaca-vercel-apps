"use client"

import { useCallback, useState } from "react"

export function MemberAvatar({
  alias,
  image,
  compact = false,
}: {
  alias: string
  image: string | null
  compact?: boolean
}) {
  const [brokenImage, setBrokenImage] = useState<string | null>(null)
  const onError = useCallback(() => setBrokenImage(image), [image])
  const initials = alias
    .trim()
    .split(/\s+/u)
    .slice(0, 2)
    .map((word) => Array.from(word)[0])
    .join("")
    .toLocaleUpperCase("es")
  return (
    <span
      className={
        compact ? "member-avatar member-avatar-compact" : "member-avatar"
      }
    >
      {image && image !== brokenImage ? (
        // biome-ignore lint/performance/noImgElement: Google avatars are small external images.
        <img
          src={image}
          width={24}
          height={24}
          alt=""
          referrerPolicy="no-referrer"
          onError={onError}
        />
      ) : (
        <span className="member-avatar-initials" aria-hidden="true">
          {initials || "?"}
        </span>
      )}
    </span>
  )
}
