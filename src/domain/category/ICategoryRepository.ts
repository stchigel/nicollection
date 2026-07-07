import type { CategoryType } from './CategoryType'
import type { FieldDefinition } from './FieldDefinition'

/** Datos crudos de una Category tal como llegan de Firestore */
export interface CategoryData {
  id: string
  name: string
  type: CategoryType
  externalUrl: string | null
  displayOrder: number
  fieldSchema: FieldDefinition[]
  createdAt: Date
  updatedAt: Date
}

/**
 * ICategoryRepository — Constitución III
 *
 * Interfaz de dominio para el acceso a categorías.
 * La implementación concreta vive en `infrastructure/repositories/`.
 */
export interface ICategoryRepository {
  /** Retorna todas las categorías ordenadas por `displayOrder` */
  findAll(): Promise<CategoryData[]>
}
