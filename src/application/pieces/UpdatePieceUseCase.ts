/**
 * T055 (simplificado) — UpdatePieceUseCase
 *
 * Actualiza título, descripción y status. Regenera searchTokens.
 * [US7, FR-029/030]
 */
import { Piece } from '@domain/piece/Piece'
import type { IPieceRepository } from '@domain/piece/IPieceRepository'
import type { PublicationStatus } from '@domain/piece/PublicationStatus'
import { DomainError } from '@domain/errors/DomainError'

export interface UpdatePieceInput {
  id: string
  title: string
  description: string
  status: PublicationStatus
}

export class UpdatePieceUseCase {
  constructor(private readonly pieceRepo: IPieceRepository) {}

  async execute(input: UpdatePieceInput): Promise<void> {
    const existing = await this.pieceRepo.findById(input.id, 'admin')
    if (!existing) throw new DomainError('Pieza no encontrada')

    const piece = new Piece({
      ...existing,
      categoryType: 'internal',
      title: input.title,
      description: input.description,
      status: input.status,
    })

    piece.validate()

    await this.pieceRepo.update(input.id, {
      title: piece.title,
      description: piece.description,
      status: piece.status,
      searchTokens: Piece.generateSearchTokens(piece.title, piece.description, piece.tags),
      updatedAt: new Date(),
    })
  }
}
