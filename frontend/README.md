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
