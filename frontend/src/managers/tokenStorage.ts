const STORAGE_KEY = 'auth.session'

export interface StoredSession {
  token: string
  expiresAtUtc: string
}

export const tokenStorage = {
  get(): StoredSession | null {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    try {
      return JSON.parse(raw) as StoredSession
    } catch {
      return null
    }
  },

  set(session: StoredSession): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  },

  clear(): void {
    localStorage.removeItem(STORAGE_KEY)
  },
}
