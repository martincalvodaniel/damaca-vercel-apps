"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { EventMusicControl } from "./event-music"
import { startEventMusic } from "./event-music-state"
import styles from "./lumos-gate.module.css"

const storageKey = "letux-lumos-revealed"
const normalize = (value: string) =>
  value.toLocaleLowerCase("es").replace(/[^\p{L}\p{N}]/gu, "")

export function LumosGate({ children }: { children: React.ReactNode }) {
  const [revealed, setRevealed] = useState(false)
  const [listening, setListening] = useState(false)
  const [casting, setCasting] = useState(false)
  const recognition = useRef<{ stop: () => void } | null>(null)

  useEffect(() => {
    try {
      setRevealed(localStorage.getItem(storageKey) === "true")
    } catch {
      /* Storage may be unavailable. */
    }
    return () => {
      recognition.current?.stop()
    }
  }, [])

  const reveal = useCallback(() => {
    recognition.current?.stop()
    setListening(false)
    setCasting(true)
    window.setTimeout(() => setRevealed(true), 1800)
    void startEventMusic()
    try {
      localStorage.setItem(storageKey, "true")
    } catch {
      /* The current visit can still continue. */
    }
  }, [])

  const listen = useCallback(() => {
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
  }, [reveal])

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
          <LightningStorm active={!casting} />
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
      {revealed ? <EventMusicControl /> : null}
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

function LightningStorm({ active }: { active: boolean }) {
  const storm = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const layer = storm.current
    if (!layer || !active) return

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
    let timer: number

    function strike() {
      if (!layer) return
      layer.replaceChildren()
      if (!reducedMotion.matches) {
        const count =
          Math.random() < 0.55 ? 1 : 2 + Math.floor(Math.random() * 3)
        for (let index = 0; index < count; index++) {
          const bolt = document.createElement("span")
          bolt.className = styles.bolt
          const position = `${8 + Math.random() * 84}%`
          const edge = Math.floor(Math.random() * 4)
          const anchors = [
            { left: position, top: "0", rotate: "0deg" },
            { left: "100%", top: position, rotate: "90deg" },
            { left: position, top: "100%", rotate: "180deg" },
            { left: "0", top: position, rotate: "-90deg" },
          ]
          Object.assign(bolt.style, anchors[edge])
          bolt.style.height = `${28 + Math.random() * 28}%`
          bolt.style.filter =
            Math.random() < 0.5 ? "none" : "hue-rotate(216deg)"
          bolt.style.scale = Math.random() < 0.5 ? "-1 1" : "1 1"
          bolt.style.animationDelay = `${Math.random() < 0.5 ? 0 : Math.random() * 240}ms`
          layer.append(bolt)
        }
      }
      timer = window.setTimeout(strike, 1000 + Math.random() * 1500)
    }

    timer = window.setTimeout(strike, 350)
    return () => {
      window.clearTimeout(timer)
      layer.replaceChildren()
    }
  }, [active])

  return <div ref={storm} className={styles.storm} aria-hidden="true" />
}
