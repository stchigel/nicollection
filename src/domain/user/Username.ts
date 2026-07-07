import { DomainError } from '@domain/errors/DomainError'

/**
 * Username — Value Object
 *
 * Encapsula las reglas de validación del nombre de usuario.
 * FR-034/035, data-model.md §1.5
 *
 * Reglas:
 * - Longitud: 3–30 caracteres
 * - Caracteres permitidos: [a-zA-Z0-9_-] únicamente
 * - Sin espacios ni caracteres especiales
 */
export class Username {
  private constructor(private readonly _value: string) {}

  /** Factory estático — lanza DomainError si el valor no es válido */
  static create(value: string): Username {
    if (value.length < 3) {
      throw new DomainError(
        `El nombre de usuario debe tener al menos 3 caracteres (recibido: "${value}")`,
      )
    }
    if (value.length > 30) {
      throw new DomainError(
        `El nombre de usuario no puede superar 30 caracteres (recibido longitud: ${value.length})`,
      )
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
      throw new DomainError(
        `El nombre de usuario solo puede contener letras, números, guiones y guiones bajos (recibido: "${value}")`,
      )
    }
    return new Username(value)
  }

  get value(): string {
    return this._value
  }
}
