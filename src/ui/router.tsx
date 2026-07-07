/**
 * T067 — router.tsx
 *
 * Rutas de la SPA. Layout como shell principal, rutas anidadas.
 * Rutas de Phase 8 que no están implementadas usan placeholders.
 * [US1-US8, FR-002]
 */
import { createBrowserRouter } from 'react-router-dom'
import Layout from '@ui/components/layout/Layout'
import HomePage from '@ui/pages/HomePage'
import AuthPage from '@ui/pages/AuthPage'
import ProtectedRoute from '@ui/components/ProtectedRoute'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'auth',
        element: <AuthPage />,
      },
      {
        path: 'categoria/:id',
        element: <div className="page-placeholder">Listado de piezas — Phase 8 (T080)</div>,
      },
      {
        path: 'pieza/:id',
        element: <div className="page-placeholder">Detalle de pieza — Phase 8 (T084)</div>,
      },
      {
        path: 'perfil',
        element: (
          <ProtectedRoute>
            <div className="page-placeholder">Perfil — Phase 8 (T087)</div>
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin',
        children: [
          {
            path: 'piezas',
            element: (
              <ProtectedRoute requiredRole="admin">
                <div className="page-placeholder">Gestión de piezas — Phase 8 (T088)</div>
              </ProtectedRoute>
            ),
          },
          {
            path: 'piezas/nueva',
            element: (
              <ProtectedRoute requiredRole="admin">
                <div className="page-placeholder">Nueva pieza — Phase 8 (T089)</div>
              </ProtectedRoute>
            ),
          },
          {
            path: 'piezas/:id/editar',
            element: (
              <ProtectedRoute requiredRole="admin">
                <div className="page-placeholder">Editar pieza — Phase 8 (T089)</div>
              </ProtectedRoute>
            ),
          },
          {
            path: 'usuarios',
            element: (
              <ProtectedRoute requiredRole="admin">
                <div className="page-placeholder">Gestión de usuarios — Phase 8 (T090)</div>
              </ProtectedRoute>
            ),
          },
        ],
      },
      {
        path: '*',
        element: (
          <div className="error-boundary">
            <h2>404 — Página no encontrada</h2>
          </div>
        ),
      },
    ],
  },
])
