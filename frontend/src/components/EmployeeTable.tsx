import type { Employee } from '../services/employeeService'

interface EmployeeTableProps {
  employees: Employee[]
}

export function EmployeeTable({ employees }: EmployeeTableProps) {
  return (
    <table>
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Email</th>
          <th>Departamento</th>
          <th>Cargo</th>
        </tr>
      </thead>
      <tbody>
        {employees.map((employee) => (
          <tr key={employee.id ?? employee.email}>
            <td>{employee.name}</td>
            <td>{employee.email}</td>
            <td>{employee.department}</td>
            <td>{employee.position}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
