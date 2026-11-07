import { NextResponse } from "next/server"
import type {
  FiscalTask,
  ManualFiscalTask,
} from "@/lib/domain/entities/fiscal-task"
import type { FiscalTaskRepository } from "@/lib/domain/ports/fiscal-task-repository"
import {
  fiscalSuggestions,
  hasFiscalCatalog,
  madridDate,
} from "@/lib/domain/services/fiscal-calendar"
import {
  fiscalCreate,
  fiscalId,
  fiscalUpdate,
  fiscalYear,
} from "@/schemas/fiscal-agenda-validator"

function respond(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  })
}

function failure(message: string, status: number) {
  return respond({ error: message }, status)
}

function manualTask(id: string, task: ManualFiscalTask): FiscalTask {
  return {
    ...task,
    id,
    dueYear: Number((task.filingDue ?? task.paymentDue)?.slice(0, 4)),
  }
}

function hasFutureProgress(task: Pick<FiscalTask, "filedOn" | "paidOn">) {
  const today = madridDate()
  return [task.filedOn, task.paidOn].some((date) => date && date > today)
}

interface Dependencies {
  authorize: () => Promise<NextResponse | null>
  getOwner: () => Promise<string | null>
  repository: FiscalTaskRepository
}

export function createFiscalAgendaHandlers({
  authorize,
  getOwner,
  repository,
}: Dependencies) {
  async function authenticated(
    operation: (owner: string) => Promise<NextResponse>
  ) {
    try {
      const denied = await authorize()
      if (denied) return denied
      const owner = await getOwner()
      if (!owner) return failure("Sesión no disponible.", 401)
      return await operation(owner)
    } catch (error) {
      console.error(`Fiscal agenda request failed: ${error}`)
      return failure("No se pudo actualizar la agenda fiscal.", 500)
    }
  }

  function list(request: Request) {
    return authenticated(async (owner) => {
      const year = fiscalYear.safeParse(
        new URL(request.url).searchParams.get("year")
      )
      if (!year.success) return failure("Año incorrecto.", 400)
      return respond({
        tasks: await repository.list(owner, year.data),
        suggestions: fiscalSuggestions(year.data),
        hasCatalog: hasFiscalCatalog(year.data),
      })
    })
  }

  function create(request: Request) {
    return authenticated(async (owner) => {
      const parsed = fiscalCreate.safeParse(
        await request.json().catch(() => null)
      )
      if (!parsed.success) return failure("Revisa los datos del trámite.", 400)
      const input = parsed.data
      if (input.action === "manual") {
        if (hasFutureProgress(input.task))
          return failure("Las fechas de gestión no pueden ser futuras.", 400)
        await repository.create(
          owner,
          manualTask(crypto.randomUUID(), input.task)
        )
      } else {
        const ids = new Set(input.ids)
        const suggestions = fiscalSuggestions(input.year).filter((task) =>
          ids.has(task.id)
        )
        if (suggestions.length !== ids.size)
          return failure("Sugerencia desconocida.", 400)
        for (const task of suggestions)
          await repository.incorporate(owner, task)
      }
      return respond({ ok: true }, 201)
    })
  }

  function update(request: Request) {
    return authenticated(async (owner) => {
      const parsed = fiscalUpdate.safeParse(
        await request.json().catch(() => null)
      )
      if (!parsed.success) return failure("Revisa los datos del trámite.", 400)
      const input = parsed.data
      const previous = await repository.find(owner, input.id)
      if (!previous) return failure("Trámite no encontrado.", 404)
      let task: FiscalTask
      if (input.action === "manual" && !previous.source) {
        task = manualTask(previous.id, input.task)
      } else if (input.action === "progress") {
        const {
          filedOn,
          paidOn,
          notes,
          receipt,
          paymentDueOverride,
          ...details
        } = previous
        if (
          input.progress.paymentDueOverride &&
          (!previous.source || previous.paymentDue)
        ) {
          return failure(
            "El trámite no admite un vencimiento de pago adicional.",
            409
          )
        }
        task = { ...details, ...input.progress }
      } else if (
        input.action === "refresh" &&
        !previous.filedOn &&
        !previous.paidOn
      ) {
        const official = fiscalSuggestions(previous.dueYear).find(
          (item) => item.id === previous.id
        )
        if (!official) return failure("Sugerencia desconocida.", 400)
        task = {
          ...official,
          ...(previous.notes && { notes: previous.notes }),
          ...(previous.receipt && { receipt: previous.receipt }),
          ...(previous.paymentDueOverride && {
            paymentDueOverride: previous.paymentDueOverride,
          }),
        }
      } else {
        return failure("El trámite no admite este cambio.", 409)
      }
      if (hasFutureProgress(task)) {
        return failure("Las fechas de gestión no pueden ser futuras.", 400)
      }
      if (!(await repository.replace(owner, previous, task))) {
        return failure(
          "El trámite cambió. Actualiza la agenda y vuelve a intentarlo.",
          409
        )
      }
      return respond({ ok: true })
    })
  }

  function remove(request: Request) {
    return authenticated(async (owner) => {
      const id = fiscalId.safeParse(new URL(request.url).searchParams.get("id"))
      if (!id.success) return failure("Identificador incorrecto.", 400)
      if (!(await repository.remove(owner, id.data)))
        return failure("Trámite no encontrado.", 404)
      return respond({ ok: true })
    })
  }

  return { GET: list, POST: create, PUT: update, DELETE: remove }
}
