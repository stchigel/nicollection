/**
 * T015 — tests/unit/Comment.test.ts
 * 🔴 OBLIGATORIO: debe fallar antes de implementar Comment.ts (T021)
 * US6, FR-040/041/044
 */
import { describe, it, expect } from 'vitest'
import { Comment } from '@domain/comment/Comment'
import { DomainError } from '@domain/errors/DomainError'

const base = {
  id: 'comment-1',
  pieceId: 'piece-1',
  authorId: 'user-author',
  authorUsername: 'autor',
  createdAt: new Date(),
}

describe('Comment (Entity)', () => {
  describe('constructor', () => {
    it('crea un comentario nuevo con edited:false', () => {
      const c = new Comment({ ...base, text: 'hola', editedAt: null, edited: false })
      expect(c.edited).toBe(false)
      expect(c.editedAt).toBeNull()
    })
  })

  describe('editText()', () => {
    it('lanza DomainError si el texto es vacío', () => {
      const c = new Comment({ ...base, text: 'original', editedAt: null, edited: false })
      expect(() => c.editText('')).toThrow(DomainError)
    })

    it('lanza DomainError si el texto supera 1000 caracteres', () => {
      const c = new Comment({ ...base, text: 'original', editedAt: null, edited: false })
      expect(() => c.editText('x'.repeat(1001))).toThrow(DomainError)
    })

    it('actualiza text y establece edited:true con un texto válido', () => {
      const c = new Comment({ ...base, text: 'original', editedAt: null, edited: false })
      c.editText('válido')
      expect(c.text).toBe('válido')
      expect(c.edited).toBe(true)
    })

    it('actualiza editedAt al editar', () => {
      const c = new Comment({ ...base, text: 'original', editedAt: null, edited: false })
      const before = new Date()
      c.editText('nuevo texto')
      expect(c.editedAt).not.toBeNull()
      expect(c.editedAt!.getTime()).toBeGreaterThanOrEqual(before.getTime())
    })

    it('acepta texto de exactamente 1000 caracteres', () => {
      const c = new Comment({ ...base, text: 'original', editedAt: null, edited: false })
      expect(() => c.editText('x'.repeat(1000))).not.toThrow()
    })
  })

  describe('canBeEditedBy()', () => {
    it('retorna true si el userId es el autor con rol visitor', () => {
      const c = new Comment({ ...base, text: 'hola', editedAt: null, edited: false })
      expect(c.canBeEditedBy('user-author', 'visitor')).toBe(true)
    })

    it('retorna false si el userId NO es el autor con rol visitor', () => {
      const c = new Comment({ ...base, text: 'hola', editedAt: null, edited: false })
      expect(c.canBeEditedBy('otro-user', 'visitor')).toBe(false)
    })

    it('retorna true si el userId es el autor con rol admin', () => {
      const c = new Comment({ ...base, text: 'hola', editedAt: null, edited: false })
      expect(c.canBeEditedBy('user-author', 'admin')).toBe(true)
    })

    it('retorna false si el userId NO es el autor aunque sea admin (admin solo puede eliminar, no editar ajenos)', () => {
      const c = new Comment({ ...base, text: 'hola', editedAt: null, edited: false })
      expect(c.canBeEditedBy('otro-admin', 'admin')).toBe(false)
    })
  })

  describe('canBeDeletedBy()', () => {
    it('retorna true si el userId es el autor con rol visitor', () => {
      const c = new Comment({ ...base, text: 'hola', editedAt: null, edited: false })
      expect(c.canBeDeletedBy('user-author', 'visitor')).toBe(true)
    })

    it('retorna false si el userId NO es el autor con rol visitor', () => {
      const c = new Comment({ ...base, text: 'hola', editedAt: null, edited: false })
      expect(c.canBeDeletedBy('otro-user', 'visitor')).toBe(false)
    })

    it('retorna true si el userId NO es el autor pero tiene rol admin', () => {
      const c = new Comment({ ...base, text: 'hola', editedAt: null, edited: false })
      expect(c.canBeDeletedBy('otro-admin', 'admin')).toBe(true)
    })

    it('retorna true si el userId es el autor con rol admin', () => {
      const c = new Comment({ ...base, text: 'hola', editedAt: null, edited: false })
      expect(c.canBeDeletedBy('user-author', 'admin')).toBe(true)
    })
  })
})
