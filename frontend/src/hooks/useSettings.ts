import { useContext } from 'react'
import { SettingsContext, type SettingsContextValue } from '../context/settingsContextInstance'

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings debe usarse dentro de un SettingsProvider')
  }
  return context
}
