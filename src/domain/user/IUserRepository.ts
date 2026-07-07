import type { Role } from './Role'

/** Datos de un usuario almacenados en `/users/{uid}` */
export interface UserData {
  uid: string
  username: string
  role: Role
  enabled: boolean
  createdAt: Date
}

/**
 * IUserRepository — Constitución III
 */
export interface IUserRepository {
  findAll(): Promise<UserData[]>
  findByUid(uid: string): Promise<UserData | null>
  update(uid: string, data: Partial<Omit<UserData, 'uid' | 'createdAt'>>): Promise<void>
  /** Suscripción en tiempo real para detectar cambio de `enabled` (research.md D-004) */
  listenToUser(uid: string, callback: (data: UserData | null) => void): () => void
}
