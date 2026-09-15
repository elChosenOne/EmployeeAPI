import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DeviceTable } from './DeviceTable'
import { PaginationControls } from './PaginationControls'
import { useTableData } from '../managers/tableData'
import { deviceService, type Device } from '../services/deviceService'

// Mismo harness que EmployeeTable.test.tsx, con deviceService en vez de
// employeeService: prueba que useTableData (useAsyncData + useListPagination)
// es reutilizable sin cambios para un listado sin filtros.
function DeviceListHarness() {
  const table = useTableData(deviceService.list, undefined, { pageSize: 2 })

  return (
    <div>
      {table.status === 'loading' && <p>Cargando...</p>}
      {table.status === 'error' && <p role="alert">{table.error}</p>}
      {table.isEmpty && <p>No hay dispositivos para mostrar.</p>}
      <DeviceTable devices={table.items} />
      <PaginationControls
        page={table.page}
        pageItemCount={table.items.length}
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

function buildDevice(overrides: Partial<Device>): Device {
  return {
    id: null,
    name: 'Dispositivo',
    location: 'Ubicación',
    timezone: 'America/Santiago',
    ...overrides,
  }
}

describe('DeviceTable + useTableData', () => {
  it('muestra "Cargando..." y luego pinta sólo la primera página de filas', async () => {
    const devices = [
      buildDevice({ id: '1', name: 'Torniquete Norte' }),
      buildDevice({ id: '2', name: 'Torniquete Sur' }),
      buildDevice({ id: '3', name: 'Torniquete Este' }),
    ]
    vi.spyOn(deviceService, 'list').mockResolvedValue(devices)

    render(<DeviceListHarness />)

    expect(screen.getByText('Cargando...')).toBeInTheDocument()

    await waitFor(() => expect(screen.getByText('Torniquete Norte')).toBeInTheDocument())

    expect(screen.getByText('Torniquete Sur')).toBeInTheDocument()
    expect(screen.queryByText('Torniquete Este')).not.toBeInTheDocument()
    expect(screen.getByText(/1-2 de 3/)).toBeInTheDocument()
  })

  it('avanza a la siguiente página al hacer click en "Siguiente"', async () => {
    const devices = [
      buildDevice({ id: '1', name: 'Torniquete Norte' }),
      buildDevice({ id: '2', name: 'Torniquete Sur' }),
      buildDevice({ id: '3', name: 'Torniquete Este' }),
    ]
    vi.spyOn(deviceService, 'list').mockResolvedValue(devices)
    const user = userEvent.setup()

    render(<DeviceListHarness />)

    await waitFor(() => expect(screen.getByText('Torniquete Norte')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: 'Siguiente' }))

    expect(screen.getByText('Torniquete Este')).toBeInTheDocument()
    expect(screen.queryByText('Torniquete Norte')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Siguiente' })).toBeDisabled()
  })

  it('muestra el mensaje de listado vacío cuando el service resuelve []', async () => {
    vi.spyOn(deviceService, 'list').mockResolvedValue([])

    render(<DeviceListHarness />)

    await waitFor(() =>
      expect(screen.getByText('No hay dispositivos para mostrar.')).toBeInTheDocument(),
    )
    expect(screen.getAllByRole('row')).toHaveLength(1)
  })

  it('muestra el error cuando el service rechaza la promesa', async () => {
    vi.spyOn(deviceService, 'list').mockRejectedValue(new Error('Backend caído'))

    render(<DeviceListHarness />)

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Backend caído'))
  })
})
