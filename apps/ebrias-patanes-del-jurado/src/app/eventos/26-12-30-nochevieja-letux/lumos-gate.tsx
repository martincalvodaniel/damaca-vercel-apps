"use client"

import { useEffect, useRef, useState } from "react"
import styles from "./lumos-gate.module.css"

const storageKey = "letux-lumos-revealed"
const normalize = (value: string) =>
  value.toLocaleLowerCase("es").replace(/[^\p{L}\p{N}]/gu, "")

export function LumosGate({ children }: { children: React.ReactNode }) {
  const [revealed, setRevealed] = useState(false)
  const [listening, setListening] = useState(false)
  const [music, setMusic] = useState(false)
  const [casting, setCasting] = useState(false)
  const recognition = useRef<{ stop: () => void } | null>(null)
  const audio = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    try {
      setRevealed(localStorage.getItem(storageKey) === "true")
    } catch {
      /* Storage may be unavailable. */
    }
    return () => {
      recognition.current?.stop()
      audio.current?.pause()
    }
  }, [])

  const reveal = () => {
    recognition.current?.stop()
    setListening(false)
    setCasting(true)
    window.setTimeout(() => setRevealed(true), 1800)
    const player = audio.current ?? new Audio("/audio/letux-celesta.wav?v=5")
    audio.current = player
    player.loop = true
    player.volume = 0.05
    void player
      .play()
      .then(() => setMusic(true))
      .catch(() => setMusic(false))
    try {
      localStorage.setItem(storageKey, "true")
    } catch {
      /* The current visit can still continue. */
    }
  }

  const listen = () => {
    const Speech =
      (
        window as Window & {
          SpeechRecognition?: new () => SpeechRecognition
          webkitSpeechRecognition?: new () => SpeechRecognition
        }
      ).SpeechRecognition ??
      (
        window as Window & {
          webkitSpeechRecognition?: new () => SpeechRecognition
        }
      ).webkitSpeechRecognition
    if (!Speech) return
    const instance = new Speech()
    recognition.current = instance
    instance.lang = "es-ES"
    instance.continuous = false
    instance.interimResults = false
    instance.onstart = () => setListening(true)
    instance.onend = () => setListening(false)
    instance.onerror = () => setListening(false)
    instance.onresult = (event) => {
      const said = Array.from(event.results)
        .flatMap((result) => Array.from(result))
        .map((item) => normalize(item.transcript))
      if (said.includes("lumos")) reveal()
    }
    instance.start()
  }

  const toggleMusic = async () => {
    if (music) {
      audio.current?.pause()
      setMusic(false)
      return
    }
    const player = audio.current ?? new Audio("/audio/letux-celesta.wav?v=5")
    audio.current = player
    player.loop = true
    player.volume = 0.05
    try {
      await player.play()
      setMusic(true)
    } catch {
      setMusic(false)
    }
  }

  return (
    <>
      <div inert={!revealed} aria-hidden={!revealed}>
        {children}
      </div>
      {!revealed && (
        <section
          className={`${styles.gate} ${casting ? styles.casting : ""}`}
          aria-label="Hechizo para iluminar"
          aria-live="polite"
        >
          <div className={styles.mist} aria-hidden="true" />
          <div className={styles.storm} aria-hidden="true" />
          <div className={styles.light} aria-hidden="true" />
          <div className={styles.prompt}>
            <p>
              Recuerda: <strong>Lumos</strong> para iluminar
            </p>
            <button
              type="button"
              className={styles.mic}
              onClick={listen}
              disabled={listening}
              aria-label="Decir Lumos al micrófono"
            >
              🎙
            </button>
            <span>
              {listening ? "Escuchando…" : "Pulsa el micrófono y di Lumos"}
            </span>
            <button type="button" className={styles.mental} onClick={reveal}>
              Soy más de magia mental
            </button>
          </div>
        </section>
      )}
      {revealed ? (
        <button type="button" className={styles.music} onClick={toggleMusic}>
          {music ? "Pausar música" : "Activar música"}
        </button>
      ) : null}
    </>
  )
}

interface SpeechRecognition extends EventTarget {
  lang: string
  continuous: boolean
  interimResults: boolean
  onstart: (() => void) | null
  onend: (() => void) | null
  onerror: (() => void) | null
  onresult: ((event: { results: SpeechRecognitionResultList }) => void) | null
  start: () => void
  stop: () => void
}
