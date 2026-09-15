import { getDevices, type Device } from '../queries/deviceQueries'

// Listado de prueba para cuando la API de dispositivos devuelve vacío en el
// ambiente actual y se quiere ver la tabla/paginación funcionando igual.
const MOCK_DEVICES: Device[] = [
  { id: 'mock-1', name: 'Reloj Biométrico 01', location: 'Recepción', timezone: 'America/Santiago' },
  { id: 'mock-2', name: 'Reloj Biométrico 02', location: 'Planta 1', timezone: 'America/Santiago' },
  { id: 'mock-3', name: 'Torniquete Principal', location: 'Entrada', timezone: 'America/Santiago' },
  { id: 'mock-4', name: 'Lector QR Bodega', location: 'Bodega', timezone: 'America/Santiago' },
  { id: 'mock-5', name: 'Reloj Biométrico 03', location: 'Planta 2', timezone: 'America/Santiago' },
]

export const deviceService = {
  async list(): Promise<Device[]> {
    return getDevices()
  },

  async listMock(): Promise<Device[]> {
    return MOCK_DEVICES
  },
}

export type { Device }
