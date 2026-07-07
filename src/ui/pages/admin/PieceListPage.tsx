/**
 * T088 (simplificado) — PieceListPage (Admin)
 *
 * Lista todas las piezas de todas las categorías (admin ve published + draft).
 * Acciones: publicar/despublicar, editar, eliminar con confirmación.
 * [US7, FR-030/031/032]
 */
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FirestorePieceRepository } from '@infrastructure/repositories/FirestorePieceRepository'
import { FirestoreCategoryRepository } from '@infrastructure/repositories/FirestoreCategoryRepository'
import { UpdatePieceUseCase } from '@application/pieces/UpdatePieceUseCase'
import type { PieceData } from '@domain/piece/IPieceRepository'
import type { CategoryData } from '@domain/category/ICategoryRepository'
import LoadingSpinner from '@ui/components/LoadingSpinner'

const pieceRepo = new FirestorePieceRepository()
const categoryRepo = new FirestoreCategoryRepository()
const updateUseCase = new UpdatePieceUseCase(pieceRepo)

export default function PieceListPage() {
  const [pieces, setPieces] = useState<PieceData[]>([])
  const [categories, setCategories] = useState<CategoryData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const load = async () => {
    try {
      setIsLoading(true)
      const cats = await categoryRepo.findAll()
      setCategories(cats)

      const allPieces: PieceData[] = []
      for (const cat of cats.filter(c => c.type === 'internal')) {
        const result = await pieceRepo.findByCategory(cat.id, {}, null, 'admin', 100)
        allPieces.push(...result.items)
      }
      // Ordena por fecha desc
      allPieces.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      setPieces(allPieces)
    } catch {
      setError('Error al cargar las piezas.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const getCategoryName = (id: string) =>
    categories.find(c => c.id === id)?.name ?? id

  const handleToggleStatus = async (piece: PieceData) => {
    const newStatus = piece.status === 'published' ? 'draft' : 'published'
    await updateUseCase.execute({
      id: piece.id,
      title: piece.title,
      description: piece.description,
      status: newStatus,
    })
    load()
  }

  const handleDelete = async (piece: PieceData) => {
    if (!confirm(`¿Eliminar "${piece.title}"? Esta acción no se puede deshacer.`)) return
    setDeletingId(piece.id)
    try {
      await pieceRepo.delete(piece.id)
      load()
    } finally {
      setDeletingId(null)
    }
  }

  if (isLoading) return <LoadingSpinner />
  if (error) return <div className="page-error">{error}</div>

  return (
    <div className="admin-list-page">
      <div className="admin-list-page__header">
        <h1>Gestión de piezas</h1>
        <Link to="/admin/piezas/nueva" className="btn btn--primary">
          + Nueva pieza
        </Link>
      </div>

      {pieces.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state__message">No hay piezas cargadas aún.</p>
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Categoría</th>
                <th>Estado</th>
                <th>Creada</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pieces.map(p => (
                <tr key={p.id}>
                  <td>{p.title}</td>
                  <td>{getCategoryName(p.categoryId)}</td>
                  <td>
                    <span className={`status-badge status-badge--${p.status}`}>
                      {p.status === 'published' ? 'Publicada' : 'Borrador'}
                    </span>
                  </td>
                  <td>{p.createdAt.toLocaleDateString('es-AR')}</td>
                  <td className="admin-table__actions">
                    <Link
                      to={`/admin/piezas/${p.id}/editar`}
                      className="btn btn--ghost btn--sm"
                    >
                      Editar
                    </Link>
                    <button
                      className="btn btn--ghost btn--sm"
                      onClick={() => handleToggleStatus(p)}
                    >
                      {p.status === 'published' ? 'Despublicar' : 'Publicar'}
                    </button>
                    <button
                      className="btn btn--danger btn--sm"
                      onClick={() => handleDelete(p)}
                      disabled={deletingId === p.id}
                    >
                      {deletingId === p.id ? '…' : 'Eliminar'}
                    </button>
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
