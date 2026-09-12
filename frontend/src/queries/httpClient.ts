import { API_BASE_URL } from '../config/env'
import { tokenStorage } from '../managers/tokenStorage'
import { checkHealth } from './healthQuery'

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class SessionExpiredError extends Error {
  constructor() {
    super('La sesión expiró o no es válida.')
    this.name = 'SessionExpiredError'
  }
}

type UnauthorizedHandler = () => void

let onUnauthorized: UnauthorizedHandler | null = null

export function setUnauthorizedHandler(handler: UnauthorizedHandler): void {
  onUnauthorized = handler
}

/**
 * Fetch autenticado para endpoints protegidos. El backend no agrega headers
 * CORS a sus respuestas 401 (solo a 200/OPTIONS), así que el browser bloquea
 * esa respuesta y `fetch` la reporta como fallo de red, no como status 401.
 * Si hay sesión guardada y el backend responde en /health, tratamos ese
 * fallo de red como sesión inválida.
 */
export async function authFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const session = tokenStorage.get()
  const headers = new Headers(init.headers)
  if (session) {
    headers.set('Authorization', `Bearer ${session.token}`)
  }

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers })
  } catch (networkError) {
    // Un abort intencional (AbortController.abort(), p. ej. al cancelar un polling)
    // llega acá como error de fetch; no es una falla de red real ni motivo para
    // dar la sesión por expirada, así que se repropaga tal cual.
    if (networkError instanceof DOMException && networkError.name === 'AbortError') {
      throw networkError
    }

    if (session && (await checkHealth())) {
      onUnauthorized?.()
      throw new SessionExpiredError()
    }
    throw networkError
  }

  if (response.status === 401) {
    onUnauthorized?.()
    throw new SessionExpiredError()
  }

  if (!response.ok) {
    const message = await response.text()
    throw new ApiError(response.status, message || `Error ${response.status}`)
  }

  return response
}
