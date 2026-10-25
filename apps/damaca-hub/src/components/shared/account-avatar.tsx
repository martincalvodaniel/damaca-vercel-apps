"use client"

import Image from "next/image"
import { useState } from "react"

interface AccountAvatarProps {
  name: string
  email: string
  image?: string | null
}

export function AccountAvatar({ name, email, image }: AccountAvatarProps) {
  const [failedImage, setFailedImage] = useState<string | null>(null)
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
        onError={() => setFailedImage(image)}
        className="size-8 shrink-0 rounded-full object-cover"
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
      className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
    >
      {initials}
    </span>
  )
}
