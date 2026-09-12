import type { AsyncDataStatus } from '../managers/asyncData'
import type { Department, Position } from '../services/employeeService'

interface EmployeeFiltersProps {
  departments: Department[]
  positions: Position[]
  departmentsStatus: AsyncDataStatus
  departmentsError: string | null
  positionsStatus: AsyncDataStatus
  positionsError: string | null
  selectedDepartmentId: string
  selectedPositionName: string
  onDepartmentChange: (departmentId: string) => void
  onPositionChange: (positionName: string) => void
}

export function EmployeeFilters({
  departments,
  positions,
  departmentsStatus,
  departmentsError,
  positionsStatus,
  positionsError,
  selectedDepartmentId,
  selectedPositionName,
  onDepartmentChange,
  onPositionChange,
}: EmployeeFiltersProps) {
  const isLoadingDepartments = departmentsStatus === 'loading'
  const isLoadingPositions = positionsStatus === 'loading'
  const hasNoDepartments = departmentsStatus === 'ready' && departments.length === 0
  const hasNoPositions = positionsStatus === 'ready' && selectedDepartmentId !== '' && positions.length === 0

  return (
    <div className="mb-4 flex flex-wrap items-start gap-6 rounded-lg border border-slate-200 bg-white p-4">
      <div>
        <label className="block text-sm font-medium text-slate-700">
          Departamento
          <select
            value={selectedDepartmentId}
            onChange={(event) => onDepartmentChange(event.target.value)}
            disabled={isLoadingDepartments}
            className="mt-1 block w-56 rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
          >
            <option value="">Todos</option>
            {departments.map((department) => (
              <option key={department.id} value={department.id ?? ''}>
                {department.name}
              </option>
            ))}
          </select>
        </label>
        {isLoadingDepartments && <span className="mt-1 block text-xs text-slate-500"> Cargando departamentos...</span>}
        {departmentsStatus === 'error' && (
          <p role="alert" className="mt-1 text-xs text-red-600">
            {departmentsError}
          </p>
        )}
        {hasNoDepartments && <p className="mt-1 text-xs text-slate-500">No hay departamentos disponibles.</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Cargo
          <select
            value={selectedPositionName}
            onChange={(event) => onPositionChange(event.target.value)}
            disabled={!selectedDepartmentId || isLoadingPositions}
            className="mt-1 block w-56 rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
          >
            <option value="">Todos</option>
            {positions.map((position) => (
              <option key={position.id} value={position.name}>
                {position.name}
              </option>
            ))}
          </select>
        </label>
        {isLoadingPositions && <span className="mt-1 block text-xs text-slate-500"> Cargando cargos...</span>}
        {positionsStatus === 'error' && (
          <p role="alert" className="mt-1 text-xs text-red-600">
            {positionsError}
          </p>
        )}
        {hasNoPositions && <p className="mt-1 text-xs text-slate-500">No hay cargos para el departamento seleccionado.</p>}
      </div>
    </div>
  )
}
