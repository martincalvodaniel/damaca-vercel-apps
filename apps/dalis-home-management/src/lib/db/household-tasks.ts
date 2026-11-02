import "server-only"

import { MongoServerError } from "mongodb"
import { COLLECTION_NAMES, getCollection } from "@/lib/db/collections"
import type { HouseholdTaskCommand } from "@/schemas/household-task"
import type {
  HouseholdTask,
  HouseholdTaskOccurrence,
  HouseholdTasksData,
} from "@/types/household-task"

interface TaskDocument extends Omit<HouseholdTask, "id"> {
  _id: string
}
interface OccurrenceDocument extends Omit<HouseholdTaskOccurrence, "id"> {
  _id: string
}

export class HouseholdTaskConflict extends Error {}

export async function loadHouseholdTasks(): Promise<HouseholdTasksData> {
  const [tasks, occurrences] = await Promise.all([
    getCollection<TaskDocument>(COLLECTION_NAMES.householdTasks),
    getCollection<OccurrenceDocument>(
      COLLECTION_NAMES.householdTaskOccurrences
    ),
  ])
  const [taskDocuments, occurrenceDocuments] = await Promise.all([
    tasks
      .find({})
      .sort({ name: 1 })
      .collation({ locale: "es", strength: 1 })
      .toArray(),
    occurrences.find({}).sort({ date: 1 }).toArray(),
  ])
  const tasksById = new Map(taskDocuments.map((task) => [task._id, task]))
  return {
    tasks: taskDocuments.map(({ _id, name, intervalDays, archived }) => ({
      id: _id,
      name,
      intervalDays,
      archived,
    })),
    occurrences: occurrenceDocuments
      .filter((entry) => {
        const task = tasksById.get(entry.taskId)
        return task && (!task.archived || entry.completedDate)
      })
      .map(({ _id, ...entry }) => ({ id: _id, ...entry })),
  }
}

export async function mutateHouseholdTask(
  command: HouseholdTaskCommand
): Promise<void> {
  const [tasks, occurrences] = await Promise.all([
    getCollection<TaskDocument>(COLLECTION_NAMES.householdTasks),
    getCollection<OccurrenceDocument>(
      COLLECTION_NAMES.householdTaskOccurrences
    ),
  ])
  const changed = () =>
    new HouseholdTaskConflict(
      "El registro ha cambiado. Recarga la página y vuelve a intentarlo."
    )
  try {
    if (command.kind === "create") {
      if (await tasks.findOne({ _id: command.taskId })) return
      // Persist initial history first. A failed parent write can safely be retried
      // with the same IDs; reads ignore history without an existing parent.
      if (command.initialDate) {
        await occurrences.updateOne(
          { _id: command.taskId },
          {
            $setOnInsert: {
              taskId: command.taskId,
              date: command.initialDate,
              completedDate: command.initialDate,
              wasScheduled: false,
            },
          },
          { upsert: true }
        )
      }
      await tasks.updateOne(
        { _id: command.taskId },
        {
          $setOnInsert: {
            name: command.name,
            intervalDays: command.intervalDays,
            archived: false,
          },
        },
        { upsert: true }
      )
      return
    }
    const task = await tasks.findOne({ _id: command.taskId })
    if (!task) throw new HouseholdTaskConflict("No se ha encontrado la tarea.")
    const historicalChange =
      command.kind === "edit-execution" || command.kind === "delete-execution"
    if (
      task.archived &&
      command.kind !== "archive" &&
      command.kind !== "restore" &&
      !historicalChange
    ) {
      throw new HouseholdTaskConflict(
        "Esta tarea está archivada. Recarga la página."
      )
    }
    if (command.kind === "update") {
      const result = await tasks.updateOne(
        { _id: task._id, archived: false },
        { $set: { name: command.name, intervalDays: command.intervalDays } }
      )
      if (!result.matchedCount) throw changed()
      return
    }
    if (command.kind === "restore") {
      const result = await tasks.updateOne(
        { _id: task._id },
        { $set: { archived: false } }
      )
      if (!result.matchedCount) throw changed()
      return
    }
    if (command.kind === "archive") {
      // Publish the archive flag before cleanup so reads hide pending entries
      // even if cleanup fails. Retrying archive finishes that cleanup.
      await tasks.updateOne({ _id: task._id }, { $set: { archived: true } })
      await occurrences.deleteMany({
        taskId: task._id,
        completedDate: { $exists: false },
      })
      return
    }
    if (command.kind === "schedule" || command.kind === "record") {
      const date =
        command.kind === "schedule" ? command.date : command.completedDate
      const existing = await occurrences.findOne({ taskId: task._id, date })
      if (existing) {
        if (
          !(command.kind === "schedule" && !existing.completedDate) &&
          !(
            command.kind === "record" &&
            existing._id === command.occurrenceId &&
            existing.completedDate === date
          )
        ) {
          throw new HouseholdTaskConflict(
            "Esta tarea ya tiene un registro ese día. Selecciónalo en el calendario."
          )
        }
      } else {
        await occurrences.insertOne({
          _id: command.occurrenceId,
          taskId: task._id,
          date,
          wasScheduled: command.kind === "schedule",
          ...(command.kind === "record" ? { completedDate: date } : {}),
        })
      }
    } else {
      const entry = await occurrences.findOne({
        _id: command.occurrenceId,
        taskId: task._id,
      })
      if (!entry) {
        if (command.kind === "cancel" || command.kind === "delete-execution")
          return
        throw new HouseholdTaskConflict(
          "El registro ya no existe. Recarga la página."
        )
      }
      const pendingFilter = {
        _id: entry._id,
        taskId: task._id,
        completedDate: { $exists: false },
      }
      if (command.kind === "complete") {
        if (entry.completedDate !== command.completedDate) {
          if (entry.completedDate)
            throw new HouseholdTaskConflict(
              "La tarea ya está completada. Corrige su fecha desde el histórico."
            )
          const result = await occurrences.updateOne(pendingFilter, {
            $set: { completedDate: command.completedDate },
          })
          if (!result.matchedCount) {
            const latest = await occurrences.findOne({
              _id: entry._id,
              taskId: task._id,
            })
            if (latest?.completedDate !== command.completedDate) throw changed()
          }
        }
      } else if (command.kind === "cancel") {
        if (entry.completedDate)
          throw new HouseholdTaskConflict(
            "No puedes cancelar una ejecución. Usa el histórico."
          )
        const result = await occurrences.deleteOne(pendingFilter)
        if (
          !result.deletedCount &&
          (await occurrences.findOne({ _id: entry._id }))
        )
          throw changed()
      } else if (command.kind === "move") {
        if (entry.completedDate)
          throw new HouseholdTaskConflict(
            "No puedes mover una tarea completada."
          )
        if (entry.date !== command.date) {
          if (entry.date !== command.expectedDate) throw changed()
          const result = await occurrences.updateOne(
            { ...pendingFilter, date: command.expectedDate },
            { $set: { date: command.date } }
          )
          if (!result.matchedCount) throw changed()
        }
      } else {
        if (
          !(
            command.kind === "edit-execution" &&
            entry.completedDate === command.completedDate
          ) &&
          !(command.kind === "delete-execution" && !entry.completedDate)
        ) {
          if (entry.completedDate !== command.expectedCompletedDate)
            throw changed()
          const filter = {
            _id: entry._id,
            taskId: task._id,
            completedDate: command.expectedCompletedDate,
          }
          if (command.kind === "edit-execution") {
            const result = await occurrences.updateOne(filter, {
              $set: {
                completedDate: command.completedDate,
                ...(!entry.wasScheduled ? { date: command.completedDate } : {}),
              },
            })
            if (!result.matchedCount) throw changed()
          } else if (entry.wasScheduled && !task.archived) {
            const result = await occurrences.updateOne(filter, {
              $unset: { completedDate: "" },
            })
            if (!result.matchedCount) throw changed()
          } else {
            const result = await occurrences.deleteOne(filter)
            if (!result.deletedCount) throw changed()
          }
        }
      }
    }
    // Close the schedule/archive race on standalone MongoDB. An archive that
    // happens after this read performs the same cleanup itself.
    const latestTask = await tasks.findOne({ _id: task._id })
    if (latestTask?.archived) {
      await occurrences.deleteMany({
        taskId: task._id,
        completedDate: { $exists: false },
      })
      if (command.kind === "schedule" || command.kind === "move") {
        throw new HouseholdTaskConflict(
          "La tarea se ha archivado y su programación se ha retirado."
        )
      }
    }
  } catch (error) {
    if (error instanceof MongoServerError && error.code === 11000) {
      throw new HouseholdTaskConflict(
        "La tarea ya está registrada ese día. Recarga el calendario."
      )
    }
    throw error
  }
}
