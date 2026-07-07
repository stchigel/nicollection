/**
 * Favorite — Value Object
 *
 * Representa el marcado de una pieza como favorita por un Visitante.
 * Operación idempotente: agregar un duplicado o eliminar uno inexistente no falla.
 * FR-046, data-model.md §3.7
 */
export class Favorite {
  readonly userId: string
  readonly pieceId: string
  readonly createdAt: Date

  constructor(params: { userId: string; pieceId: string; createdAt: Date }) {
    this.userId = params.userId
    this.pieceId = params.pieceId
    this.createdAt = params.createdAt
  }
}
