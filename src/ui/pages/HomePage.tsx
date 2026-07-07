/**
 * T078 — HomePage
 *
 * Grilla de CategoryTile cargada con ListCategoriesUseCase.
 * Muestra EmptyState si no hay categorías. [US1, FR-001/005]
 */
import { useEffect, useState } from 'react'
import { FirestoreCategoryRepository } from '@infrastructure/repositories/FirestoreCategoryRepository'
import { ListCategoriesUseCase } from '@application/categories/ListCategoriesUseCase'
import {
  toCategoryViewModel,
  type CategoryViewModel,
} from '@presentation/categories/CategoryViewModel'
import CategoryTile from '@ui/components/CategoryTile'
import LoadingSpinner from '@ui/components/LoadingSpinner'
import EmptyState from '@ui/components/EmptyState'

const listCategories = new ListCategoriesUseCase(new FirestoreCategoryRepository())

export default function HomePage() {
  const [categories, setCategories] = useState<CategoryViewModel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listCategories
      .execute()
      .then(result => {
        const all = [...result.internal, ...result.external].map(
          toCategoryViewModel,
        )
        setCategories(all)
      })
      .catch(() => setError('Error al cargar las categorías. Intentá nuevamente.'))
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) return <LoadingSpinner />

  if (error) {
    return (
      <div className="page-error">
        <p>{error}</p>
      </div>
    )
  }

  if (categories.length === 0) {
    return (
      <EmptyState message="No hay categorías disponibles aún." />
    )
  }

  return (
    <div className="home-page">
      <h1 className="home-page__title">Colección</h1>
      <div className="category-grid">
        {categories.map(cat => (
          <CategoryTile key={cat.id} category={cat} />
        ))}
      </div>
    </div>
  )
}
