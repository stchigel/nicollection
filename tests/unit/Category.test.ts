/**
 * T013 — tests/unit/Category.test.ts
 * 🔴 OBLIGATORIO: debe fallar antes de implementar Category.ts (T019)
 * US1, US4, FR-006
 */
import { describe, it, expect } from 'vitest'
import { Category } from '@domain/category/Category'
import type { FieldDefinition } from '@domain/category/FieldDefinition'

const AIRLINE_SCHEMA: FieldDefinition[] = [
  { key: 'airline', label: 'Aerolínea', fieldType: 'string', required: true },
  { key: 'subtype', label: 'Subtipo', fieldType: 'string', required: false },
]

const baseInternal = {
  id: 'cat-1',
  name: 'Aerolíneas',
  displayOrder: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
}

const baseExternal = {
  id: 'cat-ext',
  name: 'Colnect',
  displayOrder: 99,
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('Category (Entity)', () => {
  describe('isInternal()', () => {
    it('retorna true para type internal', () => {
      const cat = new Category({
        ...baseInternal,
        type: 'internal',
        externalUrl: null,
        fieldSchema: AIRLINE_SCHEMA,
      })
      expect(cat.isInternal()).toBe(true)
    })

    it('retorna false para type external', () => {
      const cat = new Category({
        ...baseExternal,
        type: 'external',
        externalUrl: 'https://colnect.com',
        fieldSchema: [],
      })
      expect(cat.isInternal()).toBe(false)
    })
  })

  describe('isExternal()', () => {
    it('retorna true para type external', () => {
      const cat = new Category({
        ...baseExternal,
        type: 'external',
        externalUrl: 'https://colnect.com',
        fieldSchema: [],
      })
      expect(cat.isExternal()).toBe(true)
    })

    it('retorna false para type internal', () => {
      const cat = new Category({
        ...baseInternal,
        type: 'internal',
        externalUrl: null,
        fieldSchema: AIRLINE_SCHEMA,
      })
      expect(cat.isExternal()).toBe(false)
    })
  })

  describe('getFieldSchema()', () => {
    it('retorna las definiciones correctas para categoría interna', () => {
      const cat = new Category({
        ...baseInternal,
        type: 'internal',
        externalUrl: null,
        fieldSchema: AIRLINE_SCHEMA,
      })
      expect(cat.getFieldSchema()).toEqual(AIRLINE_SCHEMA)
    })

    it('retorna fieldSchema vacío para categoría externa', () => {
      const cat = new Category({
        ...baseExternal,
        type: 'external',
        externalUrl: 'https://colnect.com',
        fieldSchema: [],
      })
      expect(cat.getFieldSchema()).toEqual([])
    })
  })

  describe('invariante: external requiere externalUrl', () => {
    it('lanza error si type external y externalUrl es null', () => {
      expect(
        () =>
          new Category({
            ...baseExternal,
            type: 'external',
            externalUrl: null,
            fieldSchema: [],
          }),
      ).toThrow()
    })

    it('no lanza error si type internal y externalUrl es null', () => {
      expect(
        () =>
          new Category({
            ...baseInternal,
            type: 'internal',
            externalUrl: null,
            fieldSchema: AIRLINE_SCHEMA,
          }),
      ).not.toThrow()
    })
  })
})
