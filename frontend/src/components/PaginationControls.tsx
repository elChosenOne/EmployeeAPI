interface PaginationControlsProps {
  page: number
  pageItemCount: number
  pageSize: number
  // Ausentes cuando el total no se puede conocer sin el backend (ver
  // useServerPagination): en ese caso se omite "de Z"/"de M" del resumen.
  totalItems?: number | null
  totalPages?: number | null
  canGoNext: boolean
  canGoPrev: boolean
  onNext: () => void
  onPrev: () => void
  pageSizeOptions?: number[]
  onPageSizeChange?: (pageSize: number) => void
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
    <div className="mt-4 flex flex-wrap items-center justify-between gap-4 text-sm">
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
  )
}
