/**
 * T074 — CategoryViewModel
 *
 * Traduce CategoryData (dominio) a las props del tile.
 * Solo expone campos públicos visibles. [US1, Constitución III]
 */
import type { CategoryData } from '@domain/category/ICategoryRepository'

export interface CategoryViewModel {
  id: string
  name: string
  type: 'internal' | 'external'
  externalUrl: string | null
}

export function toCategoryViewModel(category: CategoryData): CategoryViewModel {
  return {
    id: category.id,
    name: category.name,
    type: category.type,
    externalUrl: category.externalUrl,
  }
}
