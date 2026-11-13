"use client"

import Image from "next/image"
import { useCallback, useState } from "react"

interface AccountAvatarProps {
  name: string
  email: string
  image?: string | null
  compact?: boolean
}

export function AccountAvatar({
  name,
  email,
  image,
  compact = false,
}: AccountAvatarProps) {
  const sizeClass = compact ? "size-5" : "size-8"
  const [failedImage, setFailedImage] = useState<string | null>(null)
  const handleError = useCallback(() => setFailedImage(image ?? null), [image])
  if (image && image !== failedImage) {
    return (
      <Image
        src={image}
        alt=""
        width={32}
        height={32}
        unoptimized
        referrerPolicy="no-referrer"
        draggable={false}
        onError={handleError}
        className={`${sizeClass} shrink-0 rounded-full object-cover`}
      />
    )
  }
  const initials = (name.trim() || email)
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
  return (
    <span
      aria-hidden="true"
      className={`${sizeClass} inline-flex shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200`}
    >
      {initials}
    </span>
  )
}
