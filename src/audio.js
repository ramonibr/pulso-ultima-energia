/** Banda sonora y efectos ORIGINALES generados en tiempo real; sin archivos externos. */
export class AudioEngine {
  constructor() { this.ctx = null; this.muted = false; this.musicTime = 0; this.step = 0; }
  unlock() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    if (!this.ctx) this.ctx = new AC();
    if (this.ctx.state === 'suspended') this.ctx.resume().catch(()=>{});
  }
  tone(freq = 440, duration = 0.09, type = 'sine', volume = 0.045, delay = 0) {
    if (this.muted || !this.ctx || this.ctx.state !== 'running') return;
    const t = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator(); const gain = this.ctx.createGain();
    osc.type = type; osc.frequency.setValueAtTime(freq,t);
    gain.gain.setValueAtTime(0.0001,t);
    gain.gain.exponentialRampToValueAtTime(Math.max(volume,0.0002),t+0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001,t+duration);
    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(t); osc.stop(t+duration+0.02);
  }
  effect(name) {
    const sounds = {
      jump: [[380,.11,'triangle',.038],[535,.10,'triangle',.028,.06]],
      pulse: [[155,.18,'sawtooth',.018],[470,.09,'sine',.037,.025]],
      crystal: [[660,.10,'sine',.042],[990,.15,'sine',.037,.09]],
      hit: [[180,.22,'sawtooth',.028]],
      shield: [[420,.14,'triangle',.045],[700,.16,'sine',.026,.1]],
      drone: [[490,.1,'square',.015],[250,.13,'triangle',.03,.07]],
      door: [[510,.13,'sine',.032],[760,.15,'sine',.032,.10]],
      win: [[523,.19,'sine',.04],[659,.18,'sine',.04,.19],[784,.31,'sine',.04,.37]]
    };
    for (const [f,d,t,v,delay=0] of sounds[name] || []) this.tone(f,d,t,v,delay);
  }
  music(dt, level) {
    if (this.muted || !this.ctx) return;
    this.musicTime -= dt;
    if (this.musicTime > 0) return;
    this.musicTime = 0.54;
    const melodies = [[196,247,294,247,220,294,247,196], [174,220,261,220,196,261,220,174],[164,246,294,329,294,246,220,196]];
    const notes = melodies[Math.min(level,2)];
    this.tone(notes[this.step % notes.length],0.23,'triangle',0.008);
    this.step++;
  }
  setMuted(value) {this.muted = value; if (!value) this.unlock();}
}
