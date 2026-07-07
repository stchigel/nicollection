/**
 * Admin — CategoryFormPage
 *
 * Permite crear categorías internas desde el panel admin.
 * Sin este flujo no es posible crear piezas.
 */
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  collection,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '@infrastructure/firebase/firebaseConfig'
import { DomainError } from '@domain/errors/DomainError'

export default function CategoryFormPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!name.trim()) {
      setErrorMsg('El nombre no puede estar vacío.')
      return
    }

    setIsSubmitting(true)
    try {
      await addDoc(collection(db, 'categories'), {
        name: name.trim(),
        type: 'internal',
        externalUrl: null,
        displayOrder: Date.now(),   // orden provisional basado en timestamp
        fieldSchema: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      navigate('/admin/categorias')
    } catch (err) {
      setErrorMsg(
        err instanceof DomainError
          ? err.message
          : 'Error al guardar la categoría.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="piece-form-page">
      <h1>Nueva categoría</h1>

      {errorMsg && <p className="auth-error">{errorMsg}</p>}

      <form className="piece-form" onSubmit={handleSubmit} noValidate>
        <label className="form-label">
          Nombre de la categoría <span className="form-required">*</span>
          <input
            className="form-input"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            placeholder="Ej: Aerolíneas, Celulares, Sellos…"
            autoFocus
          />
        </label>

        <p style={{ fontSize: '.85rem', color: 'var(--c-muted)' }}>
          Se crea como categoría <strong>interna</strong>. Podés agregar campos
          específicos desde la consola de Firebase si lo necesitás más adelante.
        </p>

        <div className="piece-form__actions">
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => navigate('/admin/categorias')}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn--primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Guardando…' : 'Crear categoría'}
          </button>
        </div>
      </form>
    </div>
  )
}
