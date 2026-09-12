import { useState } from 'react'
import { EmployeeTable } from '../components/EmployeeTable'
import { EmployeeFilters } from '../components/EmployeeFilters'
import { PaginationControls } from '../components/PaginationControls'
import { ReportGenerator } from '../components/ReportGenerator'
import { useAsyncData } from '../managers/asyncData'
import { useTableData } from '../managers/tableData'
import { employeeService, type EmployeeFilters as EmployeeFiltersInput } from '../services/employeeService'

const EMPLOYEES_PAGE_SIZE = 20

export function EmployeesPage() {
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('')
  const [selectedPositionName, setSelectedPositionName] = useState('')

  const departments = useAsyncData(employeeService.listDepartments, undefined, {
    errorMessage: 'No se pudo cargar los departamentos.',
  })
  const positions = useAsyncData(employeeService.listPositions, selectedDepartmentId, {
    enabled: Boolean(selectedDepartmentId),
    errorMessage: 'No se pudo cargar los cargos.',
  })

  const departmentList = departments.data ?? []
  const positionList = positions.data ?? []

  const selectedDepartment = departmentList.find((department) => department.id === selectedDepartmentId)
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
      <ReportGenerator />
      <EmployeeFilters
        departments={departmentList}
        positions={positionList}
        departmentsStatus={departments.status}
        departmentsError={departments.error}
        positionsStatus={positions.status}
        positionsError={positions.error}
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
