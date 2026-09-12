import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Sin `test.globals` en la config, RTL no detecta un `afterEach` global para
// auto-limpiar el DOM entre tests; se registra a mano.
afterEach(cleanup)
