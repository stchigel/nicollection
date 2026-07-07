/**
 * CollectionEntry — Value Object
 *
 * Representa la inclusión de una pieza en la colección personal de un Visitante.
 * Operación idempotente: agregar un duplicado o eliminar uno inexistente no falla.
 * FR-047, data-model.md §3.8
 */
export class CollectionEntry {
  readonly userId: string
  readonly pieceId: string
  readonly createdAt: Date

  constructor(params: { userId: string; pieceId: string; createdAt: Date }) {
    this.userId = params.userId
    this.pieceId = params.pieceId
    this.createdAt = params.createdAt
  }
}
