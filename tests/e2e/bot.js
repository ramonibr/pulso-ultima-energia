// Bot de QA: juega SOLO con el teclado. Lee el estado del juego para decidir,
// pero nunca modifica posiciones ni contadores (no hay teletransporte).
const FRAME_MS = 16;

export class KeyboardBot {
  constructor(page, log = () => {}) {
    this.page = page;
    this.log = log;
    this.held = new Set();
  }

  // Lectura de estado (solo lectura) expuesta por window.pulso_game.
  async state() {
    return this.page.evaluate(() => {
      const g = window.pulso_game;
      return {
        phase: g.phase, level_id: g.level.id, lives: g.lives, remaining: g.remaining,
        p: { ...g.player },
        drones: g.level.drones.map(d => ({ x: d.x, y: d.y, alive: d.alive, direction: d.direction })),
        gems: g.level.gems.map(x => x.taken),
        shield_taken: g.level.shield.taken,
        score: { ...g.score, seen: undefined },
      };
    });
  }

  async hold(keys) {
    const want = new Set(keys);
    for (const k of [...this.held]) if (!want.has(k)) { await this.page.keyboard.up(k); this.held.delete(k); }
    for (const k of want) if (!this.held.has(k)) { await this.page.keyboard.down(k); this.held.add(k); }
  }

  async tap(key) {
    await this.page.keyboard.down(key);
    await this.page.keyboard.up(key);
  }

  async tick(frames = 1) {
    await this.page.clock.runFor(FRAME_MS * frames);
  }

  // Dispara si un dron vivo está alineado con el pulso y en la dirección a la que mira Axel.
  async auto_shoot(s) {
    const band_top = s.p.y + 24, band_bottom = s.p.y + 32;
    const target = s.drones.find(d => d.alive &&
      band_bottom > d.y - 15 && band_top < d.y + 15 &&
      (s.p.facing > 0 ? d.x > s.p.x && d.x - s.p.x < 400 : d.x < s.p.x && s.p.x - d.x < 400));
    if (target && s.p.shotCooldown === 0) await this.tap('Space');
  }

  assert_alive(s, label) {
    if (s.phase !== 'playing') throw new Error(`${label}: fase inesperada ${s.phase} (vidas ${s.lives})`);
  }

  async walk_to(x, max_frames = 900) {
    for (let i = 0; i < max_frames; i++) {
      const s = await this.state();
      this.assert_alive(s, `walk_to(${x})`);
      const dx = x - s.p.x;
      if (Math.abs(dx) <= 4 && s.p.onGround) { await this.hold([]); return s; }
      await this.hold(Math.abs(dx) <= 4 ? [] : [dx > 0 ? 'KeyD' : 'KeyA']);
      await this.auto_shoot(s);
      await this.tick();
    }
    throw new Error(`walk_to(${x}) excedió el tiempo`);
  }

  // Camina hasta la salida; termina cuando el juego deja la fase 'playing'.
  async enter_exit(x, max_frames = 600) {
    for (let i = 0; i < max_frames; i++) {
      const s = await this.state();
      if (s.phase !== 'playing') { await this.hold([]); return s; }
      const dx = x - s.p.x;
      await this.hold(Math.abs(dx) <= 4 ? [] : [dx > 0 ? 'KeyD' : 'KeyA']);
      await this.tick();
    }
    throw new Error(`enter_exit(${x}) no completó el nivel`);
  }

  // Salta y dirige el movimiento en el aire hacia x; termina al aterrizar.
  async jump_to(x, max_frames = 300) {
    await this.hold([]);
    await this.tap('KeyW');
    let left_ground = false;
    for (let i = 0; i < max_frames; i++) {
      await this.tick();
      const s = await this.state();
      this.assert_alive(s, `jump_to(${x})`);
      if (!s.p.onGround) left_ground = true;
      if (left_ground && s.p.onGround) { await this.hold([]); return s; }
      const dx = x - s.p.x;
      await this.hold(Math.abs(dx) <= 4 ? [] : [dx > 0 ? 'KeyD' : 'KeyA']);
      await this.auto_shoot(s);
    }
    throw new Error(`jump_to(${x}) no aterrizó`);
  }

  // Gira hacia una dirección con un toque corto de tecla.
  async face(direction) {
    await this.hold([direction > 0 ? 'KeyD' : 'KeyA']);
    await this.tick();
    await this.hold([]);
  }

  // Espera (saltando en el sitio si se pide) hasta que se cumpla la condición; dispara a drones alineados.
  async wait_until(cond, { jump = false, max_frames = 1500, label = 'wait_until' } = {}) {
    for (let i = 0; i < max_frames; i++) {
      const s = await this.state();
      if (cond(s)) return s;
      this.assert_alive(s, label);
      if (jump && s.p.onGround) await this.tap('KeyW');
      await this.auto_shoot(s);
      await this.tick();
    }
    throw new Error(`${label} excedió el tiempo`);
  }
}

// Rutas por nivel usando solo acciones de jugador.
export const ROUTES = {
  1: async bot => {
    await bot.wait_until(s => !s.drones[0].alive, { label: 'L1 dron 0' });
    await bot.walk_to(95);
    await bot.jump_to(205);                       // plataforma A, cristal 1
    await bot.walk_to(280);
    await bot.jump_to(470);                       // plataforma B, cristal 2
    await bot.walk_to(520);
    await bot.face(1);
    await bot.wait_until(s => !s.drones[1].alive, { label: 'L1 dron 1' });
    await bot.jump_to(740);                       // plataforma C, cristal 3
    await bot.enter_exit(900);                    // baja al suelo y entra a la salida
  },
  2: async bot => {
    await bot.walk_to(60);
    await bot.wait_until(s => !s.drones[0].alive, { label: 'L2 dron 0' });
    await bot.walk_to(105);
    await bot.jump_to(195);                       // P1, cristal 1
    await bot.walk_to(250);
    await bot.jump_to(365);                       // P2, cristal 2
    await bot.walk_to(420);
    await bot.face(1);
    await bot.wait_until(s => !s.drones[1].alive, { jump: true, label: 'L2 dron 1' });
    await bot.jump_to(580);                       // P3, cristal 3
    await bot.walk_to(660);
    await bot.wait_until(s => s.drones[2].x > 840 && s.drones[2].direction > 0, { label: 'L2 esperar dron 2' });
    await bot.walk_to(705);                       // cae al suelo frente al dron 2
    await bot.face(1);
    await bot.wait_until(s => !s.drones[2].alive, { label: 'L2 dron 2' });
    await bot.walk_to(700);
    await bot.jump_to(800);                       // P4, cristal 4
    await bot.enter_exit(895);                    // salida
  },
  3: async bot => {
    await bot.wait_until(s => !s.drones[0].alive, { label: 'L3 dron 0' });
    await bot.walk_to(120);
    await bot.jump_to(230);                       // Q1, cristal 1
    await bot.walk_to(295);
    await bot.face(1);
    await bot.wait_until(s => !s.drones[1].alive, { jump: true, label: 'L3 dron 1' });
    await bot.jump_to(440);                       // Q2, cristal 2
    await bot.walk_to(505);
    await bot.face(1);
    await bot.wait_until(s => !s.drones[2].alive, { jump: true, label: 'L3 dron 2' });
    await bot.jump_to(650);                       // Q3, cristal 3
    await bot.walk_to(720);
    await bot.jump_to(810);                       // Q4, cristal 4
    await bot.walk_to(865);
    await bot.wait_until(s => s.drones[3].x < 760 && s.drones[3].direction < 0, { label: 'L3 esperar dron 3' });
    await bot.walk_to(905);                       // cae al suelo junto a la salida
    await bot.face(-1);
    await bot.wait_until(s => !s.drones[3].alive, { label: 'L3 dron 3' });
    await bot.enter_exit(855);                    // cristal 5 junto a la salida: completa el sector
  },
};
