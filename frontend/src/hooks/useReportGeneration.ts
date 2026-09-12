import { useCallback, useEffect, useRef, useState } from 'react'
import { reportService, type ReportResult } from '../services/reportService'

const INITIAL_POLL_INTERVAL_MS = 1000
const MAX_POLL_INTERVAL_MS = 8000
const POLL_BACKOFF_FACTOR = 1.5
const MAX_POLL_DURATION_MS = 60000

export type ReportGenerationStatus = 'idle' | 'starting' | 'processing' | 'completed' | 'error' | 'timeout'

export interface UseReportGeneration {
  status: ReportGenerationStatus
  result: ReportResult | null
  error: string | null
  generate: () => void
}

function isAbortError(err: unknown): boolean {
  return err instanceof DOMException && err.name === 'AbortError'
}

/**
 * Orquesta "generar reporte -> pollear estado -> mostrar resultado".
 * El intervalo de polling crece con backoff progresivo (1s -> 8s tope) para no
 * saturar al backend en jobs largos, y se corta con un timeout global (60s) si
 * el job nunca llega a Completed. El polling en curso se cancela (clearTimeout +
 * AbortController) si el componente se desmonta o si se dispara una nueva
 * generación antes de que la anterior termine.
 */
export function useReportGeneration(): UseReportGeneration {
  const [status, setStatus] = useState<ReportGenerationStatus>('idle')
  const [result, setResult] = useState<ReportResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [executionId, setExecutionId] = useState<string | null>(null)

  const generateControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    return () => {
      generateControllerRef.current?.abort()
    }
  }, [])

  const generate = useCallback(() => {
    generateControllerRef.current?.abort()
    const controller = new AbortController()
    generateControllerRef.current = controller

    setStatus('starting')
    setError(null)
    setResult(null)
    setExecutionId(null)

    reportService
      .generate(controller.signal)
      .then((id) => {
        if (controller.signal.aborted) return
        setExecutionId(id)
        setStatus('processing')
      })
      .catch((err) => {
        if (controller.signal.aborted || isAbortError(err)) return
        setError(err instanceof Error ? err.message : 'No se pudo iniciar la generación del reporte.')
        setStatus('error')
      })
  }, [])

  useEffect(() => {
    if (!executionId) return

    const id = executionId
    const controller = new AbortController()
    const startedAt = Date.now()
    let interval = INITIAL_POLL_INTERVAL_MS
    let timeoutId: ReturnType<typeof setTimeout>

    function poll() {
      reportService
        .getStatus(id, controller.signal)
        .then((job) => {
          if (job.status === 'Completed') {
            setResult(job.result)
            setStatus('completed')
            return
          }

          if (Date.now() - startedAt >= MAX_POLL_DURATION_MS) {
            setStatus('timeout')
            setError('El reporte no terminó de generarse a tiempo. Intentalo nuevamente.')
            return
          }

          interval = Math.min(interval * POLL_BACKOFF_FACTOR, MAX_POLL_INTERVAL_MS)
          timeoutId = setTimeout(poll, interval)
        })
        .catch((err) => {
          if (isAbortError(err)) return
          setError(err instanceof Error ? err.message : 'No se pudo consultar el estado del reporte.')
          setStatus('error')
        })
    }

    timeoutId = setTimeout(poll, interval)

    return () => {
      controller.abort()
      clearTimeout(timeoutId)
    }
  }, [executionId])

  return { status, result, error, generate }
}
