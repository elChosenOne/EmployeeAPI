import { AuthProvider } from './context/AuthContext'
import { useAuth } from './hooks/useAuth'
import { LoginForm } from './components/LoginForm'
import { EmployeesPage } from './pages/EmployeesPage'

function AppContent() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <LoginForm />
  }

  return <EmployeesPage />
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
