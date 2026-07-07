/**
 * T086 — AuthPage
 *
 * Tabs "Iniciar sesión" / "Registrarse".
 * - Login: signInWithEmailAndPassword
 * - Registro: RegisterUseCase (valida Username + crea Auth + Firestore tx)
 * [US5, FR-034/035/037]
 */
import { useState, type FormEvent } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { FirebaseError } from 'firebase/app'
import { auth, db } from '@infrastructure/firebase/firebaseConfig'
import { RegisterUseCase } from '@application/users/RegisterUseCase'
import { DomainError } from '@domain/errors/DomainError'
import { useAuthContext } from '@ui/context/AuthContext'
import LoadingSpinner from '@ui/components/LoadingSpinner'

const registerUseCase = new RegisterUseCase(auth, db)

type Tab = 'login' | 'register'

function parseAuthError(error: unknown): string {
  if (error instanceof DomainError) return error.message
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'auth/email-already-in-use':
        return 'Este correo ya está registrado.'
      case 'auth/invalid-email':
        return 'Correo electrónico inválido.'
      case 'auth/weak-password':
        return 'La contraseña debe tener al menos 6 caracteres.'
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Correo o contraseña incorrectos.'
      case 'auth/too-many-requests':
        return 'Demasiados intentos. Intentá más tarde.'
      case 'auth/user-disabled':
        return 'Tu cuenta fue inhabilitada. Contactá al administrador.'
      default:
        return `Error inesperado (${error.code}). Intentá nuevamente.`
    }
  }
  if (error instanceof Error) return error.message
  return 'Error inesperado. Intentá nuevamente.'
}

export default function AuthPage() {
  const { isAuthenticated, isLoading } = useAuthContext()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('login')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Login form state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Register form state
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regUsername, setRegUsername] = useState('')

  if (isLoading) return <LoadingSpinner />
  if (isAuthenticated) return <Navigate to="/" replace />

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setIsSubmitting(true)
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword)
      navigate('/')
    } catch (err) {
      setErrorMsg(parseAuthError(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setIsSubmitting(true)
    try {
      await registerUseCase.execute({
        email: regEmail,
        password: regPassword,
        username: regUsername,
      })
      navigate('/')
    } catch (err) {
      setErrorMsg(parseAuthError(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-card__title">nicollection</h1>

        {/* Tabs */}
        <div className="auth-tabs">
          <button
            className={`auth-tab ${tab === 'login' ? 'auth-tab--active' : ''}`}
            onClick={() => { setTab('login'); setErrorMsg(null) }}
          >
            Iniciar sesión
          </button>
          <button
            className={`auth-tab ${tab === 'register' ? 'auth-tab--active' : ''}`}
            onClick={() => { setTab('register'); setErrorMsg(null) }}
          >
            Registrarse
          </button>
        </div>

        {/* Error */}
        {errorMsg && <p className="auth-error" role="alert">{errorMsg}</p>}

        {/* Login form */}
        {tab === 'login' && (
          <form className="auth-form" onSubmit={handleLogin} noValidate>
            <label className="form-label">
              Correo electrónico
              <input
                className="form-input"
                type="email"
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </label>
            <label className="form-label">
              Contraseña
              <input
                className="form-input"
                type="password"
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </label>
            <button
              className="btn btn--primary btn--full"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Ingresando…' : 'Ingresar'}
            </button>
          </form>
        )}

        {/* Register form */}
        {tab === 'register' && (
          <form className="auth-form" onSubmit={handleRegister} noValidate>
            <label className="form-label">
              Nombre de usuario
              <input
                className="form-input"
                type="text"
                value={regUsername}
                onChange={e => setRegUsername(e.target.value)}
                required
                minLength={3}
                maxLength={30}
                pattern="[a-zA-Z0-9_-]+"
                autoComplete="username"
              />
              <span className="form-hint">
                3–30 caracteres. Solo letras, números, guiones y guiones bajos.
              </span>
            </label>
            <label className="form-label">
              Correo electrónico
              <input
                className="form-input"
                type="email"
                value={regEmail}
                onChange={e => setRegEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </label>
            <label className="form-label">
              Contraseña
              <input
                className="form-input"
                type="password"
                value={regPassword}
                onChange={e => setRegPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
              <span className="form-hint">Mínimo 6 caracteres.</span>
            </label>
            <button
              className="btn btn--primary btn--full"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creando cuenta…' : 'Crear cuenta'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
