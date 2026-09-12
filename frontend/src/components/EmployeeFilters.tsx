import type { Department, Position } from '../services/employeeService'

interface EmployeeFiltersProps {
  departments: Department[]
  positions: Position[]
  selectedDepartmentId: string
  selectedPositionName: string
  onDepartmentChange: (departmentId: string) => void
  onPositionChange: (positionName: string) => void
}

export function EmployeeFilters({
  departments,
  positions,
  selectedDepartmentId,
  selectedPositionName,
  onDepartmentChange,
  onPositionChange,
}: EmployeeFiltersProps) {
  return (
    <div>
      <label>
        Departamento
        <select
          value={selectedDepartmentId}
          onChange={(event) => onDepartmentChange(event.target.value)}
        >
          <option value="">Todos</option>
          {departments.map((department) => (
            <option key={department.id} value={department.id ?? ''}>
              {department.name}
            </option>
          ))}
        </select>
      </label>

      <label>
        Cargo
        <select
          value={selectedPositionName}
          onChange={(event) => onPositionChange(event.target.value)}
          disabled={!selectedDepartmentId}
        >
          <option value="">Todos</option>
          {positions.map((position) => (
            <option key={position.id} value={position.name}>
              {position.name}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}
