import { generateReport, getReportStatus, type ReportJob, type ReportJobStatus, type ReportResult } from '../queries/reportQueries'

export const reportService = {
  async generate(signal?: AbortSignal): Promise<string> {
    return generateReport(signal)
  },

  async getStatus(executionId: string, signal?: AbortSignal): Promise<ReportJob> {
    return getReportStatus(executionId, signal)
  },
}

export type { ReportJob, ReportJobStatus, ReportResult }
