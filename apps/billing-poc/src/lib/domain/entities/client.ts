export type ClientType = "individual" | "company"

export interface Client {
  _id?: string
  clientType: ClientType
  name: string
  taxId?: string
  address?: string
  phone?: string
  email?: string
  instagram?: string
  createdAt: Date
  updatedAt: Date
}

export interface ClientFormData {
  clientType: ClientType
  name: string
  taxId?: string
  address?: string
  phone?: string
  email?: string
  instagram?: string
}

interface PaginationMeta {
  page: number
  pageSize: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface PaginatedResponse<T> {
  items: T[]
  pagination: PaginationMeta
}
