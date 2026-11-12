# Documento de Diseño de Juego (GDD)

**PULSO: Última Energía**  
**Versión:** 1.1 — implementación local de MVP / GDD revisado  
**Fecha:** 11 de noviembre de 2026  
**Autor de concepto:** José Ramón Ibarra  
**Equipo y fotografías:** por completar con información y autorización de los integrantes.

![Splash del juego](../assets/splash.png)

## 1. Identificación y enlaces

**Género:** plataformas 2D con acción y recolección.  
**Público objetivo:** jugadores casuales desde 10 años; dificultad accesible.  
**Plataforma:** navegadores modernos de escritorio; controles táctiles básicos incluidos para dispositivos móviles.  
**Repositorio previsto, publicación pendiente de verificación:** `https://github.com/ramonibr/pulso-ultima-energia`  
**Juego implementado localmente; URL pública aún no verificada:** `https://ramonibr.github.io/pulso-ultima-energia/`

## 2. Visión y objetivo

Juego de partidas cortas que recompensa la exploración, la administración del tiempo y el dominio de controles básicos. El jugador debe recuperar cristales y llegar a la salida antes de que se agote el tiempo.

## 3. Historia

La estación NÉBULA sufre un fallo de energía. Los drones de mantenimiento quedaron desconfigurados y las plataformas de servicio comenzaron a fallar. Axel recibe una última misión de la IA BIP: recuperar los cristales de reserva y llegar a la cámara del núcleo para estabilizar la estación.

## 4. Personajes

| Personaje | Rol | Aspecto | Comportamiento |
|---|---|---|---|
| Axel | Protagonista | Traje espacial blanco/azul, casco | Corre, salta, dispara pulsos y recoge cristales. |
| BIP | Robot aliado | Minibot cian de ojos luminosos | Presenta objetivos y mensajes, sin colisiones. |
| Dron centinela | Obstáculo | Robot gris con luz roja | Patrulla una ruta corta; al tocarlo se pierde vida. |
| Núcleo NÉBULA | Objetivo final | Reactor cian | Se estabiliza al completar los tres niveles. |

## 5. Mecánicas y controles

- A / D o flechas: moverse horizontalmente.
- W o flecha arriba: saltar.
- Espacio: emitir pulso de energía horizontal en dirección del personaje.
- P: pausar y reanudar.
- Colisión con peligro: resta una vida y 25 puntos, con invulnerabilidad temporal para evitar pérdida instantánea repetida.
- Escudo: cancela el próximo impacto durante su vigencia, sin otorgar puntos.
- Nivel superado: recoge todos los cristales requeridos y toca la salida antes de que el tiempo llegue a cero.
- Derrota: vidas agotadas o fin del tiempo; se permite reiniciar.

## 6. Niveles

| Nivel | Escenario | Cristales | Drones | Tiempo | Objetivo |
|---|---|---:|---:|---:|---|
| 1 | Muelle de Carga | 3 | 2 | 90 s | Aprender controles y abrir la salida. |
| 2 | Conductos Eléctricos | 4 | 3 | 80 s | Evitar plataformas y zonas eléctricas. |
| 3 | Cámara del Núcleo | 5 | 4 | 70 s | Superar la última ruta y restaurar el reactor. |

**Mapa bocetado del nivel 1:** ver `assets/mapa_nivel_1.png`. Un recorrido de izquierda a derecha con plataformas, tres cristales, dos drones, pasarelas y espacios de salto, además de una salida bloqueada hasta completar la recolección.

![Mapa de nivel 1](../assets/mapa_nivel_1.png)

## 7. Armas, vestimenta y objetos

**Arma:** emisor de pulso de energía. Cada pulsación crea un proyectil breve que desactiva drones; no hay sangre ni daño físico a personas.  
**Vestimenta:** mono de exploración azul/blanco, casco con visor y mochila de batería; cambios cosméticos opcionales fuera del MVP.  
**Props:** cristales, escudo temporal, plataformas, señalización, cajas industriales y puertas luminosas.  
**Fondos:** cielo espacial, pasarelas de metal, tuberías y paneles de control. No influyen en colisiones salvo los objetos señalados.

## 8. Arte y animación

Pixel art simplificado. Resolución interna propuesta: 960 × 540 (16:9). Animaciones: reposo (2 fotogramas), marcha (4), salto (1), pulso (2), daño (parpadeo), cristal (brillo) y puerta (apertura). El prototipo implementa el dibujo procedural con figuras geométricas y animaciones por tiempo; las secuencias por fotogramas quedan como posible mejora.

## 9. Storyboard

Seis escenas: emergencia → misión → desplazamiento → encuentro con dron → último cristal → salida/núcleo. El storyboard es orientativo; el prototipo implementa la narración por mensajes, sin cinemáticas independientes.

![Storyboard](../assets/storyboard.png)

## 10. Guion básico

- **Inicio — BIP:** «Alerta: el núcleo de NÉBULA perdió energía».
- **Objetivo — BIP:** «Recupera los cristales y evita a los drones».
- **Primer cristal — BIP:** «¡Bien! Cada cristal nos acerca al reinicio».
- **Salida habilitada — BIP:** «Energía suficiente. Dirígete a la compuerta».
- **Victoria — BIP:** «¡Núcleo estabilizado! La estación vuelve a funcionar».
- **Derrota — BIP:** «La misión no terminó; vuelve a intentarlo».

## 11. Música y efectos de audio

**Música:** secuencias de notas originales sintetizadas por Web Audio API, con melodías distintas para los tres niveles y volumen suave; sin música comercial.  
**SFX implementados:** salto, disparo, cristal recogido, daño, escudo, compuerta y victoria. Botón visible de silenciar/reactivar incluido; no se incorporó control deslizante de volumen.

## 12. Sistema de puntuación

| Evento | Fórmula |
|---|---|
| Cristal | +100 por cristal único |
| Dron | +50 por dron desactivado único |
| Nivel superado | +200 |
| Bono de tiempo | +2 × segundos enteros restantes al finalizar nivel |
| Daño recibido | −25 por impacto efectivo |

`SCORE = max(0, 100*C + 50*D + 200*N + 2*T − 25*H)`; C=cristales únicos recogidos, D=drones únicos desactivados, N=niveles completados, T=suma de segundos enteros restantes de niveles completados, H=impactos que consumieron una vida. Ejemplo: 3 cristales, 2 drones, 1 nivel, 40 s restantes y 1 impacto: 300+100+200+80-25=**655 puntos**.

## 13. Propuesta de plan de trabajo y Git

1. Preproducción: GDD, requerimientos, assets y tablero.
2. Prototipo: controles, cámara, física básica y colisiones.
3. Mecánicas: drones, cristales, vida, tiempo y puntuación.
4. Contenido: nivel 1, audio, UI y pantallas de estado.
5. Calidad: pruebas manuales, balance y correcciones.
6. Entrega final: publicación GitHub Pages y video explicativo.

**Git:** `main` estable; ramas cortas `feature/nombre`; commits descriptivos; pull request y revisión antes de integrar; Issues con checklist, responsable y criterio de aceptación. Las fechas y responsables se completarán con el equipo real.

## 14. Créditos y derechos

Concepto: José Ramón Ibarra. Colaboradores adicionales: por definir. Portada conceptual generada con apoyo de IA; diagramas y texto elaborados para este trabajo. No se introducirán recursos de terceros sin verificar autorización y atribución.

## 15. Fuentes técnicas

- https://developer.mozilla.org/es/docs/Web/API/Canvas_API
- https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
- https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame
- https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
- https://docs.github.com/en/issues/planning-and-tracking-with-projects

## 16. Estado de implementación y discrepancias del plan original

El juego ahora incluye tres niveles locales, controles de teclado y táctiles, física Canvas, escudo, drones, salida por cristales, estados y puntuación. El código se comprueba con `npm run check` y `npm test`. **No se ha confirmado publicación en GitHub Pages ni jugabilidad completa de extremo a extremo.** La portada de integrantes y fotografías continúa pendiente de autorización. El boceto sirve como referencia conceptual; los obstáculos efectivos se definen en `src/levels.js`.
