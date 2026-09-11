import { createContext } from 'react'
import type { LoginCredentials } from '../queries/authQueries'

export interface AuthContextValue {
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
