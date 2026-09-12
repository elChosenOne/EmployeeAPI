import { useState } from 'react'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './hooks/useAuth'
import { LoginForm } from './components/LoginForm'
import { EmployeesPage } from './pages/EmployeesPage'
import { DevicesPage } from './pages/DevicesPage'

type View = 'employees' | 'devices'

function AppContent() {
  const { isAuthenticated, logout } = useAuth()
  const [view, setView] = useState<View>('employees')

  if (!isAuthenticated) {
    return <LoginForm />
  }

  return (
    <div>
      <nav>
        <button onClick={() => setView('employees')} disabled={view === 'employees'}>
          Empleados
        </button>
        <button onClick={() => setView('devices')} disabled={view === 'devices'}>
          Dispositivos
        </button>
        <button onClick={logout}>Cerrar sesión</button>
      </nav>
      {view === 'employees' ? <EmployeesPage /> : <DevicesPage />}
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
