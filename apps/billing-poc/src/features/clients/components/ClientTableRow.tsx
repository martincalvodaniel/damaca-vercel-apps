"use client"

import Link from "next/link"
import { useCallback } from "react"
import { CopyToClipboardButton } from "@/components/ui/CopyToClipboardButton"
import { IconButton } from "@/components/ui/IconButton"
import { ClientTypeIcon } from "@/components/ui/icons/ClientTypeIcon"
import { TrashIcon } from "@/components/ui/icons/TrashIcon"
import type { Client } from "@/lib/domain/entities/client"

interface ClientTableRowProps {
  client: Client
  index: number
  onOpen: (clientId: string) => void
  onDelete: (clientId: string) => void
  onCopy?: (field: string, value: string) => void
}

export default function ClientTableRow({
  client,
  index,
  onOpen,
  onDelete,
  onCopy,
}: ClientTableRowProps) {
  const stopLinkPropagation = (event: React.MouseEvent) =>
    event.stopPropagation()
  const handleOpen = () => onOpen(clientId)
  const handleDelete = () => onDelete(clientId)
  const clientId = client._id ?? ""
  const stripe =
    index % 2 === 0
      ? "bg-white dark:bg-zinc-900"
      : "bg-zinc-50 dark:bg-zinc-800/50"
  const typeLabel =
    client.clientType === "individual" ? "Persona física / autónomo" : "Empresa"
  const handlePhoneCopied = useCallback(() => {
    onCopy?.("phone", client.phone ?? "")
  }, [client.phone, onCopy])
  const handleEmailCopied = useCallback(() => {
    onCopy?.("email", client.email ?? "")
  }, [client.email, onCopy])
  const handleInstagramCopied = useCallback(() => {
    onCopy?.("instagram", client.instagram ?? "")
  }, [client.instagram, onCopy])
  return (
    <tr
      onClick={handleOpen}
      className={`border-b border-zinc-200 cursor-pointer transition-colors hover:bg-blue-50 dark:border-zinc-700 dark:hover:bg-blue-900/20 ${stripe}`}
    >
      <td className="px-6 py-4 text-sm text-zinc-900 dark:text-zinc-50">
        <span className="inline-flex items-center gap-2">
          <ClientTypeIcon
            type={client.clientType}
            className="h-4 w-4 shrink-0 text-zinc-500 dark:text-zinc-400"
          />
          <Link
            href={`/clients/${encodeURIComponent(clientId)}`}
            onClick={stopLinkPropagation}
            title={typeLabel}
            className="rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {client.name}
          </Link>
        </span>
      </td>
      <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
        {client.taxId || "—"}
      </td>
      <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
        {client.phone ? (
          <CopyToClipboardButton
            value={client.phone}
            title={client.phone}
            ariaLabel={`Copiar teléfono ${client.phone}`}
            className="rounded px-1 py-0.5 text-left hover:bg-zinc-200/60 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:hover:bg-zinc-700/60"
            showIcon={false}
            stopPropagation
            onCopied={handlePhoneCopied}
          >
            {client.phone}
          </CopyToClipboardButton>
        ) : (
          "—"
        )}
      </td>
      <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
        {client.email ? (
          <CopyToClipboardButton
            value={client.email}
            title={client.email}
            ariaLabel={`Copiar correo electrónico ${client.email}`}
            className="rounded px-1 py-0.5 text-left hover:bg-zinc-200/60 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:hover:bg-zinc-700/60"
            showIcon={false}
            stopPropagation
            onCopied={handleEmailCopied}
          >
            {client.email}
          </CopyToClipboardButton>
        ) : (
          "—"
        )}
      </td>
      <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
        {client.instagram ? (
          <CopyToClipboardButton
            value={client.instagram}
            title={client.instagram}
            ariaLabel={`Copiar Instagram ${client.instagram}`}
            className="rounded px-1 py-0.5 text-left hover:bg-zinc-200/60 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:hover:bg-zinc-700/60"
            showIcon={false}
            stopPropagation
            onCopied={handleInstagramCopied}
          >
            {client.instagram}
          </CopyToClipboardButton>
        ) : (
          "—"
        )}
      </td>
      <td className="px-6 py-4 text-right">
        <IconButton
          variant="danger"
          stopPropagation
          onClick={handleDelete}
          ariaLabel={`Eliminar cliente ${client.name}`}
        >
          <TrashIcon />
        </IconButton>
      </td>
    </tr>
  )
}
