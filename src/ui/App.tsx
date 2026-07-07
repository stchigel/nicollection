/**
 * App — punto de entrada de la UI.
 *
 * AuthProvider envuelve RouterProvider para que todos los componentes
 * de ruta tengan acceso al contexto de autenticación via useAuthContext().
 */
import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from '@ui/context/AuthContext'
import { router } from '@ui/router'

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}
