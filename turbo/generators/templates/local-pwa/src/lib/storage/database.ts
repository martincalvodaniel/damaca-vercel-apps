"use client"

import { type DBSchema, type IDBPDatabase, openDB } from "idb"
import { appConfig } from "@/config/app"

interface LocalDatabase extends DBSchema {
  preferences: {
    key: string
    value: unknown
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
      const request = openDB<LocalDatabase>(appConfig.storageName, 1, {
        upgrade(database, oldVersion) {
          if (oldVersion < 1) database.createObjectStore("preferences")
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
