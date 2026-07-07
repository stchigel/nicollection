/**
 * T069 — Layout
 *
 * Barra de navegación + footer + <Outlet /> para las rutas anidadas.
 * [US5, FR-002]
 */
import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuthContext } from '@ui/context/AuthContext'

export default function Layout() {
  const { isAuthenticated, isAdmin, userData, logout } = useAuthContext()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <div className="app-shell">
      <header className="navbar">
        <div className="navbar__inner container">
          <Link to="/" className="navbar__brand">
            nicollection
          </Link>

          <nav className="navbar__links">
            {isAdmin && (
              <Link to="/admin/piezas" className="navbar__link">
                Panel Admin
              </Link>
            )}
            {isAuthenticated ? (
              <>
                <Link to="/perfil" className="navbar__link">
                  {userData?.username ?? 'Perfil'}
                </Link>
                <button
                  className="btn btn--ghost"
                  onClick={handleLogout}
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <Link to="/auth" className="btn btn--primary">
                Iniciar sesión
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="main-content">
        <div className="container">
          <Outlet />
        </div>
      </main>

      <footer className="footer">
        <div className="container">
          <p>nicollection — colección personal</p>
        </div>
      </footer>
    </div>
  )
}
