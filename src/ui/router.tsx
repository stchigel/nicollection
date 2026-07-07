/**
 * T067 — router.tsx
 */
import { createBrowserRouter } from 'react-router-dom'
import Layout from '@ui/components/layout/Layout'
import HomePage from '@ui/pages/HomePage'
import AuthPage from '@ui/pages/AuthPage'
import PieceListPage from '@ui/pages/admin/PieceListPage'
import PieceFormPage from '@ui/pages/admin/PieceFormPage'
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
        element: <div className="page-placeholder">Listado de piezas — próximamente</div>,
      },
      {
        path: 'pieza/:id',
        element: <div className="page-placeholder">Detalle de pieza — próximamente</div>,
      },
      {
        path: 'perfil',
        element: (
          <ProtectedRoute>
            <div className="page-placeholder">Perfil — próximamente</div>
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
                <PieceListPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'piezas/nueva',
            element: (
              <ProtectedRoute requiredRole="admin">
                <PieceFormPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'piezas/:id/editar',
            element: (
              <ProtectedRoute requiredRole="admin">
                <PieceFormPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'usuarios',
            element: (
              <ProtectedRoute requiredRole="admin">
                <div className="page-placeholder">Gestión de usuarios — próximamente</div>
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
