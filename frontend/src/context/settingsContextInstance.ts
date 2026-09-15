import { createContext } from 'react'

export interface SettingsContextValue {
  useComputedDepartments: boolean
  useMockDevices: boolean
  setUseComputedDepartments: (value: boolean) => void
  setUseMockDevices: (value: boolean) => void
}

export const SettingsContext = createContext<SettingsContextValue | undefined>(undefined)
