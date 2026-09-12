import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { EmployeeTable } from '../components/EmployeeTable'
import { EmployeeFilters } from '../components/EmployeeFilters'
import { PaginationControls } from '../components/PaginationControls'
import { useTableData } from '../managers/tableData'
import { employeeService, type Department, type EmployeeFilters as EmployeeFiltersInput, type Position } from '../services/employeeService'

const EMPLOYEES_PAGE_SIZE = 20

export function EmployeesPage() {
  const { logout } = useAuth()
  const [departments, setDepartments] = useState<Department[]>([])
  const [positions, setPositions] = useState<Position[]>([])
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('')
  const [selectedPositionName, setSelectedPositionName] = useState('')
  const [filterError, setFilterError] = useState<string | null>(null)

  useEffect(() => {
    employeeService
      .listDepartments()
      .then(setDepartments)
      .catch((err) => setFilterError(err instanceof Error ? err.message : 'No se pudo cargar los departamentos.'))
  }, [])

  useEffect(() => {
    if (!selectedDepartmentId) {
      setPositions([])
      return
    }

    employeeService
      .listPositions(selectedDepartmentId)
      .then(setPositions)
      .catch((err) => setFilterError(err instanceof Error ? err.message : 'No se pudo cargar los cargos.'))
  }, [selectedDepartmentId])

  const selectedDepartment = departments.find((department) => department.id === selectedDepartmentId)
  const employeeFilters: EmployeeFiltersInput = {
    departmentName: selectedDepartment?.name,
    positionName: selectedPositionName || undefined,
  }

  const table = useTableData(employeeService.list, employeeFilters, {
    pageSize: EMPLOYEES_PAGE_SIZE,
    errorMessage: 'No se pudo cargar el listado.',
  })

  function handleDepartmentChange(departmentId: string) {
    setSelectedDepartmentId(departmentId)
    setSelectedPositionName('')
  }

  return (
    <div>
      <p>Sesión iniciada.</p>
      <button onClick={logout}>Cerrar sesión</button>
      {filterError && <p role="alert">{filterError}</p>}
      <EmployeeFilters
        departments={departments}
        positions={positions}
        selectedDepartmentId={selectedDepartmentId}
        selectedPositionName={selectedPositionName}
        onDepartmentChange={handleDepartmentChange}
        onPositionChange={setSelectedPositionName}
      />
      {table.status === 'loading' && <p>Cargando...</p>}
      {table.status === 'error' && <p role="alert">{table.error}</p>}
      {table.isEmpty && <p>No hay empleados para mostrar.</p>}
      <EmployeeTable employees={table.items} />
      <PaginationControls
        page={table.page}
        totalPages={table.totalPages}
        totalItems={table.totalItems}
        pageSize={table.pageSize}
        canGoNext={table.canGoNext}
        canGoPrev={table.canGoPrev}
        onNext={table.goToNext}
        onPrev={table.goToPrev}
      />
    </div>
  )
}
