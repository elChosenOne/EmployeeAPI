import { DeviceTable } from '../components/DeviceTable'
import { PaginationControls } from '../components/PaginationControls'
import { useTableData } from '../managers/tableData'
import { deviceService } from '../services/deviceService'

const DEVICES_PAGE_SIZE = 20

export function DevicesPage() {
  const table = useTableData(deviceService.list, undefined, {
    pageSize: DEVICES_PAGE_SIZE,
    errorMessage: 'No se pudo cargar el listado.',
  })

  return (
    <div>
      {table.status === 'loading' && <p>Cargando...</p>}
      {table.status === 'error' && <p role="alert">{table.error}</p>}
      {table.isEmpty && <p>No hay dispositivos para mostrar.</p>}
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
