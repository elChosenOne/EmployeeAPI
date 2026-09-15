import { useEffect, useState } from 'react'
import { EmployeeTable } from '../components/EmployeeTable'
import { EmployeeFilters } from '../components/EmployeeFilters'
import { PaginationControls } from '../components/PaginationControls'
import { ReportGenerator } from '../components/ReportGenerator'
import { useSettings } from '../hooks/useSettings'
import { useAsyncData } from '../managers/asyncData'
import { useServerPagination } from '../managers/serverPagination'
import { useTableData } from '../managers/tableData'
import { employeeService, type EmployeeFilters as EmployeeFiltersInput } from '../services/employeeService'

const DEFAULT_PAGE_SIZE = 20
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

export function EmployeesPage() {
  const { useComputedDepartments, useComputedPagination } = useSettings()
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('')
  const [selectedPositionName, setSelectedPositionName] = useState('')
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)

  // Los ids de departamento/cargo cambian de forma (id real vs. nombre
  // calculado) al togglear la fuente, así que la selección previa deja de
  // ser válida y hay que limpiarla.
  useEffect(() => {
    setSelectedDepartmentId('')
    setSelectedPositionName('')
  }, [useComputedDepartments])

  const departmentsFetcher = useComputedDepartments
    ? employeeService.listDepartmentsComputed
    : employeeService.listDepartments
  const positionsFetcher = useComputedDepartments
    ? employeeService.listPositionsComputed
    : employeeService.listPositions

  const departments = useAsyncData(departmentsFetcher, undefined, {
    errorMessage: 'No se pudo cargar los departamentos.',
  })
  const positions = useAsyncData(positionsFetcher, selectedDepartmentId, {
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

  const clientTable = useTableData(employeeService.list, employeeFilters, {
    pageSize,
    errorMessage: 'No se pudo cargar el listado.',
    enabled: useComputedPagination,
  })
  const serverTable = useServerPagination(employeeService.listPaged, employeeFilters, pageSize, {
    errorMessage: 'No se pudo cargar el listado.',
    enabled: !useComputedPagination,
  })
  const table = useComputedPagination ? clientTable : serverTable

  function handleDepartmentChange(departmentId: string) {
    setSelectedDepartmentId(departmentId)
    setSelectedPositionName('')
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold text-slate-900">Empleados</h1>
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
      {table.status === 'loading' && <p className="text-sm text-slate-500">Cargando...</p>}
      {table.status === 'error' && (
        <p role="alert" className="text-sm text-red-600">
          {table.error}
        </p>
      )}
      {table.isEmpty && <p className="text-sm text-slate-500">No hay empleados para mostrar.</p>}
      <EmployeeTable employees={table.items} />
      <PaginationControls
        page={table.page}
        pageItemCount={table.items.length}
        totalPages={useComputedPagination ? clientTable.totalPages : null}
        totalItems={useComputedPagination ? clientTable.totalItems : null}
        pageSize={table.pageSize}
        canGoNext={table.canGoNext}
        canGoPrev={table.canGoPrev}
        onNext={table.goToNext}
        onPrev={table.goToPrev}
        onPageChange={useComputedPagination ? clientTable.goToPage : undefined}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
        onPageSizeChange={setPageSize}
      />
    </div>
  )
}
