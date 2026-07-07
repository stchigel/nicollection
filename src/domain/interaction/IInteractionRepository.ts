/** Resultado paginado de favoritos / colección */
export interface InteractionListResult {
  items: Array<{ pieceId: string; createdAt: Date }>
  nextCursor: unknown | null
}

/**
 * IInteractionRepository — Constitución III
 * Gestiona favoritos y entradas "En Colección". FR-046, FR-047.
 */
export interface IInteractionRepository {
  /* ── Favoritos ── */
  isFavorite(userId: string, pieceId: string): Promise<boolean>
  toggleFavorite(userId: string, pieceId: string): Promise<void>
  listFavorites(userId: string, cursor: unknown | null): Promise<InteractionListResult>
  /** Cascade delete cuando se elimina una pieza */
  deleteAllFavoritesByPiece(pieceId: string): Promise<void>

  /* ── Colección ── */
  isInCollection(userId: string, pieceId: string): Promise<boolean>
  toggleCollection(userId: string, pieceId: string): Promise<void>
  listCollection(userId: string, cursor: unknown | null): Promise<InteractionListResult>
  /** Cascade delete cuando se elimina una pieza */
  deleteAllCollectionByPiece(pieceId: string): Promise<void>
}
