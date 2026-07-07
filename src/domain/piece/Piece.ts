import { DomainError } from '@domain/errors/DomainError'
import type { PublicationStatus } from './PublicationStatus'
import type { CategoryType } from '@domain/category/CategoryType'

export interface PieceProps {
  id: string
  categoryId: string
  /** Necesario para la validación en dominio sin cargar la Category completa */
  categoryType: CategoryType
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

/**
 * Piece — Aggregate Root
 *
 * data-model.md §1.2
 *
 * Invariantes:
 * - title no puede ser vacío ni solo espacios.
 * - categoryId debe referenciar una categoría 'internal'.
 * - status solo acepta 'published' | 'draft'.
 */
export class Piece {
  readonly id: string
  readonly categoryId: string
  readonly categoryType: CategoryType
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
  readonly createdAt: Date
  updatedAt: Date
  readonly createdBy: string

  constructor(props: PieceProps) {
    this.id = props.id
    this.categoryId = props.categoryId
    this.categoryType = props.categoryType
    this.title = props.title
    this.description = props.description
    this.tags = props.tags
    this.year = props.year
    this.country = props.country
    this.pieceType = props.pieceType
    this.imageUrl = props.imageUrl
    this.status = props.status
    this.specificFields = props.specificFields
    this.searchTokens = props.searchTokens
    this.createdAt = props.createdAt
    this.updatedAt = props.updatedAt
    this.createdBy = props.createdBy
  }

  /**
   * Valida que los invariantes de la pieza se cumplen antes de persistir.
   * Lanza DomainError si alguno falla.
   */
  validate(): void {
    if (!this.title || this.title.trim().length === 0) {
      throw new DomainError('El título de la pieza no puede estar vacío')
    }
    if (this.categoryType === 'external') {
      throw new DomainError(
        'No se pueden crear piezas en una categoría externa (FR-004)',
      )
    }
  }

  /** Transición de estado: publica la pieza */
  publish(): void {
    this.status = 'published'
  }

  /** Transición de estado: pasa la pieza a Borrador */
  draft(): void {
    this.status = 'draft'
  }

  /**
   * Genera los tokens de búsqueda a partir de título, descripción y tags.
   *
   * research.md D-001:
   * - Normaliza a minúsculas
   * - Divide por espacios y signos de puntuación
   * - Deduplicar
   */
  static generateSearchTokens(
    title: string,
    description: string,
    tags: string[],
  ): string[] {
    const allText = [title, description, ...tags].join(' ')
    // Split por cualquier carácter que no sea letra, número o acento
    const raw = allText
      .toLowerCase()
      .split(/[^a-z0-9áéíóúüñ]+/)
      .filter(t => t.length > 0)
    // Deduplicar manteniendo orden de aparición
    return [...new Set(raw)]
  }
}
