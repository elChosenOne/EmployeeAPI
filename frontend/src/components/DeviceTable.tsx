import type { Device } from '../services/deviceService'

interface DeviceTableProps {
  devices: Device[]
}

export function DeviceTable({ devices }: DeviceTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="w-full min-w-max border-collapse text-left text-sm">
        <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-2 font-medium">Nombre</th>
            <th className="px-4 py-2 font-medium">Ubicación</th>
            <th className="px-4 py-2 font-medium">Zona horaria</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {devices.map((device) => (
            <tr key={device.id ?? device.name} className="hover:bg-slate-50">
              <td className="px-4 py-2 text-slate-900">{device.name}</td>
              <td className="px-4 py-2 text-slate-600">{device.location}</td>
              <td className="px-4 py-2 text-slate-600">{device.timezone}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
