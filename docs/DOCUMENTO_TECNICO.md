# Documento técnico — PULSO: Última Energía

**Autor:** José Ramón Ibarra · **Fecha:** 11 de noviembre de 2026
**Repositorio:** <https://github.com/ramonibr/pulso-ultima-energia> · **Juego:** <https://ramonibr.github.io/pulso-ultima-energia/>

Este documento distingue dos cosas:

- **Requisito del proyecto:** lo que el juego o su desarrollo necesitan para funcionar, derivado del código o de documentación oficial.
- **Recomendación de desarrollo:** lo que el autor propone para trabajar con comodidad. No proviene de una medición de rendimiento.

## 1. Requisitos para jugar (requisito del proyecto)

| Componente | Requisito mínimo | Recomendado |
| --- | --- | --- |
| Navegador | Chrome/Edge 98+, Safari 15.4+ o Firefox 94+ (el código usa módulos ES, Canvas 2D, Web Audio y `structuredClone`, disponible desde esas versiones según MDN) | Última versión de Chrome, Edge, Safari o Firefox |
| Procesador | Cualquier CPU capaz de ejecutar esos navegadores | Doble núcleo o superior |
| RAM | La que exija el navegador (la página descarga ~1,8 MB, casi todo la imagen de portada) | 4 GB o más |
| Almacenamiento | Ninguno (se juega en línea) | — |
| Gráficos | Soporte de Canvas 2D (integrados) | Pantalla de 1280 × 720 o mayor |
| Entrada | Teclado, o pantalla táctil | Teclado |
| Audio | Opcional | Altavoces o audífonos |
| Red | Conexión para descargar la página una vez | — |

## 2. Hardware para desarrollo

| Componente | Mínimo (referencia oficial) | Recomendación de desarrollo |
| --- | --- | --- |
| Procesador | 1,6 GHz (requisito de VS Code) | 4 núcleos, 2 GHz o más |
| RAM | 1 GB (requisito de VS Code) | 8 GB; 16 GB si se usan editor, navegador, editor de imágenes y pruebas a la vez |
| Almacenamiento | ~500 MB para VS Code, Git y Node.js | SSD con 10 GB libres (incluye navegadores de Playwright, ~300 MB) |
| Gráficos | Integrados | Integrados modernos; GPU dedicada no necesaria |
| Pantalla | 1366 × 768 | 1920 × 1080 para ver código y juego lado a lado |
| Sistema operativo | macOS, Windows o Linux compatibles con VS Code y Node.js | — |

El mínimo de VS Code proviene de su documentación oficial; las recomendaciones son propuestas del autor porque durante el desarrollo se ejecutan varias herramientas simultáneamente.

## 3. Herramientas

| Herramienta | Uso | Tipo |
| --- | --- | --- |
| **Visual Studio Code** | Editor de código | Recomendado (sustituible por cualquier editor) |
| **Git** | Control de versiones | Requisito del proyecto |
| **GitHub** | Repositorio público, Issues, tablero Kanban | Requisito de la entrega |
| **GitHub Pages** | Publicación estática desde `main` / `(root)` | Requisito de la entrega |
| **GitHub CLI (`gh`)** | Crear repositorio, Issues y tablero desde terminal | Recomendado |
| **Node.js 18+** | Ejecutar `npm run check`, `npm test` y Playwright | Requisito solo para pruebas |
| **Playwright** | Pruebas en Chromium y WebKit (motor de Safari) | Requisito solo para pruebas E2E |
| **Python 3** | Servidor local `python3 -m http.server 8080` | Recomendado (cualquier servidor estático sirve) |
| **Piskel** o **Aseprite** | Pixel art y animación por fotogramas (sprites) | Recomendado para arte futuro; el juego actual dibuja por código |
| **Canvas 2D** | Animación procedural (flotación de drones, brillo del reactor, parpadeo de invulnerabilidad) | Requisito del proyecto |
| **Herramienta de dibujo** (draw.io, Figma u otra) | Mapas de nivel y storyboard | Recomendado |

### Navegadores para pruebas

- **Chromium** (Chrome/Edge) y **WebKit** (Safari): automatizados con Playwright en cada corrida.
- **Safari en iPhone / Chrome en Android:** recomendado para comprobar controles táctiles en un dispositivo físico.
- **Firefox:** recomendado para una partida manual adicional.

## 4. Arquitectura de software

```text
index.html ──carga──> styles.css
           └─módulo─> src/game.js ──importa──> src/levels.js   (datos de niveles)
                                   ├─────────> src/scoring.js  (eventos y fórmula)
                                   └─────────> src/audio.js    (Web Audio)
```

| Módulo | Responsabilidad |
| --- | --- |
| `src/game.js` | Clase `PulseGame`: entrada (teclado, botones táctiles con Pointer Events), bucle `requestAnimationFrame` con delta de tiempo limitado a 34 ms, física (gravedad 1700 px/s², salto −645 px/s, velocidad 270 px/s), colisiones AABB, máquina de estados (`menu`, `playing`, `paused`, `level-clear`, `won`, `lost`), HUD y dibujo en Canvas |
| `src/levels.js` | Datos declarativos de cada nivel (plataformas, cristales, drones, peligros, escudo, salida, tiempo) y `validateLevels()` |
| `src/scoring.js` | `createScore()`, `applyScoreEvent()` (ignora identificadores repetidos) y `calculateScore()` con la fórmula oficial |
| `src/audio.js` | `AudioEngine`: crea `AudioContext` tras el primer gesto del usuario, osciladores para efectos y melodía por nivel, silencio |

**Decisiones técnicas:** sin dependencias en tiempo de ejecución (carga rápida, nada que pueda fallar en un CDN); niveles como datos para modificar el diseño sin tocar la lógica; puntuación separada de la lógica para probarla de forma aislada; rutas relativas compatibles con GitHub Pages; archivo `.nojekyll` para servir los archivos tal cual.

## 5. Tecnologías utilizadas

HTML5, CSS3 (variables, grid, media queries), JavaScript moderno (ES2020+) en módulos, Canvas 2D, `requestAnimationFrame`, Web Audio API (`OscillatorNode`, `GainNode`), Pointer Events, `structuredClone`, Node.js `node:test`, Playwright, Git y GitHub (Pages, Issues, Projects).

## 6. Estrategia de pruebas

| Nivel | Herramienta | Cobertura |
| --- | --- | --- |
| Sintaxis | `npm run check` (`node --check`) | Todos los módulos y pruebas |
| Unitarias | `npm test` (`node:test`) | Datos de niveles, fórmula, anti-duplicados, no negativos, eventos inválidos |
| E2E | `npm run test:e2e` (Playwright, Chromium + WebKit) | Carga sin errores, partida completa de los 3 niveles solo con teclado, movimiento, salto, disparo, cristal único, escudo, vidas, pausa, silencio, derrota por tiempo y por vidas, móvil 390 px |
| Producción | `PULSO_URL=https://ramonibr.github.io/pulso-ultima-energia/ npm run test:e2e` | La misma suite contra GitHub Pages |
| Manual | Autor | Escucha del audio y prueba en teléfono físico |

En las pruebas E2E el reloj del navegador se controla con `page.clock`, lo que hace la partida determinista; un bot lee el estado del juego y responde solo con eventos de teclado, sin modificar posiciones (no hay teletransporte). Resultados: [EVIDENCIAS_QA.md](EVIDENCIAS_QA.md).

## 7. Fuentes técnicas oficiales

1. Visual Studio Code — Requirements: <https://code.visualstudio.com/docs/supporting/requirements>
2. MDN — Canvas API: <https://developer.mozilla.org/es/docs/Web/API/Canvas_API>
3. MDN — `requestAnimationFrame`: <https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame>
4. MDN — Web Audio API: <https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API>
5. MDN — `structuredClone` (compatibilidad de navegadores): <https://developer.mozilla.org/en-US/docs/Web/API/Window/structuredClone>
6. MDN — Módulos JavaScript: <https://developer.mozilla.org/es/docs/Web/JavaScript/Guide/Modules>
7. Node.js — Test runner: <https://nodejs.org/api/test.html>
8. Playwright — Documentación y Clock API: <https://playwright.dev/docs/intro> · <https://playwright.dev/docs/clock>
9. Git — Documentación: <https://git-scm.com/doc>
10. GitHub Pages — Configurar la fuente de publicación: <https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site>
11. GitHub Projects: <https://docs.github.com/en/issues/planning-and-tracking-with-projects>
12. Piskel: <https://www.piskelapp.com/> · Aseprite: <https://www.aseprite.org/>
