/**
 * T068 — ProtectedRoute
 *
 * Guarda de rutas que requieren autenticación o rol específico.
 * - No autenticado → redirige a /auth
 * - Rol insuficiente → muestra 403
 * - Cargando → spinner
 */
import { Navigate } from 'react-router-dom'
import { useAuthContext } from '@ui/context/AuthContext'
import LoadingSpinner from '@ui/components/LoadingSpinner'
import type { Role } from '@domain/user/Role'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  requiredRole?: Role
}

export default function ProtectedRoute({ children, requiredRole }: Props) {
  const { isAuthenticated, isAdmin, isLoading } = useAuthContext()

  if (isLoading) return <LoadingSpinner />
  if (!isAuthenticated) return <Navigate to="/auth" replace />
  if (requiredRole === 'admin' && !isAdmin) {
    return (
      <div className="error-boundary">
        <h2>403 — Acceso denegado</h2>
        <p>No tenés permisos suficientes para ver esta página.</p>
      </div>
    )
  }

  return <>{children}</>
}
