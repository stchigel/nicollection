/**
 * T070 — ErrorBoundary
 *
 * Captura errores de renderizado en el árbol de componentes hijos.
 */
import { Component, type ReactNode, type ErrorInfo } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}
interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info)
  }

  override render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="error-boundary">
            <h2>Algo salió mal</h2>
            <p>{this.state.error?.message}</p>
            <button
              className="btn btn--primary"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              Reintentar
            </button>
          </div>
        )
      )
    }
    return this.props.children
  }
}
