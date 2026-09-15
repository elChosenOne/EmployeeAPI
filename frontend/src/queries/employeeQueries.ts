import { authFetch } from './httpClient'

export interface Employee {
  id: string | null
  name: string
  email: string
  department: string
  position: string
}

export interface EmployeeFilters {
  departmentName?: string
  positionName?: string
}

export interface Department {
  id: string | null
  name: string
}

export interface Position {
  id: string | null
  name: string
  departmentId: string
}

interface EmployeeApiResponse {
  id: string | null
  name: string
  email: string
  department: string
  position: string
}

interface DepartmentApiResponse {
  id: string | null
  name: string
}

interface PositionApiResponse {
  id: string | null
  name: string
  departmentId: string
}

function buildEmployeeQuery(filters: EmployeeFilters, page?: number, pageSize?: number): string {
  const params = new URLSearchParams()
  if (filters.departmentName) params.set('departmentName', filters.departmentName)
  if (filters.positionName) params.set('positionName', filters.positionName)
  if (page) params.set('page', String(page))
  if (pageSize) params.set('pageSize', String(pageSize))

  const query = params.toString()
  return query ? `?${query}` : ''
}

function toEmployee(item: EmployeeApiResponse): Employee {
  return {
    id: item.id,
    name: item.name,
    email: item.email,
    department: item.department,
    position: item.position,
  }
}

export async function getEmployees(filters: EmployeeFilters = {}): Promise<Employee[]> {
  const response = await authFetch(`/api/employee${buildEmployeeQuery(filters)}`)
  const data = (await response.json()) as EmployeeApiResponse[]

  return data.map(toEmployee)
}

// Pide sólo una página al servidor (params page/pageSize), a diferencia de
// getEmployees que siempre trae el listado completo. El backend sí calcula
// X-Total-Count/X-Total-Pages, pero no los expone via CORS
// (Access-Control-Expose-Headers), así que fetch() no puede leerlos: no hay
// forma de saber el total real de páginas sin tocar el backend.
export async function getEmployeesPaged(filters: EmployeeFilters, page: number, pageSize: number): Promise<Employee[]> {
  const response = await authFetch(`/api/employee${buildEmployeeQuery(filters, page, pageSize)}`)
  const data = (await response.json()) as EmployeeApiResponse[]

  return data.map(toEmployee)
}

export async function getDepartments(): Promise<Department[]> {
  const response = await authFetch('/api/employee/departments')
  const data = (await response.json()) as DepartmentApiResponse[]

  return data.map((item) => ({ id: item.id, name: item.name }))
}

export async function getPositions(departmentId: string): Promise<Position[]> {
  const response = await authFetch(`/api/employee/departments/${departmentId}/positions`)
  const data = (await response.json()) as PositionApiResponse[]

  return data.map((item) => ({ id: item.id, name: item.name, departmentId: item.departmentId }))
}
