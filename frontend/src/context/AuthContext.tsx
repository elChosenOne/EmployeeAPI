import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { authService } from '../services/authService'
import { setUnauthorizedHandler } from '../queries/httpClient'
import type { LoginCredentials } from '../queries/authQueries'
import { AuthContext } from './authContextInstance'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => authService.isAuthenticated())
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState<string | null>(null)

  const logout = useCallback(() => {
    authService.logout()
    setIsAuthenticated(false)
  }, [])

  // Se dispara sólo cuando el backend rechaza el token en un request (401 o
  // fallo de red con /health arriba, ver httpClient.ts), a diferencia del
  // logout manual del botón "Cerrar sesión". Por eso deja el aviso: el
  // usuario no eligió salir, necesita saber por qué volvió al login.
  const handleSessionExpired = useCallback(() => {
    logout()
    setSessionExpiredMessage('Tu sesión expiró o no es válida. Iniciá sesión nuevamente.')
  }, [logout])

  useEffect(() => {
    setUnauthorizedHandler(handleSessionExpired)
  }, [handleSessionExpired])

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true)
    setError(null)
    setSessionExpiredMessage(null)
    try {
      await authService.login(credentials)
      setIsAuthenticated(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión.')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isLoading, error, sessionExpiredMessage, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}
