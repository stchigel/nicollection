/**
 * FieldDefinition — Value Object
 *
 * Describe un campo específico de una categoría interna.
 * FR-006, FR-026: cada categoría interna puede declarar sus propios campos específicos
 * sin alterar la estructura de piezas de otras categorías.
 */
export interface FieldDefinition {
  /** Clave del campo — coincide con la clave en `Piece.specificFields` */
  readonly key: string
  /** Etiqueta visible al usuario */
  readonly label: string
  /** Tipo de dato esperado */
  readonly fieldType: 'string' | 'number' | 'date'
  /** Si es verdadero, el campo debe estar presente en `specificFields` */
  readonly required: boolean
}
