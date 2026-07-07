import { DomainError } from '@domain/errors/DomainError'
import type { Role } from '@domain/user/Role'

const MAX_TEXT_LENGTH = 1000

export interface CommentProps {
  id: string
  pieceId: string
  authorId: string
  authorUsername: string
  text: string
  createdAt: Date
  editedAt: Date | null
  edited: boolean
}

/**
 * Comment — Entity
 *
 * data-model.md §1.4
 *
 * Invariantes:
 * - text no puede estar vacío.
 * - text no puede superar MAX_TEXT_LENGTH caracteres.
 * - Solo el autor puede editar su comentario.
 * - El autor o un admin pueden eliminarlo.
 * - edited se pone en true en el primer editText().
 */
export class Comment {
  readonly id: string
  readonly pieceId: string
  readonly authorId: string
  readonly authorUsername: string
  text: string
  readonly createdAt: Date
  editedAt: Date | null
  edited: boolean

  constructor(props: CommentProps) {
    this.id = props.id
    this.pieceId = props.pieceId
    this.authorId = props.authorId
    this.authorUsername = props.authorUsername
    this.text = props.text
    this.createdAt = props.createdAt
    this.editedAt = props.editedAt
    this.edited = props.edited
  }

  /**
   * Edita el texto del comentario.
   * Lanza DomainError si el texto está vacío o supera el límite.
   */
  editText(newText: string): void {
    if (!newText || newText.trim().length === 0) {
      throw new DomainError('El texto del comentario no puede estar vacío')
    }
    if (newText.length > MAX_TEXT_LENGTH) {
      throw new DomainError(
        `El comentario no puede superar ${MAX_TEXT_LENGTH} caracteres`,
      )
    }
    this.text = newText
    this.edited = true
    this.editedAt = new Date()
  }

  /**
   * Solo el propio autor puede editar su comentario (FR-039).
   */
  canBeEditedBy(userId: string, _role: Role): boolean {
    return userId === this.authorId
  }

  /**
   * El autor o cualquier admin puede eliminar el comentario (FR-041).
   */
  canBeDeletedBy(userId: string, role: Role): boolean {
    return userId === this.authorId || role === 'admin'
  }
}
