/**
 * T017 — tests/unit/AdminData.test.ts
 * 🔴 OBLIGATORIO: debe fallar antes de implementar AdminData.ts (T023)
 * FR-025
 */
import { describe, it, expect } from 'vitest'
import { AdminData } from '@domain/piece/AdminData'
import { DomainError } from '@domain/errors/DomainError'

const validData = {
  functioning: 'yes' as const,
  hasBox: 'no' as const,
  accessories: ['cargador', 'funda'],
  condition: 'good' as const,
  provenance: 'Mercado Libre',
  acquisitionDate: new Date('2024-01-15'),
  notes: 'Comprado en buen estado',
}

describe('AdminData (Value Object)', () => {
  describe('constructor válido', () => {
    it('crea AdminData con valores válidos', () => {
      const ad = AdminData.create(validData)
      expect(ad.functioning).toBe('yes')
      expect(ad.hasBox).toBe('no')
      expect(ad.condition).toBe('good')
    })

    it('acepta todos los valores válidos de FunctioningStatus para functioning', () => {
      expect(() => AdminData.create({ ...validData, functioning: 'yes' })).not.toThrow()
      expect(() => AdminData.create({ ...validData, functioning: 'no' })).not.toThrow()
      expect(() => AdminData.create({ ...validData, functioning: 'na' })).not.toThrow()
    })

    it('acepta todos los valores válidos de FunctioningStatus para hasBox', () => {
      expect(() => AdminData.create({ ...validData, hasBox: 'yes' })).not.toThrow()
      expect(() => AdminData.create({ ...validData, hasBox: 'no' })).not.toThrow()
      expect(() => AdminData.create({ ...validData, hasBox: 'na' })).not.toThrow()
    })

    it('acepta todos los valores válidos de Condition', () => {
      const conditions = ['perfect', 'excellent', 'good', 'acceptable', 'poor', 'very_poor'] as const
      for (const c of conditions) {
        expect(() => AdminData.create({ ...validData, condition: c })).not.toThrow()
      }
    })

    it('acepta provenance null', () => {
      expect(() => AdminData.create({ ...validData, provenance: null })).not.toThrow()
    })

    it('acepta acquisitionDate null', () => {
      expect(() => AdminData.create({ ...validData, acquisitionDate: null })).not.toThrow()
    })

    it('acepta notes null', () => {
      expect(() => AdminData.create({ ...validData, notes: null })).not.toThrow()
    })

    it('acepta accessories vacío', () => {
      expect(() => AdminData.create({ ...validData, accessories: [] })).not.toThrow()
    })
  })

  describe('validación de enums inválidos', () => {
    it('rechaza valor no definido en FunctioningStatus para functioning', () => {
      expect(() =>
        AdminData.create({ ...validData, functioning: 'maybe' as 'yes' }),
      ).toThrow(DomainError)
    })

    it('rechaza valor no definido en FunctioningStatus para hasBox', () => {
      expect(() =>
        AdminData.create({ ...validData, hasBox: 'unknown' as 'yes' }),
      ).toThrow(DomainError)
    })

    it('rechaza valor no definido en Condition', () => {
      expect(() =>
        AdminData.create({ ...validData, condition: 'broken' as 'good' }),
      ).toThrow(DomainError)
    })

    it('rechaza string vacío en Condition', () => {
      expect(() =>
        AdminData.create({ ...validData, condition: '' as 'good' }),
      ).toThrow(DomainError)
    })
  })
})
