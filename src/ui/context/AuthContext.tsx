/**
 * AuthContext — contexto global de autenticación
 *
 * Provee el estado de auth a todos los componentes de la app.
 * Usado por Layout, ProtectedRoute, AuthPage, etc.
 */
import {
  createContext,
  useContext,
  type ReactNode,
} from 'react'
import { useAuth } from '@ui/hooks/useAuth'

type AuthContextType = ReturnType<typeof useAuth>

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth()
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

export function useAuthContext(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext debe usarse dentro de <AuthProvider>')
  return ctx
}
