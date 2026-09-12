import { authFetch } from './httpClient'

export interface Device {
  id: string | null
  name: string
  location: string
  timezone: string
}

interface DeviceApiResponse {
  id: string | null
  name: string
  location: string
  timezone: string
}

export async function getDevices(): Promise<Device[]> {
  const response = await authFetch('/api/device')
  const data = (await response.json()) as DeviceApiResponse[]

  return data.map((item) => ({
    id: item.id,
    name: item.name,
    location: item.location,
    timezone: item.timezone,
  }))
}
