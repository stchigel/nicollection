import { DomainError } from '@domain/errors/DomainError'
import type { FunctioningStatus } from './FunctioningStatus'
import type { Condition } from './Condition'

const FUNCTIONING_STATUSES: FunctioningStatus[] = ['yes', 'no', 'na']
const CONDITIONS: Condition[] = [
  'perfect',
  'excellent',
  'good',
  'acceptable',
  'poor',
  'very_poor',
]

export interface AdminDataProps {
  functioning: FunctioningStatus
  hasBox: FunctioningStatus
  accessories: string[]
  condition: Condition
  provenance: string | null
  acquisitionDate: string | null
  notes: string | null
}

/**
 * AdminData — Value Object
 *
 * data-model.md §1.2 (sub-document adminData dentro de Piece)
 *
 * Solo el admin puede crear/leer este objeto (SEC-003).
 * Todos los campos son inmutables; para actualizar se crea una nueva instancia.
 */
export class AdminData {
  readonly functioning: FunctioningStatus
  readonly hasBox: FunctioningStatus
  readonly accessories: string[]
  readonly condition: Condition
  readonly provenance: string | null
  readonly acquisitionDate: string | null
  readonly notes: string | null

  private constructor(props: AdminDataProps) {
    this.functioning = props.functioning
    this.hasBox = props.hasBox
    this.accessories = props.accessories
    this.condition = props.condition
    this.provenance = props.provenance
    this.acquisitionDate = props.acquisitionDate
    this.notes = props.notes
  }

  /**
   * Factory method con validación.
   * Lanza DomainError si algún enum no es válido.
   */
  static create(props: AdminDataProps): AdminData {
    if (!FUNCTIONING_STATUSES.includes(props.functioning)) {
      throw new DomainError(`Valor de 'functioning' no válido: ${props.functioning}`)
    }
    if (!FUNCTIONING_STATUSES.includes(props.hasBox)) {
      throw new DomainError(`Valor de 'hasBox' no válido: ${props.hasBox}`)
    }
    if (!CONDITIONS.includes(props.condition)) {
      throw new DomainError(`Valor de 'condition' no válido: ${props.condition}`)
    }
    return new AdminData(props)
  }
}
