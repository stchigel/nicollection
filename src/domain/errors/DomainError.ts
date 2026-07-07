/**
 * DomainError — Clase base de error de dominio
 *
 * Constitución II: todos los errores de invariantes del dominio lanzan esta clase.
 * Las capas superiores (application, ui) pueden distinguir errores de dominio
 * de errores de infraestructura usando `instanceof DomainError`.
 */
export class DomainError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DomainError'
    // Necesario para que instanceof funcione correctamente con clases que extienden Error en ES5
    Object.setPrototypeOf(this, new.target.prototype)
  }
}
