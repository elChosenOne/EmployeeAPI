interface PaginationControlsProps {
  page: number
  totalPages: number
  totalItems: number
  pageSize: number
  canGoNext: boolean
  canGoPrev: boolean
  onNext: () => void
  onPrev: () => void
}

export function PaginationControls({
  page,
  totalPages,
  totalItems,
  pageSize,
  canGoNext,
  canGoPrev,
  onNext,
  onPrev,
}: PaginationControlsProps) {
  if (totalItems === 0) return null

  const firstItem = (page - 1) * pageSize + 1
  const lastItem = Math.min(page * pageSize, totalItems)

  return (
    <div className="mt-4 flex items-center justify-between gap-4 text-sm">
      <button
        onClick={onPrev}
        disabled={!canGoPrev}
        className="rounded-md border border-slate-300 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Anterior
      </button>
      <span className="text-slate-600">
        {firstItem}-{lastItem} de {totalItems} (página {page} de {totalPages})
      </span>
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
