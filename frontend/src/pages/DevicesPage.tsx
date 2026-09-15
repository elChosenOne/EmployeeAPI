import { DeviceTable } from '../components/DeviceTable'
import { PaginationControls } from '../components/PaginationControls'
import { useSettings } from '../hooks/useSettings'
import { useTableData } from '../managers/tableData'
import { deviceService } from '../services/deviceService'

const DEVICES_PAGE_SIZE = 20

export function DevicesPage() {
  const { useMockDevices } = useSettings()
  const fetcher = useMockDevices ? deviceService.listMock : deviceService.list

  const table = useTableData(fetcher, undefined, {
    pageSize: DEVICES_PAGE_SIZE,
    errorMessage: 'No se pudo cargar el listado.',
  })

  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold text-slate-900">Dispositivos</h1>
      {table.status === 'loading' && <p className="text-sm text-slate-500">Cargando...</p>}
      {table.status === 'error' && (
        <p role="alert" className="text-sm text-red-600">
          {table.error}
        </p>
      )}
      {table.isEmpty && <p className="text-sm text-slate-500">No hay dispositivos para mostrar.</p>}
      <DeviceTable devices={table.items} />
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
