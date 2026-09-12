import { useReportGeneration } from '../hooks/useReportGeneration'

export function ReportGenerator() {
  const { status, result, error, generate } = useReportGeneration()
  const isBusy = status === 'starting' || status === 'processing'

  return (
    <section>
      <h2>Reporte de empleados</h2>
      <button onClick={generate} disabled={isBusy}>
        {isBusy ? 'Generando...' : 'Generar reporte'}
      </button>
      {isBusy && <p>Generando reporte, esto puede tardar unos segundos...</p>}
      {status === 'error' && <p role="alert">{error}</p>}
      {status === 'timeout' && <p role="alert">{error}</p>}
      {status === 'completed' && result && (
        <ul>
          <li>Total de empleados: {result.totalEmployees}</li>
          <li>Departamentos: {result.departments}</li>
        </ul>
      )}
    </section>
  )
}
