/**
 * T054 (simplificado) — CreatePieceUseCase
 *
 * Crea una pieza con título, descripción y datos básicos.
 * Genera searchTokens, valida via Piece.validate(), persiste.
 * [US7, FR-027/028]
 */
import { Piece } from '@domain/piece/Piece'
import type { IPieceRepository } from '@domain/piece/IPieceRepository'

export interface CreatePieceInput {
  categoryId: string
  title: string
  description: string
  createdBy: string
}

export class CreatePieceUseCase {
  constructor(private readonly pieceRepo: IPieceRepository) {}

  async execute(input: CreatePieceInput): Promise<string> {
    const piece = new Piece({
      id: '',
      categoryId: input.categoryId,
      categoryType: 'internal',
      title: input.title,
      description: input.description,
      tags: [],
      year: null,
      country: null,
      pieceType: null,
      imageUrl: null,
      status: 'published',
      specificFields: {},
      searchTokens: Piece.generateSearchTokens(input.title, input.description, []),
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: input.createdBy,
    })

    piece.validate()

    return this.pieceRepo.create(
      {
        categoryId: piece.categoryId,
        title: piece.title,
        description: piece.description,
        tags: piece.tags,
        year: piece.year,
        country: piece.country,
        pieceType: piece.pieceType,
        imageUrl: piece.imageUrl,
        status: piece.status,
        specificFields: piece.specificFields,
        searchTokens: piece.searchTokens,
        createdAt: piece.createdAt,
        updatedAt: piece.updatedAt,
        createdBy: piece.createdBy,
      },
      {
        functioning: 'na',
        hasBox: 'na',
        accessories: [],
        condition: 'good',
        provenance: null,
        acquisitionDate: null,
        notes: null,
      },
    )
  }
}
