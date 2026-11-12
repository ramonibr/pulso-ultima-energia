# Portafolio de evidencias — Requerimientos técnicos

**Caso práctico:** Desarrollo de *PULSO: Última Energía*, juego 2D para navegador con animación ligera y efectos de sonido.  
**Tipo de documento:** Portafolio técnico con implementación de referencia; no constituye medición de rendimiento en hardware diverso.  
**Fecha:** 11 de noviembre de 2026.

## 1. Objetivo técnico

Justificar el hardware y software que el equipo utilizará para planificar, diseñar, programar, animar, probar y publicar un videojuego web indie de bajo consumo.

## 2. Hardware propuesto para desarrollo

| Componente | Base recomendada por el proyecto | Deseable |
|---|---|---|
| Procesador | CPU moderna de 2 núcleos | 4 o más núcleos |
| Memoria RAM | 8 GB | 16 GB |
| Almacenamiento libre | 2 GB para editor, recursos y copias | SSD con 10 GB libres |
| Gráficos | Integrados, con soporte de navegador 2D | Integrados modernos o GPU dedicada opcional |
| Pantalla | 1366 × 768 o superior | 1920 × 1080 |
| Entrada | Teclado y ratón | Controlador opcional a futuro |
| Internet | Conexión para GitHub y publicación | Conexión estable para colaboración |

**Aclaración:** son especificaciones **propuestas por el equipo** como margen práctico, no requisitos mínimos oficiales ni producto de una prueba de benchmarking. Visual Studio Code documenta un requerimiento propio mucho menor (CPU 1.6 GHz y 1 GB RAM), pero al desarrollar se ejecutarán también navegador, editor de imágenes y herramientas de Git; por eso se plantea 8 GB como base de trabajo.

## 3. Hardware del jugador (objetivo de compatibilidad, no verificado)

Computadora de escritorio o laptop con navegador compatible con Canvas 2D, teclado, audio y una pantalla mínima objetivo de 1280 × 720. No se publicarán requisitos garantizados de FPS o consumo hasta medir el prototipo en equipos reales.

## 4. Herramientas y usos

| Herramienta | Uso | ¿Obligatoria? |
|---|---|---|
| HTML5 | Estructura del documento y canvas | Sí |
| CSS3 | HUD y presentación | Sí |
| JavaScript | Estado, eventos, física y reglas | Sí |
| Canvas 2D | Dibujo de escenas, sprites y animaciones | Sí |
| Web Audio API | Tonos y efectos de audio sintetizados | Sí para SFX planeados |
| VS Code | Editor de código | Recomendada, sustituible |
| Git | Historial y revisión de cambios | Sí para flujo propuesto |
| GitHub | Repositorio, Issues, revisión y tablero | Sí para entrega |
| GitHub Pages | Publicación estática del juego | Sí en implementación final |
| Piskel o editor de imagen | Sprites y pixel art | Opcional; sustituible |
| Draw.io o herramienta de dibujo | Mapas, flujos y storyboard | Opcional |
| Navegador con DevTools | Depuración de lógica, animación y rendimiento | Sí |

No se requiere motor 3D, backend, MySQL ni servidor dedicado para el alcance básico.

## 5. Arquitectura implementada

`index.html` carga interfaz, `styles.css` y los módulos JavaScript `src/game.js`, `src/levels.js`, `src/scoring.js` y `src/audio.js`. Un bucle basado en `requestAnimationFrame` calcula delta de tiempo, actualiza la física, detecta colisiones, procesa eventos y renderiza en `canvas`. `AudioContext` produce SFX bajo interacción del usuario. Se conservarán los controles por teclado y un botón visible de silencio.

## 6. Animación

Un sprite puede representarse mediante recuadros y fotogramas cortos; se usan formas de Canvas en un estilo pixel art minimalista para representar reposo, movimiento, salto, disparo y daño. Uso de `requestAnimationFrame` con el tiempo transcurrido para evitar diferencias de velocidad entre pantallas de distinta tasa de refresco. El arte se optimizará a resoluciones pequeñas.

## 7. Calidad y verificación

- Verificar movimiento, saltos y plataformas sin atravesar el suelo.
- Validar cada evento de score y evitar doble contabilización.
- Verificar cambio entre inicio, partida, pausa, victoria y derrota.
- Comprobar que la música/SFX no se activen antes del gesto del usuario.
- Revisar rendimiento con DevTools y dispositivos disponibles.
- Revisar que los archivos se publiquen por rutas relativas compatibles con GitHub Pages.
- Confirmar la URL pública y registrar fecha/capturas de la prueba.

## 8. Gestión de trabajo

Issues separados para documentación, arte, lógica, niveles, sonido, pruebas y despliegue. Estados sugeridos: Pendiente, En curso, En revisión y Terminado. Cada tarjeta debe conservar responsable real, entregable y criterio de aceptación.

## 9. Fuentes oficiales consultadas

1. Microsoft — Requisitos de VS Code: https://code.visualstudio.com/docs/supporting/requirements
2. MDN — Canvas API: https://developer.mozilla.org/es/docs/Web/API/Canvas_API
3. MDN — requestAnimationFrame: https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame
4. MDN — Web Audio API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
5. GitHub — GitHub Pages: https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
6. GitHub — GitHub Projects: https://docs.github.com/en/issues/planning-and-tracking-with-projects

## 10. Evidencia técnica local y límites

`npm run check` completó sin errores de sintaxis. `npm test` ejecutó cinco pruebas de nivel y puntuación con resultado satisfactorio. Se inspeccionaron menú, inicio y pausa con Chromium mediante una variante de QA que unifica módulos en memoria, sin errores de página; se incluyen capturas. No se ha verificado todavía la URL final de GitHub Pages ni pruebas de rendimiento real o un recorrido completo de los tres niveles. No se deben declarar esas verificaciones como aprobadas hasta ejecutarlas.

**Rutas del código:** `index.html`, `styles.css`, `src/game.js`, `src/levels.js`, `src/audio.js`, `src/scoring.js`; **pruebas:** `tests/game.test.js`.
