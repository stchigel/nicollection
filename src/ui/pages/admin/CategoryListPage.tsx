/**
 * Admin — CategoryListPage
 *
 * Lista todas las categorías existentes y permite crear nuevas.
 */
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FirestoreCategoryRepository } from '@infrastructure/repositories/FirestoreCategoryRepository'
import type { CategoryData } from '@domain/category/ICategoryRepository'
import LoadingSpinner from '@ui/components/LoadingSpinner'

const categoryRepo = new FirestoreCategoryRepository()

export default function CategoryListPage() {
  const [categories, setCategories] = useState<CategoryData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    categoryRepo
      .findAll()
      .then(setCategories)
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="admin-list-page">
      <div className="admin-list-page__header">
        <h1>Categorías</h1>
        <Link to="/admin/categorias/nueva" className="btn btn--primary">
          + Nueva categoría
        </Link>
      </div>

      {categories.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state__message">No hay categorías. Creá una para poder publicar piezas.</p>
          <Link to="/admin/categorias/nueva" className="btn btn--primary">
            Crear primera categoría
          </Link>
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Campos específicos</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(c => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>
                    <span className={`status-badge ${c.type === 'internal' ? 'status-badge--published' : 'status-badge--draft'}`}>
                      {c.type === 'internal' ? 'Interna' : 'Externa'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--c-muted)', fontSize: '.85rem' }}>
                    {c.fieldSchema.length > 0
                      ? c.fieldSchema.map(f => f.label).join(', ')
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
