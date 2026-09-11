import { authFetch } from './httpClient'

export interface Employee {
  id: string | null
  name: string
  email: string
  department: string
  position: string
}

interface EmployeeApiResponse {
  id: string | null
  name: string
  email: string
  department: string
  position: string
}

export async function getEmployees(): Promise<Employee[]> {
  const response = await authFetch('/api/employee')
  const data = (await response.json()) as EmployeeApiResponse[]

  return data.map((item) => ({
    id: item.id,
    name: item.name,
    email: item.email,
    department: item.department,
    position: item.position,
  }))
}
