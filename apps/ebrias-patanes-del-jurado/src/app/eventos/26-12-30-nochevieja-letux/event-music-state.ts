type Listener = () => void

let player: HTMLAudioElement | null = null
let isPlaying = false
const listeners = new Set<Listener>()

function notify() {
  for (const listener of listeners) listener()
}

export function subscribeToEventMusic(listener: Listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getEventMusicState() {
  return isPlaying
}

export async function startEventMusic() {
  const audio = player ?? new Audio("/audio/letux-celesta.wav?v=5")
  player = audio
  audio.loop = true
  audio.volume = 0.05

  try {
    await audio.play()
    isPlaying = true
  } catch {
    isPlaying = false
  }
  notify()
}

export function toggleEventMusic() {
  if (isPlaying) {
    player?.pause()
    isPlaying = false
    notify()
    return
  }
  return startEventMusic()
}
