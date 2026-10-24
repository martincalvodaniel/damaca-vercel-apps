"use client"

import { type DBSchema, type IDBPDatabase, openDB } from "idb"
import { appConfig } from "@/config/app"
import type { PochaGame } from "@/schemas/game"

interface LocalDatabase extends DBSchema {
  preferences: {
    key: string
    value: unknown
  }
  games: {
    key: string
    value: PochaGame
    indexes: { "by-updated-at": string; "by-status": string }
  }
}

let connection: Promise<IDBPDatabase<LocalDatabase>> | undefined

export function openLocalDatabase() {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(
      new Error("Local storage is unavailable in this browser.")
    )
  }
  if (!connection) {
    connection = new Promise<IDBPDatabase<LocalDatabase>>((resolve, reject) => {
      let blocked = false
      const request = openDB<LocalDatabase>(appConfig.storageName, 2, {
        upgrade(database, oldVersion) {
          if (oldVersion < 1) database.createObjectStore("preferences")
          if (oldVersion < 2) {
            const games = database.createObjectStore("games", { keyPath: "id" })
            games.createIndex("by-updated-at", "updatedAt")
            games.createIndex("by-status", "status")
          }
        },
        blocked() {
          blocked = true
          connection = undefined
          reject(
            new Error(
              "Close other app tabs and retry to upgrade local storage."
            )
          )
        },
        blocking() {
          void closeLocalDatabase()
        },
        terminated() {
          connection = undefined
        },
      })
      request.then((database) => {
        if (blocked) database.close()
        else resolve(database)
      }, reject)
    }).catch((error: unknown) => {
      connection = undefined
      throw error
    })
  }
  return connection
}

export async function closeLocalDatabase() {
  const current = connection
  connection = undefined
  if (current) (await current).close()
}
