import { useAsyncData, type AsyncDataStatus } from './asyncData'
import { useListPagination, type ListPage } from './listPagination'

export type TableDataStatus = AsyncDataStatus

export interface TableData<T> extends Omit<ListPage<T>, 'pageItems'> {
  items: T[]
  status: TableDataStatus
  error: string | null
  isEmpty: boolean
}

export interface UseTableDataOptions {
  pageSize?: number
  enabled?: boolean
  errorMessage?: string
}

/**
 * Coordina fetch (vía un service) + filtros activos para cualquier listado
 * tabular, y delega la navegación de páginas a useListPagination. No sabe
 * nada de employees/devices/etc.: recibe el fetcher y el objeto de filtros
 * ya armados por el caller. El fetch + estados idle/loading/error/ready se
 * delegan a useAsyncData; acá sólo se suma la paginación.
 */
export function useTableData<T, F>(
  fetcher: (filters: F) => Promise<T[]>,
  filters: F,
  options: UseTableDataOptions = {},
): TableData<T> {
  const { pageSize = 20, enabled = true, errorMessage = 'No se pudo cargar el listado.' } = options

  const { data, status, error } = useAsyncData(fetcher, filters, { enabled, errorMessage })
  const allItems = data ?? []

  // useListPagination resetea a la página 1 cuando allItems cambia de referencia
  // (nuevo fetch), igual que antes lo hacía este hook a mano.
  const pagination = useListPagination(allItems, pageSize)

  return {
    items: pagination.pageItems,
    status,
    error,
    isEmpty: status === 'ready' && pagination.totalItems === 0,
    page: pagination.page,
    pageSize: pagination.pageSize,
    totalItems: pagination.totalItems,
    totalPages: pagination.totalPages,
    canGoNext: pagination.canGoNext,
    canGoPrev: pagination.canGoPrev,
    goToNext: pagination.goToNext,
    goToPrev: pagination.goToPrev,
    goToPage: pagination.goToPage,
  }
}
