"use client"
import { useEffect, useMemo, useState } from "react"
import ClientSelector from "@/components/shared/ClientSelector"
import { ConfirmAction } from "@/components/ui/ConfirmAction"
import { Modal } from "@/components/ui/Modal"
import {
  useCreateClient,
  useUpdateClient,
} from "@/features/clients/hooks/useClientMutations"
import { useClients } from "@/features/clients/hooks/useClients"
import { useStableCallback } from "@/hooks/useStableCallback"
import type { Client } from "@/lib/domain/entities/client"
import type { WordPressOrder } from "@/lib/domain/entities/wordpress-order"
import { WordpressBillingClientStatusMessages } from "./WordpressBillingClientStatusMessages"
import { WordpressBillingDataCard } from "./WordpressBillingDataCard"
import { WordpressClientDiffPanel } from "./WordpressClientDiffPanel"
import {
  type ClientDiffRow,
  createEmptySelectedDiffFields,
  getBillingName,
  getBillingPayload,
  normalizeField,
  normalizeName,
} from "./wordpress-billing-client-utils"
import { extractApiError } from "./wordpress-view-utils"

interface WordpressBillingClientModalProps {
  order: WordPressOrder | null
  onClose: () => void
  onConfirmed?: (message: string) => void
}
export function WordpressBillingClientModal({
  order,
  onClose,
  onConfirmed,
}: WordpressBillingClientModalProps) {
  const handleClientChange = useStableCallback((clientId?: string) => {
    setHasManualSelection(true)
    setSelectedClientId(clientId)
  })
  const handleSelectClient = useStableCallback((client: Client | null) => {
    setHasManualSelection(true)
    setSelectedClient(client)
  })
  const handleConfirmClick = useStableCallback(() => {
    void handleConfirm()
  })
  const handleFieldToggle = useStableCallback(
    (field: ClientDiffRow["field"], checked: boolean) => {
      setSelectedDiffFields((current) => ({
        ...current,
        [field]: checked,
      }))
    }
  )
  const { trigger: createClient, isMutating: isCreatingClient } =
    useCreateClient()
  const { trigger: updateClient, isMutating: isUpdatingClient } =
    useUpdateClient()
  const [selectedClientId, setSelectedClientId] = useState<string | undefined>(
    undefined
  )
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [hasManualSelection, setHasManualSelection] = useState(false)
  const [selectedDiffFields, setSelectedDiffFields] = useState(
    createEmptySelectedDiffFields
  )
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  useEffect(() => {
    if (!order) return
    setSelectedClientId(undefined)
    setSelectedClient(null)
    setHasManualSelection(false)
    setErrorMessage(null)
  }, [order])

  const billingName = useMemo(
    () => (order ? getBillingName(order) : ""),
    [order]
  )

  const { clients: autoMatchedClients } = useClients({
    search: billingName,
    page: 1,
    pageSize: 20,
  })
  useEffect(() => {
    if (!order || hasManualSelection || selectedClientId || selectedClient)
      return
    const billingNameNormalized = normalizeName(getBillingName(order))
    const exactMatch = autoMatchedClients.find((client) => {
      if (!client._id) return false
      return normalizeName(client.name) === billingNameNormalized
    })
    if (!exactMatch?._id) return
    setSelectedClientId(exactMatch._id)
    setSelectedClient(exactMatch)
  }, [
    order,
    hasManualSelection,
    selectedClientId,
    selectedClient,
    autoMatchedClients,
  ])

  const billingPayload = useMemo(
    () => (order ? getBillingPayload(order) : null),
    [order]
  )

  const clientDiff = useMemo<ClientDiffRow[]>(() => {
    if (!selectedClient || !billingPayload) return []
    const rows = [
      {
        field: "name" as const,
        label: "Nombre",
        currentValue: normalizeField(selectedClient.name),
        nextValue: normalizeField(billingPayload.name),
      },
      {
        field: "phone" as const,
        label: "Teléfono",
        currentValue: normalizeField(selectedClient.phone),
        nextValue: normalizeField(billingPayload.phone),
      },
      {
        field: "email" as const,
        label: "Correo electrónico",
        currentValue: normalizeField(selectedClient.email),
        nextValue: normalizeField(billingPayload.email),
      },
    ]

    return rows.filter((row) => row.currentValue !== row.nextValue)
  }, [selectedClient, billingPayload])
  useEffect(() => {
    if (!selectedClient) {
      setSelectedDiffFields(createEmptySelectedDiffFields())
      return
    }
    const next = createEmptySelectedDiffFields()
    for (const row of clientDiff) {
      next[row.field] = true
    }
    setSelectedDiffFields(next)
  }, [selectedClient, clientDiff])
  const hasDiffChanges = clientDiff.length > 0
  const selectedDiffCount = clientDiff.filter(
    (row) => selectedDiffFields[row.field]
  ).length
  const isSubmitting = isCreatingClient || isUpdatingClient
  const confirmLabel = selectedClient
    ? "Confirmar actualización del cliente"
    : "Confirmar creación del cliente"
  const pendingLabel = selectedClient
    ? "Actualizando cliente…"
    : "Creando cliente…"
  const handleConfirm = async () => {
    if (!order || !billingPayload) return
    setErrorMessage(null)
    try {
      if (!selectedClient?._id) {
        await createClient({
          clientType: "individual",
          ...billingPayload,
        })
        onConfirmed?.(`Cliente creado a partir del pedido n.º ${order.id}`)
        onClose()
        return
      }
      const updates: {
        id: string
        name?: string
        phone?: string
        email?: string
      } = { id: selectedClient._id }
      if (selectedDiffFields.name) {
        updates.name = billingPayload.name
      }
      if (selectedDiffFields.phone) {
        updates.phone = billingPayload.phone
      }
      if (selectedDiffFields.email) {
        updates.email = billingPayload.email
      }
      if (Object.keys(updates).length === 1) {
        setErrorMessage("Selecciona al menos un campo para actualizar.")
        return
      }
      await updateClient(updates)
      onConfirmed?.(`Cliente actualizado a partir del pedido n.º ${order.id}`)
      onClose()
    } catch (error) {
      setErrorMessage(extractApiError(error, "No se pudo guardar el cliente"))
    }
  }
  const isConfirmDisabled =
    isSubmitting ||
    (selectedClient ? !hasDiffChanges || selectedDiffCount === 0 : false)
  return (
    <Modal
      isOpen={order !== null}
      onClose={onClose}
      title={
        order
          ? `Importar datos de facturación a clientes - Pedido n.º ${order.id}`
          : "Importar datos de facturación a clientes"
      }
      maxWidth="xl"
      headerActions={
        <ConfirmAction
          label={confirmLabel}
          disabled={isConfirmDisabled}
          isPending={isSubmitting}
          onClick={handleConfirmClick}
          pendingLabel={pendingLabel}
        />
      }
    >
      {order ? (
        <div className="space-y-4">
          <WordpressBillingDataCard order={order} />

          <ClientSelector
            value={selectedClientId}
            initialQuery={getBillingName(order)}
            selectedClientName={selectedClient?.name}
            onChange={handleClientChange}
            onSelectClient={handleSelectClient}
            label="Selecciona un cliente existente para actualizarlo (opcional)"
          />

          {selectedClient && hasDiffChanges ? (
            <WordpressClientDiffPanel
              clientDiff={clientDiff}
              selectedDiffFields={selectedDiffFields}
              onFieldToggle={handleFieldToggle}
            />
          ) : null}

          <WordpressBillingClientStatusMessages
            errorMessage={errorMessage}
            hasDiffChanges={hasDiffChanges}
            hasSelectedClient={selectedClient !== null}
            selectedDiffCount={selectedDiffCount}
          />
        </div>
      ) : null}
    </Modal>
  )
}
