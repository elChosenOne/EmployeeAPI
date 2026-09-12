import { useEffect, useState } from 'react'
import { useListPagination, type ListPage } from './listPagination'

export type TableDataStatus = 'idle' | 'loading' | 'error' | 'ready'

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
 * ya armados por el caller.
 */
export function useTableData<T, F>(
  fetcher: (filters: F) => Promise<T[]>,
  filters: F,
  options: UseTableDataOptions = {},
): TableData<T> {
  const { pageSize = 20, enabled = true, errorMessage = 'No se pudo cargar el listado.' } = options

  const [allItems, setAllItems] = useState<T[]>([])
  const [status, setStatus] = useState<TableDataStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  // Los filtros llegan como objeto literal recreado en cada render del caller;
  // se comparan por valor (no por referencia) para no refetchear en cada render.
  const filtersKey = JSON.stringify(filters)

  useEffect(() => {
    if (!enabled) return

    let cancelled = false
    setStatus('loading')
    setError(null)

    fetcher(filters)
      .then((result) => {
        if (cancelled) return
        setAllItems(result)
        setStatus('ready')
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : errorMessage)
        setStatus('error')
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher, filtersKey, enabled])

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
