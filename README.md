# VirtualPresident

Simulador geopolítico inspirado en *Shadow President* (DC True, 1993). Sos el
Presidente de Estados Unidos en junio de 1990: manejás relaciones con países reales
mediante acciones diplomáticas, económicas y militares, mientras mantenés tu
popularidad lo suficientemente alta para ser reelecto cada 4 años.

> Proyecto en desarrollo activo. v0.1 — primer slice jugable.

## Requisitos

- Node.js 18 o superior
- npm 9 o superior

## Instalación

```bash
npm install
```

## Uso

```bash
npm run dev
```

Abre `http://localhost:5173` en el navegador.

## Estructura del proyecto

```
packages/
  engine/   → lógica del juego (TypeScript puro, sin UI)
  web/      → frontend (React + Vite)
```

## Scripts disponibles

| Comando            | Qué hace                                          |
|---------------------|----------------------------------------------------|
| `npm run dev`        | Levanta el frontend en modo desarrollo              |
| `npm run build`      | Build de producción (engine + web)                  |
| `npm run test`       | Corre los tests del motor del juego                 |
| `npm run typecheck`  | Verifica tipos en ambos paquetes                    |

## Estado del juego (v0.1)

Incluido:
- 20 países reales con stats de partida (1990)
- Acciones diplomáticas, económicas y militares básicas
- Sistema de popularidad y reelección cada 4 años
- Mapa de situación por región

Todavía no incluido (ver `CLAUDE.md` para el roadmap completo):
- Acciones encubiertas y nucleares
- Asesores
- Eventos dinámicos / IA de países
- Persistencia de partidas
- Deploy productivo

## Desarrollo con Claude Code

Este repo incluye un `CLAUDE.md` con el contexto completo del proyecto: arquitectura,
convenciones, decisiones de diseño y próximos pasos sugeridos. Cualquier sesión de
Claude Code debería leerlo antes de hacer cambios.

## Licencia

Sin licencia definida todavía.
