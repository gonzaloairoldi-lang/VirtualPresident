# CLAUDE.md

Contexto del proyecto para Claude Code. Leer esto antes de tocar código.

## Qué es esto

**VirtualPresident** es un simulador geopolítico inspirado en *Shadow President* (DC True,
1993). El jugador es el Presidente de Estados Unidos en junio de 1990. Maneja relaciones
con países reales mediante acciones diplomáticas, económicas y militares, mientras
mantiene su popularidad lo suficientemente alta para ser reelecto cada 4 años.

Referencia del original: geopolítica realista, países reales, categorías de acción
(Diplomática, Económica, Encubierta, Militar, Nuclear), un stat de Popularidad que
determina si seguís en el juego.

## Estado actual (v0.1)

Lo que existe:
- Motor del juego completo en `packages/engine` — estado inicial, aplicar acciones,
  avanzar turno, 20 países reales con stats de partida (1990), 7 acciones jugables
  (diplomáticas, económicas, militares básicas — **sin acciones nucleares ni
  encubiertas todavía**).
- Frontend completo en `packages/web` — mapa de situación agrupado por región, panel
  de país con stats y acciones, header con fecha/popularidad, log de eventos.
- 7 tests del motor, todos pasando.

Lo que **no** existe todavía (deliberadamente fuera de v0.1):
- Acciones encubiertas y nucleares.
- Sistema de guerra/invasión real (solo hay "desplegar tropas" como presión, sin combate).
- Asesores con personalidad/consejo, como en el original.
- IA de los países (reaccionan solo por deriva pasiva de estabilidad, no toman
  iniciativa propia).
- Persistencia de partidas (todo vive en memoria de React, se pierde al refrescar).
- Backend, base de datos, autenticación.
- Deploy productivo (pendiente de configurar).

## Arquitectura

Monorepo con npm workspaces, dos paquetes:

```
packages/
  engine/   → lógica pura del juego, TypeScript sin dependencias de UI
  web/      → frontend React + Vite que consume el engine
```

**Por qué separados:** el engine no debe saber nada de React ni del DOM. Esto permite
testear la lógica de forma aislada y, en el futuro, reusarla en otro frontend (CLI,
mobile, etc.) sin reescribir nada.

### `packages/engine`

- `src/types.ts` — todos los tipos centrales (`Country`, `GameState`, `ActionDefinition`, etc).
  Convención: **todos los stats normalizados van de 0 a 100**.
- `src/data/countries.ts` — datos iniciales de los 20 países del escenario de 1990.
  Los valores son de diseño de juego, no históricamente precisos.
- `src/actions.ts` — definición de las acciones jugables. Cada acción es un objeto con
  `apply()` que devuelve un delta a aplicar, no un valor absoluto.
- `src/game.ts` — el motor: `createInitialState()`, `applyAction()`, `advanceTurn()`.
  Es el punto de entrada del paquete (`main` en `package.json`).
- `src/game.test.ts` — tests con `node:test`, correr con `npm run test -w packages/engine`.

**Reglas para tocar el engine:**
- Todo cambio de stats va como delta (`Partial<CountryStats>`), nunca como valor absoluto,
  para que `clamp()` se aplique de forma consistente en un solo lugar (`game.ts`).
- Las acciones nunca deben poder apuntar a USA (el país del jugador) — ver el chequeo
  `target.isPlayer` en `applyAction`.
- Si agregás una categoría nueva (`covert`, `nuclear`), actualizá también
  `CATEGORY_LABELS` en `packages/web/src/components/CountryPanel.tsx`.

### `packages/web`

- `src/useGame.ts` — único hook que envuelve el estado del engine en React state.
  Toda la UI lee de acá, nunca llama al engine directamente.
- `src/components/` — `HeaderBar`, `WorldMap`, `CountryPanel`, `EventLog`, `StatBar`.
- `src/styles/global.css` — tokens de diseño (variables CSS), ver sección de diseño abajo.

**Convención de imports:** todos los imports relativos usan extensión `.js` explícita
(ej. `from "./game.js"` aunque el archivo sea `game.ts`). Es requerido por
`moduleResolution: "Bundler"` en los tsconfig. No lo quites ni lo "corrijas" a `.ts`.

## Decisiones de diseño visual

Estética deliberada: **sala de situación de los 90 / informe presidencial**, no un
dashboard SaaS genérico.

- Paleta: fondo casi negro azulado (`--bg-deep: #0b0e11`), acento ámbar de terminal
  (`--amber: #d9a441`), rojo de alerta (`--alert`), verde apagado para lo positivo
  (`--positive`). Definidos como variables CSS en `global.css`, no hardcodear hex en
  componentes.
- Tipografía: `Spectral` (serif) para títulos/sellos, `IBM Plex Mono` para datos y stats,
  `Inter` para UI general. Cargadas desde Google Fonts en `index.html`.
- El "mapa" no es un mapa geográfico real — es una grilla de países agrupados por región,
  estilo panel de radar/sonar. Decisión consciente para v0.1: mucho más simple de
  mantener que coordenadas SVG reales, y coherente con la estética de sala de situación.
  Si en el futuro se quiere un mapa geográfico real, sería un cambio de UI aislado en
  `WorldMap.tsx`, sin tocar el engine.
- El stamp de popularidad en `HeaderBar` es el elemento "signature" del diseño —
  mantenerlo como pieza distintiva, no banalizarlo a una barra de progreso más.

## Comandos

```bash
npm install              # instalar todo (raíz, engine, web)
npm run dev               # levanta el frontend en localhost:5173
npm run build              # build de producción (engine primero, luego web)
npm run test               # corre los tests del engine
npm run typecheck          # typecheck de ambos paquetes
```

## Cómo seguir desde acá (sugerencias de próximos pasos)

En orden de prioridad sugerido, pero no es obligatorio seguir este orden:

1. **Asesores**: agregar 1-2 asesores con opiniones sobre las acciones que tomás
   (mecánica central del original que falta).
2. **Acciones encubiertas**: sabotaje, apoyo a rebeliones — como en el original.
3. **Eventos dinámicos**: hoy el mundo solo tiene deriva pasiva de estabilidad; agregar
   eventos generados (crisis, golpes de estado) le daría más vida al loop.
4. **Acciones nucleares**: la categoría más icónica del original, dejada para el final
   a propósito por su peso narrativo/sensibilidad — pensar bien el framing antes de
   implementar.
5. **Persistencia**: guardar partida en `localStorage` (en una app standalone, no en
   artifacts de Claude — ver nota abajo) o backend simple.
6. **Deploy productivo**: pendiente, ver sección de infraestructura más abajo.

## Infraestructura / Deploy

Todavía no configurado. Plan acordado con el usuario:
- Sin base de datos por ahora — el juego vive en memoria del cliente, no hay partidas
  persistentes ni cuentas de usuario.
- Hosting productivo: pendiente de elegir proveedor (Vercel/Netlify), deploy automático
  desde el repo en cada push a `main`.
- Si en el futuro se agrega backend (para guardar partidas o multiplayer), evaluar recién
  ahí qué DB usar — no agregar infraestructura para necesidades que todavía no existen.

## Notas para vos, Claude

- Este proyecto se desarrolló de forma conversacional con el usuario en español
  (Argentina). Mantené las respuestas y los mensajes in-game en español si el usuario
  sigue escribiendo en español.
- El usuario quiere ir agregando capas de complejidad de forma incremental, no
  todo de una. Si te pide "el siguiente paso", preferí proponer un slice chico y
  testeable antes que una reescritura grande.
- Cualquier cambio al modelo de datos de país (`CountryStats`) es un cambio que toca
  tanto engine como UI — avisá explícitamente qué archivos del paquete `web` hay que
  revisar si cambiás algo en `types.ts`.
