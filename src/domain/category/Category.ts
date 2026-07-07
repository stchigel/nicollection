import { DomainError } from '@domain/errors/DomainError'
import type { CategoryType } from './CategoryType'
import type { FieldDefinition } from './FieldDefinition'

export interface CategoryProps {
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
 * Category — Entity
 *
 * data-model.md §1.1
 *
 * Invariantes:
 * - Si type === 'external', externalUrl es obligatorio y fieldSchema es vacío.
 * - Si type === 'internal', externalUrl es null.
 */
export class Category {
  readonly id: string
  readonly name: string
  readonly type: CategoryType
  readonly externalUrl: string | null
  readonly displayOrder: number
  private readonly _fieldSchema: FieldDefinition[]
  readonly createdAt: Date
  readonly updatedAt: Date

  constructor(props: CategoryProps) {
    if (props.type === 'external' && !props.externalUrl) {
      throw new DomainError(
        `Una categoría externa debe tener externalUrl (categoría: "${props.name}")`,
      )
    }
    this.id = props.id
    this.name = props.name
    this.type = props.type
    this.externalUrl = props.externalUrl
    this.displayOrder = props.displayOrder
    this._fieldSchema = props.fieldSchema
    this.createdAt = props.createdAt
    this.updatedAt = props.updatedAt
  }

  /** Retorna true si esta categoría tiene piezas propias gestionadas en el sistema */
  isInternal(): boolean {
    return this.type === 'internal'
  }

  /** Retorna true si esta categoría redirige a un sitio externo */
  isExternal(): boolean {
    return this.type === 'external'
  }

  /**
   * Retorna las definiciones de campos específicos de esta categoría.
   * Para categorías externas, retorna siempre [].
   */
  getFieldSchema(): FieldDefinition[] {
    return this._fieldSchema
  }
}
