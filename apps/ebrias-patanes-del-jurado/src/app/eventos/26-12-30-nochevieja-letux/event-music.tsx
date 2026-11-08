"use client"

import { useSyncExternalStore } from "react"
import styles from "./event-music.module.css"
import {
  getEventMusicState,
  subscribeToEventMusic,
  toggleEventMusic,
} from "./event-music-state"

export function EventMusicControl({ visible = true }: { visible?: boolean }) {
  const music = useSyncExternalStore(
    subscribeToEventMusic,
    getEventMusicState,
    () => false
  )

  if (!visible) return null

  const label = music ? "Pausar música" : "Activar música"

  return (
    <button
      type="button"
      className={styles.music}
      onClick={toggleEventMusic}
      aria-label={label}
      aria-pressed={music}
      title={label}
    >
      <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M9 18V5l12-2v13"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="6" cy="18" r="2.7" fill="currentColor" />
        <circle cx="18" cy="16" r="2.7" fill="currentColor" />
        {!music && (
          <path
            className={styles.muteSlash}
            d="M4 4 20 20"
            strokeLinecap="round"
          />
        )}
      </svg>
    </button>
  )
}
