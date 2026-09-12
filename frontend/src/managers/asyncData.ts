import { useEffect, useState } from 'react'

export type AsyncDataStatus = 'idle' | 'loading' | 'error' | 'ready'

export interface AsyncData<T> {
  data: T | null
  status: AsyncDataStatus
  error: string | null
}

export interface UseAsyncDataOptions {
  enabled?: boolean
  errorMessage?: string
}

/**
 * Fetch (vía un service) + estados idle/loading/error/ready para cualquier
 * dato async, sin asumir forma de lista ni paginación. `useTableData` lo usa
 * como base y le suma paginación; para fetches simples (selects, detalles)
 * se usa directo.
 */
export function useAsyncData<T, F>(
  fetcher: (filters: F) => Promise<T>,
  filters: F,
  options: UseAsyncDataOptions = {},
): AsyncData<T> {
  const { enabled = true, errorMessage = 'No se pudo cargar la información.' } = options

  const [data, setData] = useState<T | null>(null)
  const [status, setStatus] = useState<AsyncDataStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  const filtersKey = JSON.stringify(filters)

  useEffect(() => {
    if (!enabled) {
      setData(null)
      setStatus('idle')
      setError(null)
      return
    }

    let cancelled = false
    setStatus('loading')
    setError(null)

    fetcher(filters)
      .then((result) => {
        if (cancelled) return
        setData(result)
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

  return { data, status, error }
}
