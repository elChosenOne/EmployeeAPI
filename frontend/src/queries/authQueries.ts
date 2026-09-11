import { API_BASE_URL } from '../config/env'
import { ApiError } from './httpClient'

export interface LoginCredentials {
  username: string
  password: string
}

export interface LoginResponse {
  username: string
  token: string
  expiresAtUtc: string
}

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  })

  if (!response.ok) {
    const message = await response.text()
    throw new ApiError(response.status, message || 'No se pudo iniciar sesión.')
  }

  return response.json() as Promise<LoginResponse>
}
