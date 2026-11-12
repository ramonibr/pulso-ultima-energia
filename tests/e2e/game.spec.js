// Pruebas E2E en navegador real. El reloj se controla con page.clock para que
// requestAnimationFrame avance de forma determinista; la entrada es teclado/puntero real.
import { test, expect } from '@playwright/test';
import { KeyboardBot, ROUTES } from './bot.js';

// Con PULSO_CAPTURAS=1 se guardan capturas reales de la partida en docs/capturas/.
const capturas = process.env.PULSO_CAPTURAS === '1';
async function capture(page, name) {
  if (capturas && test.info().project.name === 'chromium') await page.screenshot({ path: `docs/capturas/${name}.png` });
}

const score_formula = s => Math.max(0, 100 * s.crystals + 50 * s.drones + 200 * s.levels + 2 * s.remainingSeconds - 25 * s.hits);

// Abre el juego, registra errores JS y respuestas fallidas.
async function open_game(page) {
  const errors = [];
  page.on('pageerror', e => errors.push(`pageerror: ${e.message}`));
  page.on('console', m => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });
  page.on('response', r => { if (r.status() >= 400) errors.push(`HTTP ${r.status()} ${r.url()}`); });
  await page.clock.install();
  await page.goto('./');
  await page.waitForFunction(() => window.pulso_game !== undefined);
  return errors;
}

async function start_game(page) {
  await page.locator('#modalAction').click();
  await expect(page.locator('#modal')).toHaveClass(/hidden/);
}

test('carga sin errores y muestra pantalla de inicio', async ({ page }) => {
  const errors = await open_game(page);
  await expect(page.locator('#modalTitle')).toHaveText('PULSO: ÚLTIMA ENERGÍA');
  await capture(page, 'inicio');
  await expect(page.locator('#modalAction')).toHaveText('Iniciar misión');
  await page.clock.runFor(500);
  expect(await page.evaluate(() => window.pulso_game.phase)).toBe('menu');
  expect(errors).toEqual([]);
});

test('partida completa de los 3 niveles solo con teclado', async ({ page }) => {
  const errors = await open_game(page);
  await start_game(page);
  const bot = new KeyboardBot(page);
  for (const level_id of [1, 2, 3]) {
    const before = await bot.state();
    expect(before.level_id).toBe(level_id);
    await page.clock.runFor(1500);                                            // deja ver el mensaje de BIP
    await capture(page, `nivel-${level_id}`);
    const after = await ROUTES[level_id](bot) ?? await bot.state();
    expect(after.gems.every(Boolean)).toBe(true);
    if (level_id < 3) {
      expect(after.phase).toBe('level-clear');
      await expect(page.locator('#modalTitle')).toHaveText(`SECTOR ${level_id} COMPLETADO`);
      await page.locator('#modalAction').click();
    }
  }
  await capture(page, 'victoria');
  const end = await bot.state();
  expect(end.phase).toBe('won');
  await expect(page.locator('#modalTitle')).toHaveText('¡NÚCLEO RESTAURADO!');
  expect(end.score.crystals).toBe(12);
  expect(end.score.drones).toBe(9);
  expect(end.score.levels).toBe(3);
  const expected = score_formula(end.score);
  await expect(page.locator('#modalDesc')).toContainText(`Puntuación final: ${expected} puntos`);
  console.log(`[${test.info().project.name}] victoria: ${expected} pts, vidas ${end.lives}, impactos ${end.score.hits}, segundos bono ${end.score.remainingSeconds}`);
  expect(errors).toEqual([]);
});

test('movimiento, salto, disparo, cristal único y puntuación', async ({ page }) => {
  const errors = await open_game(page);
  await start_game(page);
  const bot = new KeyboardBot(page);
  const s0 = await bot.state();
  await bot.hold(['KeyD']); await bot.tick(10); await bot.hold([]);
  const s1 = await bot.state();
  expect(s1.p.x).toBeGreaterThan(s0.p.x + 30);           // se mueve a la derecha
  await bot.hold(['ArrowLeft']); await bot.tick(5); await bot.hold([]);
  expect((await bot.state()).p.x).toBeLessThan(s1.p.x);  // flechas también funcionan
  await bot.tap('KeyW'); await bot.tick(10);
  const s2 = await bot.state();
  expect(s2.p.y).toBeLessThan(s0.p.y - 40);               // salto con gravedad
  await bot.wait_until(s => s.p.onGround, { label: 'aterrizar' });
  expect((await bot.state()).p.y).toBe(475 - 47);        // vuelve al suelo (colisión con plataforma)
  await bot.face(1);
  await bot.tap('Space'); await bot.tick();
  expect(await page.evaluate(() => window.pulso_game.projectiles.length)).toBe(1);
  await bot.wait_until(s => !s.drones[0].alive, { label: 'dron 0' });
  // primer cristal: se cuenta una sola vez aunque Axel siga encima
  await bot.walk_to(95); await bot.jump_to(219); await bot.tick(30);
  const s3 = await bot.state();
  expect(s3.score.crystals).toBe(1);
  expect(s3.score.drones).toBe(1);
  await expect(page.locator('#hudGems')).toHaveText('1/3');
  await expect(page.locator('#hudScore')).toHaveText('150');
  expect(errors).toEqual([]);
});

test('escudo absorbe un golpe; luego se pierde vida y se restan 25 puntos', async ({ page }) => {
  const errors = await open_game(page);
  await start_game(page);
  const bot = new KeyboardBot(page);
  await bot.wait_until(s => !s.drones[0].alive, { label: 'dron 0' });       // +50
  await bot.walk_to(95); await bot.jump_to(150);
  await bot.walk_to(270);                                                    // borde de plataforma A
  await bot.walk_to(339);                                                    // cae junto al escudo
  let s = await bot.state();
  expect(s.shield_taken).toBe(true);
  expect(s.p.shield).toBe(true);
  // salta al hueco entre suelos (305..255): caída = daño
  await bot.walk_to(310);
  await bot.hold(['KeyA']);
  s = await bot.wait_until(st => !st.p.shield, { label: 'golpe absorbido' });
  await bot.hold([]);
  expect(s.lives).toBe(3);
  expect(s.score.hits).toBe(0);
  await expect(page.locator('#hudScore')).toHaveText('150');
  // segunda caída sin escudo: pierde vida y 25 puntos
  await bot.tick(70);                                                       // termina invulnerabilidad
  await bot.walk_to(240); await bot.hold(['KeyD']);
  s = await bot.wait_until(st => st.lives === 2, { label: 'perder vida' });
  await bot.hold([]);
  expect(s.score.hits).toBe(1);
  await expect(page.locator('#hudScore')).toHaveText('125');
  await expect(page.locator('#hudLives')).toHaveText('♥♥♡');
  expect(errors).toEqual([]);
});

test('pausa con P detiene el tiempo; M silencia', async ({ page }) => {
  const errors = await open_game(page);
  await start_game(page);
  await page.clock.runFor(1000);
  await page.keyboard.press('KeyP');
  const paused = await page.evaluate(() => [window.pulso_game.phase, window.pulso_game.remaining]);
  expect(paused[0]).toBe('paused');
  await expect(page.locator('#modalTitle')).toHaveText('Misión en pausa');
  await capture(page, 'pausa');
  await page.clock.runFor(5000);
  expect(await page.evaluate(() => window.pulso_game.remaining)).toBe(paused[1]);
  await page.keyboard.press('KeyP');
  expect(await page.evaluate(() => window.pulso_game.phase)).toBe('playing');
  await page.clock.runFor(1000);
  expect(await page.evaluate(() => window.pulso_game.remaining)).toBeLessThan(paused[1]);
  await page.keyboard.press('KeyM');
  expect(await page.evaluate(() => window.pulso_game.audio.muted)).toBe(true);
  await expect(page.locator('#soundBtn')).toHaveText('🔇 Activar sonido');
  await page.keyboard.press('KeyM');
  expect(await page.evaluate(() => window.pulso_game.audio.muted)).toBe(false);
  expect(errors).toEqual([]);
});

test('derrota por tiempo agotado', async ({ page }) => {
  const errors = await open_game(page);
  await start_game(page);
  await page.clock.runFor(91_000);
  expect(await page.evaluate(() => window.pulso_game.phase)).toBe('lost');
  await expect(page.locator('#modalTitle')).toHaveText('MISIÓN FALLIDA');
  await capture(page, 'derrota');
  await expect(page.locator('#modalDesc')).toContainText('Se agotó el tiempo');
  await page.locator('#modalAction').click();                                 // reintentar
  expect(await page.evaluate(() => [window.pulso_game.phase, window.pulso_game.lives])).toEqual(['playing', 3]);
  expect(errors).toEqual([]);
});

test('derrota al perder las 3 vidas', async ({ page }) => {
  const errors = await open_game(page);
  await start_game(page);
  const bot = new KeyboardBot(page);
  for (let i = 0; i < 3; i++) {
    await bot.hold(['KeyD']);
    await bot.wait_until(s => s.lives === 2 - i || s.phase === 'lost', { label: `caída ${i}` });
    await bot.hold([]);
    await bot.tick(120);
  }
  expect(await page.evaluate(() => window.pulso_game.phase)).toBe('lost');
  await expect(page.locator('#modalDesc')).toContainText('sin vidas');
  expect(errors).toEqual([]);
});

test('móvil 390px: controles táctiles visibles y funcionales', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const errors = await open_game(page);
  await start_game(page);
  for (const id of ['#left', '#right', '#jump', '#shoot']) await expect(page.locator(id)).toBeVisible();
  await capture(page, 'movil');
  const no_hscroll = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
  expect(no_hscroll).toBe(true);
  const x0 = await page.evaluate(() => window.pulso_game.player.x);
  const box = await page.locator('#right').boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.clock.runFor(200);                                              // sin llegar bajo la plataforma A
  await page.mouse.up();
  expect(await page.evaluate(() => window.pulso_game.player.x)).toBeGreaterThan(x0 + 30);
  await page.clock.runFor(100);
  const jb = await page.locator('#jump').boundingBox();
  const y0 = await page.evaluate(() => window.pulso_game.player.y);
  await page.mouse.move(jb.x + jb.width / 2, jb.y + jb.height / 2);
  await page.mouse.down(); await page.clock.runFor(150); await page.mouse.up();
  expect(await page.evaluate(() => window.pulso_game.player.y)).toBeLessThan(y0 - 30);
  expect(errors).toEqual([]);
});
