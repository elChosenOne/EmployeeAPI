import { useEffect, useMemo, useState } from 'react'

export interface ListPage<T> {
  pageItems: T[]
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
  canGoNext: boolean
  canGoPrev: boolean
  goToNext: () => void
  goToPrev: () => void
  goToPage: (page: number) => void
}

function clampPage(page: number, totalPages: number): number {
  return Math.min(Math.max(1, page), totalPages)
}

export function paginate<T>(items: T[], page: number, pageSize: number): Omit<ListPage<T>, 'goToNext' | 'goToPrev' | 'goToPage'> {
  const totalItems = items.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const safePage = clampPage(page, totalPages)
  const start = (safePage - 1) * pageSize

  return {
    pageItems: items.slice(start, start + pageSize),
    page: safePage,
    pageSize,
    totalItems,
    totalPages,
    canGoNext: safePage < totalPages,
    canGoPrev: safePage > 1,
  }
}

export function useListPagination<T>(items: T[], pageSize = 20): ListPage<T> {
  const [page, setPage] = useState(1)

  useEffect(() => {
    setPage(1)
  }, [items])

  const result = useMemo(() => paginate(items, page, pageSize), [items, page, pageSize])

  return {
    ...result,
    goToNext: () => setPage((current) => clampPage(current + 1, result.totalPages)),
    goToPrev: () => setPage((current) => clampPage(current - 1, result.totalPages)),
    goToPage: (target: number) => setPage(clampPage(target, result.totalPages)),
  }
}
