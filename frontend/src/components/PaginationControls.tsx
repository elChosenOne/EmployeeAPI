interface PaginationControlsProps {
  page: number
  pageItemCount: number
  pageSize: number
  // Ausentes cuando el total no se puede conocer sin el backend (ver
  // useServerPagination): en ese caso se omite "de Z"/"de M" del resumen y
  // no se pintan los botones de número de página (no hay cómo enumerarlas).
  totalItems?: number | null
  totalPages?: number | null
  canGoNext: boolean
  canGoPrev: boolean
  onNext: () => void
  onPrev: () => void
  onPageChange?: (page: number) => void
  pageSizeOptions?: number[]
  onPageSizeChange?: (pageSize: number) => void
}

const ELLIPSIS = 'ellipsis' as const

// Ventana de páginas alrededor de la actual + primera/última, con "…" para
// los huecos. Con `total` chico (<= 2*siblingCount + 5) se listan todas.
function getPageNumbers(current: number, total: number, siblingCount = 1): (number | typeof ELLIPSIS)[] {
  if (total <= siblingCount * 2 + 5) {
    return Array.from({ length: total }, (_, index) => index + 1)
  }

  const left = Math.max(current - siblingCount, 2)
  const right = Math.min(current + siblingCount, total - 1)

  const pages: (number | typeof ELLIPSIS)[] = [1]
  if (left > 2) pages.push(ELLIPSIS)
  for (let p = left; p <= right; p++) pages.push(p)
  if (right < total - 1) pages.push(ELLIPSIS)
  pages.push(total)

  return pages
}

export function PaginationControls({
  page,
  pageItemCount,
  pageSize,
  totalItems,
  totalPages,
  canGoNext,
  canGoPrev,
  onNext,
  onPrev,
  onPageChange,
  pageSizeOptions,
  onPageSizeChange,
}: PaginationControlsProps) {
  if (pageItemCount === 0) return null

  const firstItem = (page - 1) * pageSize + 1
  const lastItem = firstItem + pageItemCount - 1
  const summary =
    totalItems != null && totalPages != null
      ? `${firstItem}-${lastItem} de ${totalItems} (página ${page} de ${totalPages})`
      : `${firstItem}-${lastItem} (página ${page})`

  return (
    <div className="mt-4 flex flex-col gap-3 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {pageSizeOptions && onPageSizeChange && (
          <label className="flex items-center gap-2 text-slate-600">
            Por página
            <select
              value={pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              className="rounded-md border border-slate-300 px-2 py-1 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        )}
        <button
          onClick={onPrev}
          disabled={!canGoPrev}
          className="rounded-md border border-slate-300 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Anterior
        </button>
        <span className="text-slate-600">{summary}</span>
        <button
          onClick={onNext}
          disabled={!canGoNext}
          className="rounded-md border border-slate-300 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>

      {totalPages != null && onPageChange && (
        <div className="flex flex-wrap items-center justify-center gap-1">
          {getPageNumbers(page, totalPages).map((entry, index) =>
            entry === ELLIPSIS ? (
              <span key={`ellipsis-${index}`} className="px-1.5 text-slate-400">
                …
              </span>
            ) : (
              <button
                key={entry}
                onClick={() => onPageChange(entry)}
                disabled={entry === page}
                aria-current={entry === page ? 'page' : undefined}
                className={`min-w-8 rounded-md px-2 py-1 font-medium ${
                  entry === page
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {entry}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  )
}
