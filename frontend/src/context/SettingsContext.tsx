import { useEffect, useState, type ReactNode } from 'react'
import { SettingsContext } from './settingsContextInstance'

const COMPUTED_DEPARTMENTS_KEY = 'settings.useComputedDepartments'
const MOCK_DEVICES_KEY = 'settings.useMockDevices'

function readStoredFlag(key: string): boolean {
  return localStorage.getItem(key) === 'true'
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [useComputedDepartments, setUseComputedDepartments] = useState(() => readStoredFlag(COMPUTED_DEPARTMENTS_KEY))
  const [useMockDevices, setUseMockDevices] = useState(() => readStoredFlag(MOCK_DEVICES_KEY))

  useEffect(() => {
    localStorage.setItem(COMPUTED_DEPARTMENTS_KEY, String(useComputedDepartments))
  }, [useComputedDepartments])

  useEffect(() => {
    localStorage.setItem(MOCK_DEVICES_KEY, String(useMockDevices))
  }, [useMockDevices])

  return (
    <SettingsContext.Provider
      value={{ useComputedDepartments, useMockDevices, setUseComputedDepartments, setUseMockDevices }}
    >
      {children}
    </SettingsContext.Provider>
  )
}
