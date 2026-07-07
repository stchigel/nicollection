/**
 * T012 — tests/unit/Username.test.ts
 * 🔴 OBLIGATORIO: debe fallar antes de implementar Username.ts (T018)
 * US5, FR-034/035
 */
import { describe, it, expect } from 'vitest'
import { Username } from '@domain/user/Username'
import { DomainError } from '@domain/errors/DomainError'

describe('Username (Value Object)', () => {
  describe('longitud mínima', () => {
    it('acepta exactamente 3 caracteres', () => {
      const u = Username.create('abc')
      expect(u.value).toBe('abc')
    })

    it('rechaza string de 2 caracteres', () => {
      expect(() => Username.create('ab')).toThrow(DomainError)
    })

    it('rechaza string vacío', () => {
      expect(() => Username.create('')).toThrow(DomainError)
    })
  })

  describe('longitud máxima', () => {
    it('acepta exactamente 30 caracteres', () => {
      const value = 'a'.repeat(30)
      const u = Username.create(value)
      expect(u.value).toBe(value)
    })

    it('rechaza string de 31 caracteres', () => {
      expect(() => Username.create('a'.repeat(31))).toThrow(DomainError)
    })
  })

  describe('caracteres permitidos', () => {
    it('acepta username válido con letras, números, guion y guion bajo', () => {
      const u = Username.create('nick_user-01')
      expect(u.value).toBe('nick_user-01')
    })

    it('acepta solo letras mayúsculas y minúsculas', () => {
      const u = Username.create('NicoLas')
      expect(u.value).toBe('NicoLas')
    })

    it('rechaza espacios', () => {
      expect(() => Username.create('nick user')).toThrow(DomainError)
    })

    it('rechaza espacio al inicio', () => {
      expect(() => Username.create(' nick')).toThrow(DomainError)
    })

    it('rechaza puntos', () => {
      expect(() => Username.create('nick.user')).toThrow(DomainError)
    })

    it('rechaza arroba', () => {
      expect(() => Username.create('nick@user')).toThrow(DomainError)
    })

    it('rechaza caracteres especiales no permitidos (!)', () => {
      expect(() => Username.create('nick!')).toThrow(DomainError)
    })
  })

  describe('inmutabilidad del value', () => {
    it('expone value como solo lectura', () => {
      const u = Username.create('valid123')
      expect(u.value).toBe('valid123')
    })
  })
})
