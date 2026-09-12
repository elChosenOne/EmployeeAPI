import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { EmployeeTable } from './EmployeeTable'
import { PaginationControls } from './PaginationControls'
import { useTableData } from '../managers/tableData'
import { employeeService, type Employee, type EmployeeFilters } from '../services/employeeService'

// Integra el manager real (useTableData -> useAsyncData + useListPagination) con
// los componentes reales de presentación, mockeando sólo el service (el borde
// de red), igual que lo haría EmployeesPage.
function EmployeeListHarness({ filters = {} }: { filters?: EmployeeFilters }) {
  const table = useTableData(employeeService.list, filters, { pageSize: 2 })

  return (
    <div>
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

function buildEmployee(overrides: Partial<Employee>): Employee {
  return {
    id: null,
    name: 'Empleado',
    email: 'empleado@example.com',
    department: 'Depto',
    position: 'Cargo',
    ...overrides,
  }
}

describe('EmployeeTable + useTableData', () => {
  it('muestra "Cargando..." y luego pinta sólo la primera página de filas', async () => {
    const employees = [
      buildEmployee({ id: '1', name: 'Ana', email: 'ana@example.com' }),
      buildEmployee({ id: '2', name: 'Beto', email: 'beto@example.com' }),
      buildEmployee({ id: '3', name: 'Cami', email: 'cami@example.com' }),
    ]
    vi.spyOn(employeeService, 'list').mockResolvedValue(employees)

    render(<EmployeeListHarness />)

    expect(screen.getByText('Cargando...')).toBeInTheDocument()

    await waitFor(() => expect(screen.getByText('Ana')).toBeInTheDocument())

    expect(screen.getByText('Beto')).toBeInTheDocument()
    expect(screen.queryByText('Cami')).not.toBeInTheDocument()
    expect(screen.getByText(/1-2 de 3/)).toBeInTheDocument()
  })

  it('avanza a la siguiente página al hacer click en "Siguiente"', async () => {
    const employees = [
      buildEmployee({ id: '1', name: 'Ana' }),
      buildEmployee({ id: '2', name: 'Beto' }),
      buildEmployee({ id: '3', name: 'Cami' }),
    ]
    vi.spyOn(employeeService, 'list').mockResolvedValue(employees)
    const user = userEvent.setup()

    render(<EmployeeListHarness />)

    await waitFor(() => expect(screen.getByText('Ana')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: 'Siguiente' }))

    expect(screen.getByText('Cami')).toBeInTheDocument()
    expect(screen.queryByText('Ana')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Siguiente' })).toBeDisabled()
  })

  it('muestra el mensaje de listado vacío cuando el service resuelve []', async () => {
    vi.spyOn(employeeService, 'list').mockResolvedValue([])

    render(<EmployeeListHarness />)

    await waitFor(() =>
      expect(screen.getByText('No hay empleados para mostrar.')).toBeInTheDocument(),
    )
    // Sólo queda la fila de encabezado; no se pinta ninguna fila de datos.
    expect(screen.getAllByRole('row')).toHaveLength(1)
  })

  it('muestra el error cuando el service rechaza la promesa', async () => {
    vi.spyOn(employeeService, 'list').mockRejectedValue(new Error('Backend caído'))

    render(<EmployeeListHarness />)

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Backend caído'))
  })
})
