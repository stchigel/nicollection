/** Datos de un comentario */
export interface CommentData {
  id: string
  pieceId: string
  authorId: string
  authorUsername: string
  text: string
  createdAt: Date
  editedAt: Date | null
  edited: boolean
}

/** Resultado paginado de comentarios */
export interface CommentListResult {
  items: CommentData[]
  nextCursor: unknown | null
}

/**
 * ICommentRepository — Constitución III
 */
export interface ICommentRepository {
  findByPiece(pieceId: string, cursor: unknown | null): Promise<CommentListResult>
  findByAuthor(authorId: string, cursor: unknown | null): Promise<CommentListResult>
  findById(id: string): Promise<CommentData | null>
  create(data: Omit<CommentData, 'id'>): Promise<string>
  update(id: string, data: Partial<Pick<CommentData, 'text' | 'edited' | 'editedAt'>>): Promise<void>
  delete(id: string): Promise<void>
  /** Borra todos los comentarios de una pieza en batches de ≤500 (cascade delete) */
  deleteAllByPiece(pieceId: string): Promise<void>
}
