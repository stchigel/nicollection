/**
 * T046 — ListCategoriesUseCase
 *
 * Obtiene todas las categorías y las separa en internas y externas.
 * [US1, US4, FR-001/003/005]
 */
import type { ICategoryRepository, CategoryData } from '@domain/category/ICategoryRepository'

export interface CategoriesResult {
  internal: CategoryData[]
  external: CategoryData[]
}

export class ListCategoriesUseCase {
  constructor(private readonly categoryRepo: ICategoryRepository) {}

  async execute(): Promise<CategoriesResult> {
    const all = await this.categoryRepo.findAll()
    return {
      internal: all.filter(c => c.type === 'internal'),
      external: all.filter(c => c.type === 'external'),
    }
  }
}
