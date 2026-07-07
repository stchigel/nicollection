import type { PublicationStatus } from './PublicationStatus'
import type { FunctioningStatus } from './FunctioningStatus'
import type { Condition } from './Condition'
import type { Role } from '@domain/user/Role'

/** Datos públicos de una pieza (sin adminData) */
export interface PieceData {
  id: string
  categoryId: string
  title: string
  description: string
  tags: string[]
  year: number | null
  country: string | null
  pieceType: string | null
  imageUrl: string | null
  status: PublicationStatus
  specificFields: Record<string, unknown>
  searchTokens: string[]
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

/** Campos de administración — subcollección `/pieces/{id}/private/adminData` */
export interface AdminDataFields {
  functioning: FunctioningStatus
  hasBox: FunctioningStatus
  accessories: string[]
  condition: Condition
  provenance: string | null
  acquisitionDate: Date | null
  notes: string | null
  updatedAt: Date
}

/** Datos completos de una pieza (admin) */
export interface PieceWithAdminData extends PieceData {
  adminData: AdminDataFields
}

/** Filtros para el listado de piezas */
export interface PieceFilters {
  year?: number
  country?: string
  pieceType?: string
  specificFields?: Record<string, unknown>
}

/** Resultado paginado del listado */
export interface PieceListResult {
  items: PieceData[]
  /** Cursor para la siguiente página (null si no hay más) */
  nextCursor: unknown | null
}

/**
 * IPieceRepository — Constitución III
 */
export interface IPieceRepository {
  findByCategory(
    categoryId: string,
    filters: PieceFilters,
    cursor: unknown | null,
    role: Role,
    pageSize?: number,
  ): Promise<PieceListResult>

  searchByTokens(
    categoryId: string,
    searchQuery: string,
    cursor: unknown | null,
    role: Role,
    pageSize?: number,
  ): Promise<PieceListResult>

  /** Retorna null si no existe o si es draft y el rol no es admin */
  findById(id: string, role: Role): Promise<PieceData | null>

  /** Retorna null si el documento no existe */
  findAdminData(pieceId: string): Promise<AdminDataFields | null>

  create(data: Omit<PieceData, 'id'>, adminData: Omit<AdminDataFields, 'updatedAt'>): Promise<string>

  update(
    id: string,
    data: Partial<Omit<PieceData, 'id'>>,
    adminData?: Partial<Omit<AdminDataFields, 'updatedAt'>>,
  ): Promise<void>

  delete(id: string): Promise<void>

  /** Para el preview de delete: cuenta dependencias */
  countDependencies(pieceId: string): Promise<{
    commentCount: number
    favoriteCount: number
    collectionCount: number
  }>
}
