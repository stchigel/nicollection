/**
 * T014 — tests/unit/Piece.test.ts
 * 🔴 OBLIGATORIO: debe fallar antes de implementar Piece.ts (T020)
 * US7, FR-019/020
 */
import { describe, it, expect } from 'vitest'
import { Piece } from '@domain/piece/Piece'
import { DomainError } from '@domain/errors/DomainError'

const base = {
  id: 'piece-1',
  categoryId: 'cat-internal',
  categoryType: 'internal' as const,
  description: '',
  tags: [],
  year: null,
  country: null,
  pieceType: null,
  imageUrl: null,
  specificFields: {},
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: 'admin-uid',
}

describe('Piece (Aggregate Root)', () => {
  describe('validate()', () => {
    it('falla si title es vacío', () => {
      const piece = new Piece({ ...base, title: '', status: 'published', searchTokens: [] })
      expect(() => piece.validate()).toThrow(DomainError)
    })

    it('falla si title es solo espacios', () => {
      const piece = new Piece({ ...base, title: '   ', status: 'published', searchTokens: [] })
      expect(() => piece.validate()).toThrow(DomainError)
    })

    it('falla si la categoría es de tipo external', () => {
      const piece = new Piece({
        ...base,
        title: 'Válido',
        categoryType: 'external',
        status: 'published',
        searchTokens: [],
      })
      expect(() => piece.validate()).toThrow(DomainError)
    })

    it('no falla con título válido y categoría interna', () => {
      const piece = new Piece({ ...base, title: 'Pieza válida', status: 'published', searchTokens: [] })
      expect(() => piece.validate()).not.toThrow()
    })
  })

  describe('publish()', () => {
    it('establece status a published', () => {
      const piece = new Piece({ ...base, title: 'Pieza', status: 'draft', searchTokens: [] })
      piece.publish()
      expect(piece.status).toBe('published')
    })
  })

  describe('draft()', () => {
    it('establece status a draft', () => {
      const piece = new Piece({ ...base, title: 'Pieza', status: 'published', searchTokens: [] })
      piece.draft()
      expect(piece.status).toBe('draft')
    })
  })

  describe('generateSearchTokens()', () => {
    it('normaliza a minúsculas, divide por espacios y deduplicates', () => {
      const tokens = Piece.generateSearchTokens('Tarjeta AA', 'desc', ['tag1'])
      expect(tokens).toEqual(expect.arrayContaining(['tarjeta', 'aa', 'desc', 'tag1']))
      expect(tokens).toHaveLength(4)
    })

    it('elimina duplicados entre title, description y tags', () => {
      const tokens = Piece.generateSearchTokens('tarjeta', 'tarjeta', ['tarjeta'])
      expect(tokens).toEqual(['tarjeta'])
    })

    it('convierte a minúsculas', () => {
      const tokens = Piece.generateSearchTokens('AEROLÍNEAS', '', [])
      expect(tokens.every(t => t === t.toLowerCase())).toBe(true)
    })

    it('ignora tokens vacíos resultantes del split', () => {
      const tokens = Piece.generateSearchTokens('  hola  mundo  ', '', [])
      expect(tokens).not.toContain('')
    })

    it('split por signos de puntuación además de espacios', () => {
      const tokens = Piece.generateSearchTokens('AA-1985', '', [])
      // Debe incluir aa y 1985 por separado
      expect(tokens).toContain('aa')
      expect(tokens).toContain('1985')
    })
  })
})
