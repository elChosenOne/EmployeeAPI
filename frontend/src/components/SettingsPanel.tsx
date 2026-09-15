import { useState } from 'react'
import { useSettings } from '../hooks/useSettings'
import { ToggleSwitch } from './ToggleSwitch'

export function SettingsPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const { useComputedDepartments, useMockDevices, setUseComputedDepartments, setUseMockDevices } = useSettings()

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
      >
        Configuración
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-20">
          <div className="absolute inset-0 bg-slate-900/30" onClick={() => setIsOpen(false)} />
          <aside className="absolute right-0 top-0 h-full w-80 max-w-full overflow-y-auto border-l border-slate-200 bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">Configuración</h2>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Cerrar configuración"
                className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 space-y-6">
              <div>
                <p className="text-sm font-medium text-slate-700">Departamentos y cargos</p>
                <p className="mt-1 text-xs text-slate-500">
                  "API" usa /api/employee/departments. "Calculado" los deriva del listado real de empleados.
                </p>
                <div className="mt-2">
                  <ToggleSwitch
                    leftLabel="API"
                    rightLabel="Calculado"
                    checked={useComputedDepartments}
                    onChange={setUseComputedDepartments}
                  />
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700">Listado de dispositivos</p>
                <p className="mt-1 text-xs text-slate-500">
                  "API" usa la respuesta real. "Simulada" muestra dispositivos de ejemplo.
                </p>
                <div className="mt-2">
                  <ToggleSwitch
                    leftLabel="API"
                    rightLabel="Simulada"
                    checked={useMockDevices}
                    onChange={setUseMockDevices}
                  />
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  )
}
