## Instrucciones de ejecución

### Requisitos

- Node.js 18+ y npm.
- La API `EmployeeAPI` corriendo (por ejemplo con `docker compose up --build` desde la raíz del repo, expuesta por defecto en `http://localhost:8080`, Swagger en `/swagger`).

### Configuración

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Copiar `.env.example` a `.env` y ajustar `VITE_API_BASE_URL` si la API no corre en `http://localhost:8080`:
   ```bash
   cp .env.example .env
   ```

### Desarrollo

```bash
npm run dev
```

Levanta el frontend en modo desarrollo (Vite, HMR) apuntando a `VITE_API_BASE_URL`. Credenciales por defecto de la API: `admin` / `admin`.

### Tests

```bash
npm run test        # una corrida (usada en CI)
npm run test:watch  # modo watch
```

### Build de producción

```bash
npm run build
npm run preview
```

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

**Plus opcional — comparación con la paginación real del backend (implementada como toggle):** además de comparar en teoría, se implementó un switch "API/Calculado" (panel de Configuración) para el listado de empleados. "Calculado" es la estrategia por defecto descrita arriba. "API" usa `page`/`pageSize` reales (`managers/serverPagination.ts`, hook `useServerPagination`) pidiendo sólo la página actual al servidor.

Implementarlo reveló una limitación no anticipada: el backend calcula `X-Total-Count`/`X-Total-Pages` pero no los expone vía CORS (`Access-Control-Expose-Headers`), así que en modo "API" no hay forma de conocer el total de páginas sin tocar el backend. Se resolvió con una petición sonda (1 elemento en `page*pageSize+1`) para habilitar/deshabilitar "Siguiente" sin depender del total; por esto mismo, la navegación directa a número de página (con elipsis, agregada en `PaginationControls`) sólo se muestra en modo "Calculado", donde sí hay total real.

Con eso confirmado en código, no sólo en teoría: "API" conviene cuando el dataset es grande y transferir todo de una es costoso en red (paga con no poder mostrar total ni saltar a una página arbitraria, por la limitación de CORS). "Calculado" conviene cuando el dataset es chico/mediano y se prioriza UX completa (total real, salto a cualquier página, filtrar/ordenar sin latencia de red) sobre el costo de payload inicial.

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

## Librerías adicionales

- **Tailwind CSS** (`@tailwindcss/vite`) — capa de estilos sobre componentes headless existentes, sin tocar su estructura/props.
- **Vitest** + **React Testing Library** (`@testing-library/react`, `jest-dom`, `jsdom`) — testing de integración, reutilizando la config de Vite sin sumar un segundo bundler.