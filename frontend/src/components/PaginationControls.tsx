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
    <div>
      <button onClick={onPrev} disabled={!canGoPrev}>
        Anterior
      </button>
      <span>
        {firstItem}-{lastItem} de {totalItems} (página {page} de {totalPages})
      </span>
      <button onClick={onNext} disabled={!canGoNext}>
        Siguiente
      </button>
    </div>
  )
}
