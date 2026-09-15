import { useEffect, useState } from 'react'
import type { AsyncDataStatus } from './asyncData'

export interface ServerPagination<T> {
  items: T[]
  status: AsyncDataStatus
  error: string | null
  isEmpty: boolean
  page: number
  pageSize: number
  canGoNext: boolean
  canGoPrev: boolean
  goToNext: () => void
  goToPrev: () => void
}

export interface UseServerPaginationOptions {
  enabled?: boolean
  errorMessage?: string
}

/**
 * Análogo a useTableData, pero para listados donde el servidor resuelve la
 * paginación (recibe page/pageSize y devuelve sólo esa porción): cambiar de
 * página o de pageSize dispara un nuevo fetch, a diferencia de
 * useListPagination que recorta en memoria un arreglo ya completo.
 *
 * El backend no expone X-Total-Count/X-Total-Pages via CORS, así que no hay
 * forma de mostrar un total real ni de saber cuántas páginas hay. Para
 * habilitar/deshabilitar "Siguiente" sin ese dato, además del fetch de la
 * página actual se hace una segunda petición "sonda": pageSize=1 en la
 * posición page*pageSize+1, es decir el primer elemento después del final de
 * la página actual. Si esa sonda devuelve algo, hay siguiente página.
 *
 * No sirve pedir directamente `pageSize + 1` en la página actual: el backend
 * calcula el offset como `(page - 1) * pageSize` usando ese mismo pageSize
 * enviado, así que inflar pageSize también corre el offset y devuelve una
 * ventana de datos incorrecta (verificado con curl contra /api/employee).
 * La sonda, al pedir sólo 1 elemento en un offset calculado aparte, no
 * interfiere con el fetch real.
 */
export function useServerPagination<T, F>(
  fetcher: (filters: F, page: number, pageSize: number) => Promise<T[]>,
  filters: F,
  pageSize: number,
  options: UseServerPaginationOptions = {},
): ServerPagination<T> {
  const { enabled = true, errorMessage = 'No se pudo cargar el listado.' } = options

  const [page, setPage] = useState(1)
  const [items, setItems] = useState<T[]>([])
  const [hasMore, setHasMore] = useState(false)
  const [status, setStatus] = useState<AsyncDataStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  const filtersKey = JSON.stringify(filters)

  // Un filtro o un pageSize nuevo invalida la página en la que se estaba.
  useEffect(() => {
    setPage(1)
  }, [filtersKey, pageSize])

  useEffect(() => {
    if (!enabled) {
      setStatus('idle')
      setError(null)
      return
    }

    let cancelled = false
    setStatus('loading')
    setError(null)

    Promise.all([fetcher(filters, page, pageSize), fetcher(filters, page * pageSize + 1, 1)])
      .then(([pageItems, probeItems]) => {
        if (cancelled) return
        setItems(pageItems)
        setHasMore(probeItems.length > 0)
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
  }, [fetcher, filtersKey, page, pageSize, enabled])

  return {
    items,
    status,
    error,
    isEmpty: status === 'ready' && items.length === 0,
    page,
    pageSize,
    canGoNext: hasMore,
    canGoPrev: page > 1,
    goToNext: () => setPage((current) => current + 1),
    goToPrev: () => setPage((current) => Math.max(1, current - 1)),
  }
}
