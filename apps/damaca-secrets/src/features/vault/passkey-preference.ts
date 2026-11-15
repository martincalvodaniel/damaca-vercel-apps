"use client"

function storageKey(ownerId: string) {
  return `damaca-secrets:passkey:${ownerId}`
}

export function getRememberedPasskey(ownerId: string) {
  try {
    return localStorage.getItem(storageKey(ownerId))
  } catch {
    return null
  }
}

export function rememberPasskey(ownerId: string, credentialId: string) {
  try {
    localStorage.setItem(storageKey(ownerId), credentialId)
  } catch {
    // Passkey unlock remains available when the browser blocks local storage.
  }
}
