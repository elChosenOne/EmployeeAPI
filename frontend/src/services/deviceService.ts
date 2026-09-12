import { getDevices, type Device } from '../queries/deviceQueries'

export const deviceService = {
  async list(): Promise<Device[]> {
    return getDevices()
  },
}

export type { Device }
