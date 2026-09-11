import { useEffect, useState } from 'react'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './hooks/useAuth'
import { LoginForm } from './components/LoginForm'
import { EmployeeTable } from './components/EmployeeTable'
import { employeeService, type Employee } from './services/employeeService'

function AppContent() {
  const { isAuthenticated, logout } = useAuth()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) return

    employeeService
      .list()
      .then(setEmployees)
      .catch((err) => setError(err instanceof Error ? err.message : 'No se pudo cargar el listado.'))
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return <LoginForm />
  }

  return (
    <div>
      <p>Sesión iniciada.</p>
      <button onClick={logout}>Cerrar sesión</button>
      {error && <p role="alert">{error}</p>}
      <EmployeeTable employees={employees} />
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
