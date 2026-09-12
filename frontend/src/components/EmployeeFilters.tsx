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
    <div>
      <label>
        Departamento
        <select
          value={selectedDepartmentId}
          onChange={(event) => onDepartmentChange(event.target.value)}
          disabled={isLoadingDepartments}
        >
          <option value="">Todos</option>
          {departments.map((department) => (
            <option key={department.id} value={department.id ?? ''}>
              {department.name}
            </option>
          ))}
        </select>
      </label>
      {isLoadingDepartments && <span> Cargando departamentos...</span>}
      {departmentsStatus === 'error' && <p role="alert">{departmentsError}</p>}
      {hasNoDepartments && <p>No hay departamentos disponibles.</p>}

      <label>
        Cargo
        <select
          value={selectedPositionName}
          onChange={(event) => onPositionChange(event.target.value)}
          disabled={!selectedDepartmentId || isLoadingPositions}
        >
          <option value="">Todos</option>
          {positions.map((position) => (
            <option key={position.id} value={position.name}>
              {position.name}
            </option>
          ))}
        </select>
      </label>
      {isLoadingPositions && <span> Cargando cargos...</span>}
      {positionsStatus === 'error' && <p role="alert">{positionsError}</p>}
      {hasNoPositions && <p>No hay cargos para el departamento seleccionado.</p>}
    </div>
  )
}
