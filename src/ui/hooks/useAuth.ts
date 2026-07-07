/**
 * T066 — useAuth
 *
 * Suscripción a onAuthStateChanged + onSnapshot sobre /users/{uid}.
 * Si enabled pasa a false → signOut automático (FR-039, SEC-005).
 * [US5, research.md D-004]
 */
import { useEffect, useState, useCallback } from 'react'
import { onAuthStateChanged, signOut, type User as FirebaseUser } from 'firebase/auth'
import { auth } from '@infrastructure/firebase/firebaseConfig'
import { FirestoreUserRepository } from '@infrastructure/repositories/FirestoreUserRepository'
import type { UserData } from '@domain/user/IUserRepository'

interface AuthState {
  firebaseUser: FirebaseUser | null
  userData: UserData | null
  isLoading: boolean
}

const userRepo = new FirestoreUserRepository()

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    firebaseUser: null,
    userData: null,
    isLoading: true,
  })

  useEffect(() => {
    let unsubscribeUser: (() => void) | null = null

    const unsubscribeAuth = onAuthStateChanged(auth, firebaseUser => {
      // Limpiar suscripción de usuario anterior
      if (unsubscribeUser) {
        unsubscribeUser()
        unsubscribeUser = null
      }

      if (!firebaseUser) {
        setState({ firebaseUser: null, userData: null, isLoading: false })
        return
      }

      // Suscripción en tiempo real para detectar cambio de enabled (research.md D-004)
      unsubscribeUser = userRepo.listenToUser(firebaseUser.uid, userData => {
        if (userData !== null && !userData.enabled) {
          // Usuario inhabilitado → forzar signOut (FR-039, SEC-005)
          signOut(auth).catch(() => {})
          setState({ firebaseUser: null, userData: null, isLoading: false })
        } else {
          setState({ firebaseUser, userData, isLoading: false })
        }
      })
    })

    return () => {
      unsubscribeAuth()
      if (unsubscribeUser) unsubscribeUser()
    }
  }, [])

  const logout = useCallback(() => signOut(auth), [])

  return {
    firebaseUser: state.firebaseUser,
    userData: state.userData,
    isLoading: state.isLoading,
    /** true solo si hay sesión activa Y el doc de usuario existe en Firestore */
    isAuthenticated: state.firebaseUser !== null && state.userData !== null,
    isAdmin: state.userData?.role === 'admin',
    logout,
  }
}
