## Preguntas de arquitectura del challenge

### 4.a — Estrategia anti-sobrecarga de la tabla de empleados

`GET /api/employee` se consume sin `page`/`pageSize` (requisito del challenge), por lo que el cliente recibe el listado completo en una sola respuesta. Para evitar renderizar todas las filas de una vez, la tabla no pinta el arreglo completo: un manager genérico (`frontend/src/managers/listPagination.ts`, hook `useListPagination<T>`) recorta el arreglo en memoria y le entrega a la tabla sólo la "página" actual. Los controles (`frontend/src/components/PaginationControls.tsx`) sólo saben mostrar `Anterior`/`Siguiente` y el rango visible; no conocen el dominio (empleados, dispositivos, etc.), por lo que el mismo manager sirve para el listado opcional de dispositivos.

Se evaluaron dos enfoques:

| Enfoque | Cómo acota el DOM | Memoria JS | UX | Mantenimiento |
|---|---|---|---|---|
| **Paginación por slicing en memoria** (elegido) | Sólo monta `pageSize` filas por vez (`array.slice`) | Igual en ambos casos: el arreglo completo ya vive en el estado de React tras el fetch | Navegación discreta ("página X de Y"), predecible, fácil de escanear/comparar filas | Sin dependencias nuevas; lógica trivial de testear (función pura `paginate`) |
| **Windowing/virtualización (ej. `react-window`)** | Monta sólo las filas visibles en el viewport + buffer, recalculando en cada scroll | Igual — la virtualización no reduce el arreglo en memoria, sólo el DOM montado | Scroll continuo, se siente más "fluido" para listas largas, pero pierde la noción de página y complica deep-linking/scroll-restore | Requiere agregar y mantener una librería, manejar altura fija/variable de fila, y reforzar accesibilidad (roles ARIA de grilla) que el navegador da gratis con `<table>` |

Nota: no se consideró "carga incremental" tipo scroll infinito (ir agregando páginas al DOM sin desmontar las anteriores) porque, al no haber paginación real en el servidor para este endpoint, no reduce el trabajo de red (ya se trajo todo en un solo request) y sólo agrega complejidad (IntersectionObserver, acumulación de estado) sin beneficio de memoria si no se combina con virtualización.

**Por qué paginación por slicing:** acota el tamaño del DOM montado exactamente igual que la virtualización (sólo se renderizan `pageSize` filas), pero sin sumar una dependencia nueva ni lógica de medición de alto de fila — consistente con el criterio del proyecto de no introducir librerías hasta que haga falta. Para un volumen de datos moderado (cientos a pocos miles de empleados) esto es suficiente; si el dataset creciera a decenas de miles de filas por respuesta, ahí sí virtualización dejaría de ser opcional.

**Plus opcional — comparación con la paginación real del backend (`page`/`pageSize` + headers `X-Total-Count`/`X-Total-Pages`):** el backend ya soporta paginación real (usada explícitamente para el requisito 2, que pide *no* usarla), donde el servidor devuelve sólo una porción y el total viene en headers. Esa variante conviene cuando:
- El dataset es grande y transferir todo el listado en un solo request es costoso en red/tiempo de respuesta.
- Los filtros/orden también se resuelven en el servidor (evita traer registros que nunca se van a mostrar).

La paginación 100% cliente (la implementada acá) conviene cuando:
- El endpoint no pagina (como en este ejercicio) o el dataset es chico/mediano y cabe cómodo en memoria.
- Se quiere filtrar/ordenar sin latencia de red en cada interacción, porque los datos ya están todos en el cliente.
- Se prioriza simplicidad: no hay que sincronizar número de página, filtros y contadores entre cliente y servidor, ni manejar carreras entre requests al cambiar de página rápido.

El costo de la paginación cliente es que cada carga inicial trae el listado completo (más payload/memoria por request) y no escala indefinidamente; a partir de cierto volumen, la paginación real del backend (con sus headers `X-Total-Count`/`X-Total-Pages`) es la opción correcta.

### 4.b — Polling del reporte asíncrono (`POST /api/report/generate` + `GET /api/report/{id}/status`)

El endpoint `POST /api/report/generate` devuelve `202 Accepted` con un `executionId` y arranca un job en memoria que el backend deja en `Processing` durante ~8s antes de pasar a `Completed` (`Services/ReportService.cs`). El frontend no conoce esa duración de antemano (en un backend real sería variable), así que el ciclo completo se resolvió como:

- **`frontend/src/queries/reportQueries.ts`** — llamadas HTTP crudas (`generateReport`, `getReportStatus`) y el mapeo de tipos. El backend serializa el enum `ReportStatus` como número (`0 = Processing`, `1 = Completed`, confirmado contra el backend corriendo) porque `Program.cs` no registra `JsonStringEnumConverter`; se traduce acá a `'Processing' | 'Completed'` para que el resto del frontend no dependa de ese detalle de serialización.
- **`frontend/src/services/reportService.ts`** — capa fina de orquestación (`generate` / `getStatus`) sobre las queries, mismo patrón que `employeeService`.
- **`frontend/src/hooks/useReportGeneration.ts`** — dueño del ciclo de vida completo del polling (dispara la generación, pollea el estado, expone `status`/`result`/`error`). Vive en `hooks/` (no en `managers/`) porque, a diferencia de `useTableData`/`useListPagination`, no es un manager de datos tabulares reutilizable entre dominios: es el flujo de negocio específico de "generar reporte y esperar el resultado".
- **`frontend/src/components/ReportGenerator.tsx`** — componente de presentación que consume el hook (mismo patrón que `LoginForm` con `useAuth`), montado como sección dentro de `EmployeesPage` (no se creó una página/ruta propia: el proyecto no usa `react-router` — ver 4.6 — sino un switch simple `Login` vs `Employees` en `App.tsx`, y el reporte es una vista auxiliar de ese mismo listado, no una sección de navegación independiente).

**Intervalo de polling — backoff progresivo:** en vez de un intervalo fijo, cada consulta agenda la siguiente con `setTimeout` (no `setInterval`, para no solapar un fetch en vuelo con el siguiente) y el intervalo crece `×1.5` en cada vuelta partiendo de 1s hasta un tope de 8s (`INITIAL_POLL_INTERVAL_MS` / `MAX_POLL_INTERVAL_MS` / `POLL_BACKOFF_FACTOR`). Un intervalo fijo corto (ej. 500ms) es responsivo para jobs cortos pero satura al backend si el job tarda minutos; uno fijo largo (ej. 5s) es liviano para jobs largos pero se siente lento para el caso feliz de este ejercicio (~8s). El backoff progresivo da lo mejor de ambos: reacciona rápido al principio y se relaja a medida que el job tarda más, sin necesidad de saber de antemano cuánto va a durar.

**Timeout:** si el job no llega a `Completed` dentro de `MAX_POLL_DURATION_MS` (60s), el hook corta el polling y pasa a un estado `'timeout'` con un mensaje de error, en vez de seguir preguntando indefinidamente. El usuario puede volver a presionar "Generar reporte" para reintentar (dispara una ejecución nueva).

**Limpieza al desmontar / al regenerar:** el polling vive en un `useEffect` con `[executionId]` como dependencia; su cleanup hace `controller.abort()` + `clearTimeout(timeoutId)`. Eso cubre dos casos con el mismo mecanismo:
- El usuario navega fuera de la vista mientras el job está `Processing` → React llama al cleanup al desmontar `EmployeesPage`/`ReportGenerator`, y el `fetch` en vuelo se aborta.
- El usuario dispara una nueva generación antes de que la anterior termine → cambia `executionId`, React limpia el efecto anterior (aborta su polling) antes de correr el nuevo.

La llamada inicial (`POST /generate`) se protege aparte con un `AbortController` en un `ref` (abortado también al desmontar el componente), porque no corre dentro de un `useEffect` con cleanup automático — la dispara un handler de click.

**Gotcha no obvio:** `queries/httpClient.ts` (`authFetch`) trata cualquier fallo de `fetch` como posible sesión expirada (revisa `/health` y desloguea si el backend sigue vivo — ver comentario existente sobre CORS en 401). Un `AbortError` deliberado (por el cleanup de arriba) entraba en ese mismo camino y hubiera provocado un logout espurio cada vez que se cancelaba un polling. Se ajustó `authFetch` para detectar `DOMException` con `name === 'AbortError'` y repropagarlo de inmediato, sin pasar por la verificación de sesión.

### 5 — Testing: Vitest + React Testing Library

No había tests en el proyecto; esta fue la primera vez que se configuraron. Se eligió **Vitest** sobre Jest porque el proyecto ya corre sobre Vite: Vitest reutiliza la misma config/transform (`vite.config.ts`, plugin de React, resolución de módulos ESM/TS) sin duplicar configuración de babel/ts-jest ni pagar el costo de arrancar un segundo bundler sólo para tests. Se combina con **React Testing Library** (RTL) porque el estilo de testing que impone (consultar el DOM por rol/texto visible, interactuar como lo haría un usuario) es el que mejor valida el patrón de este frontend: componentes de presentación "tontos" (`EmployeeTable`, `PaginationControls`) alimentados por managers/hooks (`useTableData`) que a su vez llaman a un `service` — probar por accesibilidad/DOM en vez de detalles de implementación permite testear esa integración sin acoplarse a estructura interna.

El test (`src/components/EmployeeTable.test.tsx`) monta `EmployeeTable` + `PaginationControls` cableados con el `useTableData` real (el mismo hook que usa `EmployeesPage`), mockeando únicamente `employeeService.list` — el borde de red — con `vi.spyOn`. Cubre: estado de carga, primera página de filas renderizadas, avance de página con `PaginationControls`, listado vacío y estado de error. No se testeó `EmployeesPage` completo porque además del listado depende de `AuthContext` y de `useReportGeneration` (polling), que son flujos no relacionados con la tabla y hubieran inflado el test con mocks ajenos al objetivo.

**Setup:** `vite.config.ts` agrega el bloque `test` (`environment: 'jsdom'`, `setupFiles: './src/setupTests.ts'`). `setupTests.ts` importa `@testing-library/jest-dom/vitest` (matchers como `toBeInTheDocument`) y registra `afterEach(cleanup)` a mano — sin `test.globals: true` en la config, RTL no detecta un `afterEach` global automático para desmontar el DOM entre tests. Scripts: `npm run test` (una corrida) y `npm run test:watch`.

### 6 — Framework de diseño UI: Tailwind CSS

Hasta este punto todos los componentes (`LoginForm`, `EmployeeTable`, `DeviceTable`, `EmployeeFilters`, `PaginationControls`, `ReportGenerator`) se construyeron deliberadamente headless: HTML semántico (`<form>`, `<table>`, `<select>`) sin ninguna clase, apoyado sólo en el CSS por defecto que trae la plantilla de Vite. Esta actividad agrega el estilo como una capa separada, sin tocar props/estado/lógica de ningún componente.

Se evaluaron tres opciones:

| Opción | Cómo se aplica | Costo de adopción | Encaje con la arquitectura headless |
|---|---|---|---|
| **Tailwind CSS** (elegida) | Clases utilitarias agregadas directamente en el `className` de los elementos nativos existentes | Un plugin de Vite (`@tailwindcss/vite`) + un `@import "tailwindcss"` en `index.css`; sin `ThemeProvider` ni configuración de tema obligatoria | Alto: no exige reemplazar `<table>`/`<select>`/`<form>` por componentes propios, sólo decora el markup ya existente |
| MUI / Chakra UI | Reemplazando los elementos nativos por sus propios componentes (`<Table>`, `<Select>`, `<TextField>`) para aprovechar el theming | Requiere `ThemeProvider`, motor CSS-in-JS (emotion/Emotion runtime), y curva de aprendizaje de su API de componentes | Bajo: para obtener valor real hay que sustituir el markup, lo que se acerca a una reescritura de la capa de presentación en vez de una capa aditiva |
| Bootstrap | Clases utilitarias + componentes JS opcionales (modales, dropdowns) | Ligero, pero trae convenciones visuales muy reconocibles/genéricas y parte de su valor (componentes JS) no aplica en un proyecto React | Medio: funciona por clases como Tailwind, pero su sistema de grillas/componentes está pensado para HTML plano, no para composición de componentes React |

**Por qué Tailwind:** el proyecto es chico y el objetivo de esta etapa es demostrar criterio técnico, no llegar a un pixel-perfect de producción. Tailwind permite mantener exactamente la misma estructura de componentes (mismos elementos, mismas props) y sumar sólo la presentación vía `className`, que es justo la definición de "capa separada" que se buscaba desde el diseño headless inicial. MUI/Chakra hubieran significado más valor visual "gratis" (componentes ya armados), pero a costa de tocar el markup interno de cada componente y sumar una dependencia de runtime (CSS-in-JS) que no se justifica para el tamaño de este challenge.

**Qué se tocó:** sólo `className` (y, en `LoginForm`/`App`, algún `<div>` envolvente para poder centrar/dar layout) en `frontend/src/components/*.tsx`, `frontend/src/pages/*.tsx` y `frontend/src/App.tsx`. `frontend/src/index.css` quedó reducido a `@import "tailwindcss"` más el fondo/tipografía base del `body`; `vite.config.ts` suma el plugin `@tailwindcss/vite`. Ningún hook, manager, service o test cambió.

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```
