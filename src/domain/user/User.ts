import { DomainError as _DomainError } from '@domain/errors/DomainError'
import type { Role } from './Role'
import type { Username } from './Username'

export interface UserProps {
  uid: string
  username: string
  role: Role
  enabled: boolean
  createdAt: Date
}

/**
 * User — Entity
 *
 * data-model.md §1.1
 *
 * Invariantes:
 * - No existe método setRole() — SEC-006.
 * - Un admin no puede auto-deshabilitarse (canBeDisabledBy).
 */
export class User {
  readonly uid: string
  username: string
  readonly role: Role
  enabled: boolean
  readonly createdAt: Date

  constructor(props: UserProps) {
    this.uid = props.uid
    this.username = props.username
    this.role = props.role
    this.enabled = props.enabled
    this.createdAt = props.createdAt
  }

  /**
   * Un admin puede deshabilitar a cualquier usuario EXCEPTO a sí mismo (FR-055).
   */
  canBeDisabledBy(requestingAdminUid: string): boolean {
    return requestingAdminUid !== this.uid
  }

  /** Deshabilita la cuenta del usuario */
  disable(): void {
    this.enabled = false
  }

  /** Re-habilita la cuenta del usuario */
  enable(): void {
    this.enabled = true
  }

  /**
   * Cambia el username del usuario.
   * Recibe un Value Object Username ya validado (FR-051).
   */
  changeUsername(newUsername: Username): void {
    this.username = newUsername.value
  }

  // NO existe setRole() — SEC-006
}
