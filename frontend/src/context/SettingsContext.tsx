import { useEffect, useState, type ReactNode } from 'react'
import { SettingsContext } from './settingsContextInstance'

const COMPUTED_DEPARTMENTS_KEY = 'settings.useComputedDepartments'
const MOCK_DEVICES_KEY = 'settings.useMockDevices'
const COMPUTED_PAGINATION_KEY = 'settings.useComputedPagination'

function readStoredFlag(key: string, defaultValue: boolean): boolean {
  const stored = localStorage.getItem(key)
  return stored === null ? defaultValue : stored === 'true'
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [useComputedDepartments, setUseComputedDepartments] = useState(() =>
    readStoredFlag(COMPUTED_DEPARTMENTS_KEY, false),
  )
  const [useMockDevices, setUseMockDevices] = useState(() => readStoredFlag(MOCK_DEVICES_KEY, false))
  // Calculado (paginación en memoria) es el default histórico de la app, por
  // eso arranca en true a diferencia de los otros flags.
  const [useComputedPagination, setUseComputedPagination] = useState(() =>
    readStoredFlag(COMPUTED_PAGINATION_KEY, true),
  )

  useEffect(() => {
    localStorage.setItem(COMPUTED_DEPARTMENTS_KEY, String(useComputedDepartments))
  }, [useComputedDepartments])

  useEffect(() => {
    localStorage.setItem(MOCK_DEVICES_KEY, String(useMockDevices))
  }, [useMockDevices])

  useEffect(() => {
    localStorage.setItem(COMPUTED_PAGINATION_KEY, String(useComputedPagination))
  }, [useComputedPagination])

  return (
    <SettingsContext.Provider
      value={{
        useComputedDepartments,
        useMockDevices,
        useComputedPagination,
        setUseComputedDepartments,
        setUseMockDevices,
        setUseComputedPagination,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}
