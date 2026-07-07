/**
 * T079 — CategoryTile
 *
 * - Categoría interna → navigate('/categoria/:id')
 * - Categoría externa → window.open(externalUrl, '_blank') [US1/4, FR-002/003/005]
 */
import { useNavigate } from 'react-router-dom'
import type { CategoryViewModel } from '@presentation/categories/CategoryViewModel'

interface Props {
  category: CategoryViewModel
}

export default function CategoryTile({ category }: Props) {
  const navigate = useNavigate()

  const handleClick = () => {
    if (category.type === 'external' && category.externalUrl) {
      window.open(category.externalUrl, '_blank', 'noopener,noreferrer')
    } else {
      navigate(`/categoria/${category.id}`)
    }
  }

  return (
    <button className="category-tile" onClick={handleClick}>
      <span className="category-tile__name">{category.name}</span>
      {category.type === 'external' && (
        <span className="category-tile__badge">
          ↗ Externo
        </span>
      )}
    </button>
  )
}
