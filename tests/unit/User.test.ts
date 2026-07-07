/**
 * T016 — tests/unit/User.test.ts
 * 🔴 OBLIGATORIO: debe fallar antes de implementar User.ts (T022)
 * US8, FR-051/055, SEC-006
 */
import { describe, it, expect } from 'vitest'
import { User } from '@domain/user/User'
import { Username } from '@domain/user/Username'

const ADMIN_UID = 'admin-uid-1'
const OTHER_UID = 'visitor-uid-2'

const adminData = {
  uid: ADMIN_UID,
  username: 'adminuser',
  role: 'admin' as const,
  enabled: true,
  createdAt: new Date(),
}

const visitorData = {
  uid: OTHER_UID,
  username: 'visitoruser',
  role: 'visitor' as const,
  enabled: true,
  createdAt: new Date(),
}

describe('User (Entity)', () => {
  describe('canBeDisabledBy()', () => {
    it('retorna false si el requestingAdminUid es el propio uid (anti-self-disable)', () => {
      const user = new User(adminData)
      expect(user.canBeDisabledBy(ADMIN_UID)).toBe(false)
    })

    it('retorna true si el requestingAdminUid es diferente al propio uid', () => {
      const user = new User(adminData)
      expect(user.canBeDisabledBy('otro-admin-uid')).toBe(true)
    })

    it('retorna true para un visitante deshabilitado por otro uid', () => {
      const user = new User(visitorData)
      expect(user.canBeDisabledBy(ADMIN_UID)).toBe(true)
    })
  })

  describe('disable()', () => {
    it('establece enabled a false', () => {
      const user = new User(visitorData)
      user.disable()
      expect(user.enabled).toBe(false)
    })
  })

  describe('enable()', () => {
    it('establece enabled a true', () => {
      const user = new User({ ...visitorData, enabled: false })
      user.enable()
      expect(user.enabled).toBe(true)
    })
  })

  describe('invariante de rol', () => {
    it('un usuario con role visitor no puede tener role admin asignado en constructor normal', () => {
      // El rol 'admin' NO puede ser asignado a través de la UI ni vía constructor normal.
      // La única forma de tener rol admin es pre-setup manual en Firestore.
      // Aquí verificamos que el constructor no permite que un usuario creado con role visitor
      // se convierta en admin simplemente cambiando el campo.
      const user = new User(visitorData)
      expect(user.role).toBe('visitor')
      // No existe método setRole() — SEC-006
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(typeof (user as any).setRole).toBe('undefined')
    })
  })

  describe('changeUsername()', () => {
    it('actualiza el username al nuevo valor', () => {
      const user = new User(visitorData)
      const newUsername = Username.create('nuevonombre')
      user.changeUsername(newUsername)
      expect(user.username).toBe('nuevonombre')
    })
  })
})
