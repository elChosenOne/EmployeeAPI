import { useState } from 'react'
import { AuthProvider } from './context/AuthContext'
import { SettingsProvider } from './context/SettingsContext'
import { useAuth } from './hooks/useAuth'
import { LoginForm } from './components/LoginForm'
import { SettingsPanel } from './components/SettingsPanel'
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
    <div className="min-h-screen">
      <nav className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-white px-6 py-3 shadow-sm">
        <button
          onClick={() => setView('employees')}
          disabled={view === 'employees'}
          className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:bg-slate-900 disabled:text-white disabled:hover:bg-slate-900"
        >
          Empleados
        </button>
        <button
          onClick={() => setView('devices')}
          disabled={view === 'devices'}
          className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:bg-slate-900 disabled:text-white disabled:hover:bg-slate-900"
        >
          Dispositivos
        </button>
        <SettingsPanel />
        <button
          onClick={logout}
          className="ml-auto rounded-md px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          Cerrar sesión
        </button>
      </nav>
      <main className="mx-auto max-w-5xl px-6 py-8">
        {view === 'employees' ? <EmployeesPage /> : <DevicesPage />}
      </main>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <AppContent />
      </SettingsProvider>
    </AuthProvider>
  )
}

export default App
