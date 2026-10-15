# ManagementTasks — Frontend (SPA)

Aplicación web para gestionar solicitudes de servicio TI. Angular + Angular Material. Se ejecuta en el puerto `4200` y consume la API del backend.

## Comandos disponibles

| Comando | Qué hace |
|---|---|
| `npm start` | Levanta el servidor de desarrollo. |
| `npm run build` | Compila la aplicación para producción. |
| `npm run watch` | Compila en modo observación. |
| `npm test` | Ejecuta los tests. |

## Estructura de carpetas

```
frontend/src/app/
├── app.ts, app.html, app.scss      # Layout principal
├── app.config.ts                   # Configuración general
├── app.routes.ts                   # Rutas (/requests)
├── environments/                   # URL de la API (environment.ts)
├── core/                           # Código compartido
│   ├── api/                        # Servicios que llaman al backend
│   ├── models/                     # Tipos de datos
│   ├── interceptors/               # Manejo de errores y carga
│   └── services/                   # Notificaciones y estado de carga
└── features/requests/              # Funcionalidad de solicitudes
    ├── requests-page/              # Página principal (lista, filtros, paginación)
    ├── request-list/               # Tabla de solicitudes
    ├── request-filters/            # Filtros y buscador
    ├── request-form-dialog/        # Formulario crear/editar
    ├── request-detail-dialog/      # Detalle de la solicitud
    └── confirm-dialog/             # Confirmación para eliminar
```

## Cómo se comunica con el backend

El frontend llama a la API del backend usando los servicios de `core/api`, que
apuntan a la URL definida en `environment.ts`
(`http://localhost:3000/api/v1`). Los datos viajan en JSON y los errores se
muestran al usuario en español.
