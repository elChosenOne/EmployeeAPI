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

  // Deriva departamentos/cargos a partir del listado real de empleados, en
  // lugar de /api/employee/departments (que en el ambiente de prueba sólo
  // devuelve "Departamento Test" y no refleja los departamentos que sí
  // aparecen en los empleados). El "id" es el propio nombre: no hay un id
  // real que mapear, y el filtro de empleados ya se hace por nombre.
  async listDepartmentsComputed(): Promise<Department[]> {
    const employees = await getEmployees({})
    const names = Array.from(new Set(employees.map((employee) => employee.department))).sort()
    return names.map((name) => ({ id: name, name }))
  },

  async listPositionsComputed(departmentName: string): Promise<Position[]> {
    const employees = await getEmployees({ departmentName })
    const names = Array.from(new Set(employees.map((employee) => employee.position))).sort()
    return names.map((name) => ({ id: name, name, departmentId: departmentName }))
  },
}

export type { Department, Employee, EmployeeFilters, Position }
