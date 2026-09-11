import { useState, type FormEvent } from 'react'
import { useAuth } from '../hooks/useAuth'

export function LoginForm() {
  const { login, isLoading, error } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    login({ username, password }).catch(() => {
      // el error ya queda expuesto vía `error` del contexto
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Usuario
        <input
          type="text"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          autoComplete="username"
          required
        />
      </label>
      <label>
        Contraseña
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
        />
      </label>
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Ingresando...' : 'Ingresar'}
      </button>
      {error && <p role="alert">{error}</p>}
    </form>
  )
}
