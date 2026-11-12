# Propuesta individual de videojuego

**Título:** PULSO: Última Energía
**Autor:** José Ramón Ibarra
**Fecha:** 11 de noviembre de 2026
**Tipo:** videojuego web 2D de plataformas para navegador

## 1. Concepto

La estación espacial NÉBULA perdió el control de su núcleo energético. Axel, un explorador con traje de rescate, recorre tres sectores para recuperar cristales de energía, evitar trampas eléctricas y desactivar drones defectuosos con un emisor de pulsos. Su acompañante robótico, BIP, le explica la misión. Estética pixel art futurista en azules, turquesas y amarillos.

## 2. Objetivos

**Del proyecto**

1. Programar un videojuego completo en JavaScript puro, sin motores ni librerías.
2. Aplicar entrada de teclado y táctil, gravedad, colisiones, enemigos, coleccionables, temporizador y estados de juego.
3. Implementar una puntuación reproducible y verificable con pruebas automatizadas.
4. Generar música y efectos originales con Web Audio API.
5. Gestionar el trabajo con Git, Issues y un tablero Kanban, y publicar con GitHub Pages.

**Del jugador:** recoger todos los cristales de cada sector, llegar a la salida antes de que termine el tiempo y restaurar el núcleo con la mayor puntuación posible.

## 3. Justificación

Un juego de plataformas reúne en un proyecto pequeño los conceptos centrales de la programación de videojuegos: bucle de juego, física, detección de colisiones, máquina de estados, entrada del usuario y audio. Al ejecutarse en el navegador no requiere instalación, se puede compartir con un enlace y su publicación en GitHub Pages es gratuita. La puntuación con fórmula explícita permite comprobar con pruebas que las reglas se cumplen.

## 4. Público

Jugadores casuales desde 10 años, en computadora o teléfono. Partidas cortas, controles de cuatro teclas y sin violencia gráfica.

## 5. Tecnologías

| Tecnología | Uso |
| --- | --- |
| HTML5 | Estructura, HUD y elemento `<canvas>` |
| CSS3 | Interfaz adaptable y controles táctiles |
| JavaScript (módulos ES) | Lógica, física, estados y puntuación |
| Canvas 2D + `requestAnimationFrame` | Dibujo y animación a la frecuencia de la pantalla |
| Web Audio API | Música y efectos sintetizados |
| Git, GitHub, GitHub Pages, GitHub Projects | Versiones, tareas y publicación |
| Node.js (`node:test`) y Playwright | Pruebas automatizadas (solo desarrollo) |

## 6. Alcance

**Incluido:** 3 niveles (3/4/5 cristales, 2/3/4 drones, 90/80/70 s), 3 vidas, escudo, disparo, puntuación, pantalla de inicio, pausa, victoria, derrota, música por nivel, 8 efectos, controles de teclado y táctiles, publicación web.

**Fuera de alcance:** multijugador, servidor, cuentas, tabla de récords en línea, guardado de partidas, gráficos 3D y pagos.

## 7. Mecánicas

1. Movimiento horizontal (A/D o flechas) y salto con gravedad (W o ↑).
2. Plataformas sólidas; caer al vacío cuesta una vida.
3. Drones que patrullan; su contacto cuesta una vida.
4. Disparo de pulsos (Espacio) que desactivan drones.
5. Cristales coleccionables; al reunirlos todos se abre la salida.
6. Escudo temporal que absorbe un golpe.
7. Temporizador por nivel y tres vidas.
8. Pausa (P) y silencio (M).

## 8. Criterios de éxito

| Criterio | Estado al 11/11/2026 |
| --- | --- |
| El juego abre en un navegador actual sin instalación | Cumplido (Chromium y Safari/WebKit) |
| Moverse, saltar y disparar funcionan | Cumplido (prueba E2E) |
| Los 3 niveles se pueden completar con controles normales | Cumplido (partida E2E solo con teclado) |
| Colecciones, impactos, escudo, victoria y derrota se detectan | Cumplido (prueba E2E) |
| La puntuación coincide con la fórmula y no duplica eventos | Cumplido (pruebas unitarias y E2E) |
| El sonido puede activarse y desactivarse | Cumplido (tecla M y botón) |
| Juego publicado y verificado en GitHub Pages | Cumplido (HTTP 200 y E2E contra la URL pública) |
| Documentación (README, GDD, técnico) y tablero | Cumplido; faltan integrantes y fotos reales |
| Video explicativo | Pendiente: lo graba el autor |

## 9. Enlaces

- Juego: <https://ramonibr.github.io/pulso-ultima-energia/>
- Repositorio: <https://github.com/ramonibr/pulso-ultima-energia>
- Tablero: <https://github.com/users/ramonibr/projects/9>
- GDD: [GDD.md](GDD.md) · Documento técnico: [DOCUMENTO_TECNICO.md](DOCUMENTO_TECNICO.md)
