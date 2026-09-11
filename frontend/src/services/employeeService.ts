import { getEmployees, type Employee } from '../queries/employeeQueries'

export const employeeService = {
  async list(): Promise<Employee[]> {
    return getEmployees()
  },
}

export type { Employee }
