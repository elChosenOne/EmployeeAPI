import { useReportGeneration } from '../hooks/useReportGeneration'

export function ReportGenerator() {
  const { status, result, error, generate } = useReportGeneration()
  const isBusy = status === 'starting' || status === 'processing'

  return (
    <section className="mb-6 rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="text-base font-semibold text-slate-900">Reporte de empleados</h2>
      <button
        onClick={generate}
        disabled={isBusy}
        className="mt-3 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {isBusy ? 'Generando...' : 'Generar reporte'}
      </button>
      {isBusy && <p className="mt-2 text-sm text-slate-500">Generando reporte, esto puede tardar unos segundos...</p>}
      {status === 'error' && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
      {status === 'timeout' && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
      {status === 'completed' && result && (
        <ul className="mt-2 space-y-1 text-sm text-slate-700">
          <li>Total de empleados: {result.totalEmployees}</li>
          <li>Departamentos: {result.departments}</li>
        </ul>
      )}
    </section>
  )
}
