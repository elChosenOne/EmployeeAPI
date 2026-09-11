import { login as loginQuery, type LoginCredentials } from '../queries/authQueries'
import { tokenStorage } from '../managers/tokenStorage'

export const authService = {
  async login(credentials: LoginCredentials): Promise<void> {
    const response = await loginQuery(credentials)
    tokenStorage.set({ token: response.token, expiresAtUtc: response.expiresAtUtc })
  },

  logout(): void {
    tokenStorage.clear()
  },

  isAuthenticated(): boolean {
    const session = tokenStorage.get()
    if (!session) return false
    return new Date(session.expiresAtUtc).getTime() > Date.now()
  },
}
