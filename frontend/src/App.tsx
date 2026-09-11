import { AuthProvider } from './context/AuthContext'
import { useAuth } from './hooks/useAuth'
import { LoginForm } from './components/LoginForm'

function AppContent() {
  const { isAuthenticated, logout } = useAuth()

  if (!isAuthenticated) {
    return <LoginForm />
  }

  return (
    <div>
      <p>Sesión iniciada.</p>
      <button onClick={logout}>Cerrar sesión</button>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
