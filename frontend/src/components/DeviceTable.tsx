import type { Device } from '../services/deviceService'

interface DeviceTableProps {
  devices: Device[]
}

export function DeviceTable({ devices }: DeviceTableProps) {
  return (
    <table>
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Ubicación</th>
          <th>Zona horaria</th>
        </tr>
      </thead>
      <tbody>
        {devices.map((device) => (
          <tr key={device.id ?? device.name}>
            <td>{device.name}</td>
            <td>{device.location}</td>
            <td>{device.timezone}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
