/**
 * T089 (simplificado) — PieceFormPage (Admin)
 *
 * Alta y edición de pieza. Campos: categoría, título, descripción, estado.
 * [US7, FR-027/028/029]
 */
import { useState, useEffect, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FirestorePieceRepository } from '@infrastructure/repositories/FirestorePieceRepository'
import { FirestoreCategoryRepository } from '@infrastructure/repositories/FirestoreCategoryRepository'
import { CreatePieceUseCase } from '@application/pieces/CreatePieceUseCase'
import { UpdatePieceUseCase } from '@application/pieces/UpdatePieceUseCase'
import { DomainError } from '@domain/errors/DomainError'
import type { CategoryData } from '@domain/category/ICategoryRepository'
import type { PieceData } from '@domain/piece/IPieceRepository'
import type { PublicationStatus } from '@domain/piece/PublicationStatus'
import { useAuthContext } from '@ui/context/AuthContext'
import LoadingSpinner from '@ui/components/LoadingSpinner'

const pieceRepo = new FirestorePieceRepository()
const categoryRepo = new FirestoreCategoryRepository()
const createUseCase = new CreatePieceUseCase(pieceRepo)
const updateUseCase = new UpdatePieceUseCase(pieceRepo)

export default function PieceFormPage() {
  const { id } = useParams<{ id?: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { firebaseUser } = useAuthContext()

  const [categories, setCategories] = useState<CategoryData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Form fields
  const [categoryId, setCategoryId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<PublicationStatus>('published')

  useEffect(() => {
    const init = async () => {
      try {
        const cats = await categoryRepo.findAll()
        const internal = cats.filter(c => c.type === 'internal')
        setCategories(internal)

        if (isEdit && id) {
          const piece = await pieceRepo.findById(id, 'admin') as PieceData | null
          if (!piece) {
            navigate('/admin/piezas')
            return
          }
          setCategoryId(piece.categoryId)
          setTitle(piece.title)
          setDescription(piece.description)
          setStatus(piece.status)
        } else if (internal.length > 0) {
          setCategoryId(internal[0].id)
        }
      } catch {
        setErrorMsg('Error al cargar los datos.')
      } finally {
        setIsLoading(false)
      }
    }
    init()
  }, [id, isEdit, navigate])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setIsSubmitting(true)
    try {
      if (isEdit && id) {
        await updateUseCase.execute({ id, title, description, status })
      } else {
        await createUseCase.execute({
          categoryId,
          title,
          description,
          createdBy: firebaseUser?.uid ?? '',
        })
      }
      navigate('/admin/piezas')
    } catch (err) {
      setErrorMsg(err instanceof DomainError ? err.message : 'Error al guardar la pieza.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="piece-form-page">
      <h1>{isEdit ? 'Editar pieza' : 'Nueva pieza'}</h1>

      {errorMsg && <p className="auth-error">{errorMsg}</p>}

      <form className="piece-form" onSubmit={handleSubmit} noValidate>
        {/* Categoría — solo en alta */}
        {!isEdit && (
          <label className="form-label">
            Categoría
            <select
              className="form-input"
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              required
            >
              {categories.length === 0 && (
                <option value="">Sin categorías internas</option>
              )}
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>
        )}

        <label className="form-label">
          Título <span className="form-required">*</span>
          <input
            className="form-input"
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            placeholder="Ej: Tarjeta de embarque AA 1985"
          />
        </label>

        <label className="form-label">
          Descripción
          <textarea
            className="form-input form-textarea"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={4}
            placeholder="Descripción opcional de la pieza…"
          />
        </label>

        {/* Estado — solo en edición */}
        {isEdit && (
          <div className="form-label">
            Estado de publicación
            <div className="form-radio-group">
              <label className="form-radio">
                <input
                  type="radio"
                  value="published"
                  checked={status === 'published'}
                  onChange={() => setStatus('published')}
                />
                Publicada
              </label>
              <label className="form-radio">
                <input
                  type="radio"
                  value="draft"
                  checked={status === 'draft'}
                  onChange={() => setStatus('draft')}
                />
                Borrador
              </label>
            </div>
          </div>
        )}

        <div className="piece-form__actions">
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => navigate('/admin/piezas')}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn--primary"
            disabled={isSubmitting || categories.length === 0}
          >
            {isSubmitting ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear pieza'}
          </button>
        </div>
      </form>
    </div>
  )
}
