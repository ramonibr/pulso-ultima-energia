# ⚡ PULSO: Última Energía

![Portada de PULSO](assets/splash.png)

**Autor:** José Ramón Ibarra · **Género:** plataformas 2D, aventura y acción · **Tecnología:** HTML5, CSS3, JavaScript puro (módulos ES), Canvas 2D, `requestAnimationFrame` y Web Audio API. Sin backend, sin motor y sin dependencias CDN.

- **Jugar en línea:** <https://ramonibr.github.io/pulso-ultima-energia/>
- **Repositorio:** <https://github.com/ramonibr/pulso-ultima-energia>
- **Tablero Kanban:** <https://github.com/users/ramonibr/projects/9> · [Issues](https://github.com/ramonibr/pulso-ultima-energia/issues?q=is%3Aissue)

> **Estado verificado el 11 de noviembre de 2026:** GitHub Pages responde HTTP 200 en la página, CSS, los cuatro módulos JS y las imágenes; la suite E2E completa (incluida una partida de los tres niveles jugada solo con teclado) pasa contra la URL pública en Chromium y WebKit. Ver [evidencias](docs/EVIDENCIAS_QA.md).

## Propuesta individual

La estación espacial **NÉBULA** perdió el control de su núcleo energético. **Axel**, un explorador con traje de rescate, debe recuperar cristales de energía, evitar trampas eléctricas y desactivar drones defectuosos con su **emisor de pulsos**. Su acompañante robótico **BIP** le explica la misión en cada sector. Propuesta completa: [docs/PROPUESTA_INDIVIDUAL.md](docs/PROPUESTA_INDIVIDUAL.md).

**Descripción:** juego de partidas cortas (3 sectores, 4 minutos máximo) con estética pixel art futurista en azules, turquesas y amarillos.

**Objetivo del jugador:** recuperar todos los cristales de cada sector para abrir la compuerta y llegar a la salida antes de que se agote el tiempo, conservando al menos una vida.

**Público objetivo:** jugadores casuales desde 10 años; estudiantes y docentes que evalúan un proyecto web. Sin violencia gráfica: los drones solo se «desactivan».

## Mecánicas

1. Movimiento horizontal, salto y gravedad.
2. Plataformas sólidas con colisiones; caer al vacío cuesta una vida.
3. Drones que patrullan; tocar uno cuesta una vida.
4. Disparo de pulsos de energía que desactivan drones.
5. Cristales coleccionables (cada uno cuenta una sola vez).
6. Escudo temporal: absorbe el siguiente golpe sin quitar vida ni puntos.
7. Tres vidas iniciales, temporizador por nivel y puntuación en el HUD.
8. Pantalla de inicio, pausa y reanudación, victoria y derrota (tiempo o vidas).
9. Música por nivel y efectos sintetizados; silencio con tecla o botón.
10. Controles táctiles básicos en pantallas pequeñas.

## Controles

| Acción | Teclado | Pantalla táctil |
| --- | --- | --- |
| Mover | A / D o ← / → | Botones ◀ ▶ |
| Saltar | W o ↑ | Botón ↑ Saltar |
| Disparar pulso | Espacio | Botón ⚡ Pulso |
| Pausa / reanudar | P (o Esc) | Botón ⏸ Pausa |
| Activar / desactivar sonido | M | Botón 🔊 Silenciar |

## Niveles

| Nivel | Nombre | Cristales | Drones | Tiempo | Rasgo propio |
| --- | --- | ---: | ---: | ---: | --- |
| 1 | Muelle de Carga | 3 | 2 | 90 s | Tutorial: plataformas bajas y huecos |
| 2 | Conductos Eléctricos | 4 | 3 | 80 s | Zona eléctrica y dron en plataforma alta |
| 3 | Cámara del Núcleo | 5 | 4 | 70 s | Dos zonas eléctricas y dron junto a la salida |

La compuerta de salida se abre solo al recoger todos los cristales del sector. Boceto del nivel 1: [assets/mapa_nivel_1.png](assets/mapa_nivel_1.png).

## Sistema de puntuación

| Evento | Puntos |
| --- | ---: |
| Cristal recogido | +100 |
| Dron desactivado | +50 |
| Nivel completado | +200 |
| Segundo restante al terminar un nivel | +2 |
| Impacto recibido (pierde vida) | −25 |

```
score = max(0, 100*C + 50*D + 200*N + 2*T - 25*H)
```

C = cristales, D = drones desactivados, N = niveles completados, T = suma de segundos enteros restantes al terminar cada nivel, H = impactos que quitaron vida. Cada evento tiene un identificador único (`level:1:gem:0`, etc.) y `src/scoring.js` ignora duplicados. Un golpe absorbido por el escudo no suma H.

Ejemplo: 3 cristales + 2 drones + 1 nivel + 40 s − 1 impacto = 300 + 100 + 200 + 80 − 25 = **655**.

## Estructura del proyecto

```text
index.html              Entrada: HUD, canvas, modal y controles táctiles
styles.css              Interfaz adaptable (escritorio y móvil)
src/game.js             Bucle requestAnimationFrame, física, colisiones, estados, dibujo
src/levels.js           Datos declarativos de los 3 niveles y validación
src/scoring.js          Eventos únicos y fórmula de puntuación
src/audio.js            Música y efectos sintetizados con Web Audio API
tests/game.test.js      Pruebas unitarias (node:test)
tests/e2e/              Pruebas en navegador (Playwright) y bot que juega con teclado
docs/                   Propuesta, GDD, documento técnico, evidencias y capturas
assets/                 Splash, storyboard, mapa del nivel 1 y favicon
```

## Jugar localmente

Los módulos ES requieren servirse por HTTP (no abrir con `file://`):

```bash
git clone https://github.com/ramonibr/pulso-ultima-energia.git
cd pulso-ultima-energia
python3 -m http.server 8080
# abrir http://localhost:8080/
```

## Pruebas

Requiere Node.js 18+ (solo para pruebas; el juego no necesita instalación).

```bash
npm install                 # instala Playwright (solo desarrollo)
npx playwright install chromium webkit
npm run check               # sintaxis de todos los módulos
npm test                    # 5 pruebas unitarias de puntuación y niveles
npm run test:e2e            # 8 pruebas × 2 navegadores (Chromium y WebKit)
PULSO_URL=https://ramonibr.github.io/pulso-ultima-energia/ npm run test:e2e   # contra GitHub Pages
npm run capturas            # regenera docs/capturas/*.png
```

La prueba E2E principal juega los tres niveles **usando solo eventos de teclado**: un bot lee el estado del juego para decidir, pero nunca mueve al jugador ni altera contadores. El reloj del navegador se controla con `page.clock` para que la partida sea reproducible.

## Capturas reales

| Inicio | Nivel 1 | Nivel 2 |
| --- | --- | --- |
| ![Inicio](docs/capturas/inicio.png) | ![Nivel 1](docs/capturas/nivel-1.png) | ![Nivel 2](docs/capturas/nivel-2.png) |
| **Nivel 3** | **Victoria** | **Móvil (390 px)** |
| ![Nivel 3](docs/capturas/nivel-3.png) | ![Victoria](docs/capturas/victoria.png) | ![Móvil](docs/capturas/movil.png) |

## Documentación

- [Propuesta individual](docs/PROPUESTA_INDIVIDUAL.md) · [Word](docs/PROPUESTA_INDIVIDUAL.docx)
- [GDD — Documento de Diseño de Juego](docs/GDD.md) · [Word](docs/GDD.docx)
- [Documento técnico](docs/DOCUMENTO_TECNICO.md) · [Word](docs/DOCUMENTO_TECNICO.docx)
- [Evidencias de QA](docs/EVIDENCIAS_QA.md)
- [Tarjetas de GitHub](docs/TARJETAS_GITHUB.md)

## Créditos

- Concepto, propuesta y dirección: **José Ramón Ibarra**.
- Integrantes adicionales y fotografías: por completar con datos reales y autorizados (ver GDD).
- Programación, pruebas y documentación con apoyo de herramientas de IA, revisadas por el autor.
- Gráficos del juego dibujados por código en Canvas; splash, storyboard y mapa conceptual generados para este proyecto.
- Música y efectos: originales, sintetizados en tiempo real con Web Audio API. Sin recursos comerciales.

Fuentes técnicas: [MDN Canvas API](https://developer.mozilla.org/es/docs/Web/API/Canvas_API) · [MDN Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) · [MDN requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame) · [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site) · [Playwright](https://playwright.dev/docs/intro)
