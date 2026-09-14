import type { Employee } from '../services/employeeService'

interface EmployeeTableProps {
  employees: Employee[]
}

export function EmployeeTable({ employees }: EmployeeTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="w-full min-w-max border-collapse text-left text-sm">
        <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-2 font-medium">Nombre</th>
            <th className="px-4 py-2 font-medium">Email</th>
            <th className="px-4 py-2 font-medium">Departamento</th>
            <th className="px-4 py-2 font-medium">Cargo</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {employees.map((employee) => (
            <tr key={employee.id ?? employee.email} className="hover:bg-slate-50">
              <td className="px-4 py-2 text-slate-900">{employee.name}</td>
              <td className="px-4 py-2 text-slate-600">{employee.email}</td>
              <td className="px-4 py-2 text-slate-600">{employee.department}</td>
              <td className="px-4 py-2 text-slate-600">{employee.position}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
