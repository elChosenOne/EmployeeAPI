import {
  getDepartments,
  getEmployees,
  getPositions,
  type Department,
  type Employee,
  type EmployeeFilters,
  type Position,
} from '../queries/employeeQueries'

export const employeeService = {
  async list(filters: EmployeeFilters = {}): Promise<Employee[]> {
    return getEmployees(filters)
  },

  async listDepartments(): Promise<Department[]> {
    return getDepartments()
  },

  async listPositions(departmentId: string): Promise<Position[]> {
    return getPositions(departmentId)
  },
}

export type { Department, Employee, EmployeeFilters, Position }
