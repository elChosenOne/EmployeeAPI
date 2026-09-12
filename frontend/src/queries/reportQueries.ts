import { authFetch } from './httpClient'

export type ReportJobStatus = 'Processing' | 'Completed'

export interface ReportResult {
  totalEmployees: number
  departments: number
}

export interface ReportJob {
  id: string
  status: ReportJobStatus
  createdAt: string
  completedAt: string | null
  result: ReportResult | null
}

interface ReportGenerateApiResponse {
  executionId: string
}

interface ReportJobApiResponse {
  id: string
  status: number
  createdAt: string
  completedAt: string | null
  result: ReportResult | null
}

// El backend serializa el enum ReportStatus como número (0 = Processing, 1 = Completed);
// se traduce acá para que el resto del frontend trabaje con los nombres del enum.
const REPORT_STATUS_BY_CODE: Record<number, ReportJobStatus> = {
  0: 'Processing',
  1: 'Completed',
}

export async function generateReport(signal?: AbortSignal): Promise<string> {
  const response = await authFetch('/api/report/generate', { method: 'POST', signal })
  const data = (await response.json()) as ReportGenerateApiResponse
  return data.executionId
}

export async function getReportStatus(executionId: string, signal?: AbortSignal): Promise<ReportJob> {
  const response = await authFetch(`/api/report/${executionId}/status`, { signal })
  const data = (await response.json()) as ReportJobApiResponse

  return {
    id: data.id,
    status: REPORT_STATUS_BY_CODE[data.status] ?? 'Processing',
    createdAt: data.createdAt,
    completedAt: data.completedAt,
    result: data.result,
  }
}
