import { LEVELS } from './levels.js';
import { createScore, calculateScore, applyScoreEvent } from './scoring.js';
import { AudioEngine } from './audio.js';

const W=960,H=540, GRAVITY=1700, MOVE=270, JUMP=-645;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const intersects=(a,b)=>a.x<b.x+b.w && a.x+a.w>b.x && a.y<b.y+b.h && a.y+a.h>b.y;
const $=sel=>document.querySelector(sel);

class PulseGame {
  constructor() {
    this.canvas=$('#game'); this.ctx=this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled=false;
    this.audio=new AudioEngine(); this.keys=new Set(); this.phase='menu';
    this.levelIndex=0; this.score=createScore(); this.lives=3; this.hits=0;
    this.elapsed=0; this.last=0; this.notice=''; this.noticeTime=0;
    this.loadLevel(0);
    this.bindInputs(); this.showModal('PULSO: ÚLTIMA ENERGÍA', 'Ayuda a Axel a reunir cristales y reiniciar la estación NÉBULA. Tres sectores, tres vidas y una misión.', 'Iniciar misión',()=>this.start());
    requestAnimationFrame(t=>this.frame(t));
  }
  loadLevel(index) {
    this.levelIndex=index; this.level=structuredClone(LEVELS[index]);
    this.remaining=this.level.time; this.elapsed=0;
    this.player={x:this.level.spawn.x,y:this.level.spawn.y,w:30,h:47,vy:0,onGround:false,facing:1,invulnerable:0,shield:false,shotCooldown:0};
    this.projectiles=[]; this.level.gems.forEach(g=>g.taken=false);
    this.level.drones.forEach(d=>{d.alive=true;d.direction=1;});
    this.level.shield.taken=false;
    this.setNotice(this.level.story,5);
    this.updateHud();
  }
  bindInputs() {
    window.addEventListener('keydown',e=>{
      const k=e.key.toLowerCase();
      if (['arrowleft','arrowright','arrowup',' ','w','a','d','p','m','escape'].includes(k)) e.preventDefault();
      if (e.repeat && [' ','arrowup','w','p','m','escape'].includes(k)) return;
      if (k==='p'||k==='escape') {this.pause();return;}
      if (k==='m') {this.toggleSound();return;}
      this.keys.add(k);
      if (['arrowup','w'].includes(k)) this.jump();
      if (k===' ') this.fire();
    });
    window.addEventListener('keyup',e=>this.keys.delete(e.key.toLowerCase()));
    window.addEventListener('blur',()=>{this.keys.clear();if(this.phase==='playing')this.pause();});
    const bindControl=(id,k,action)=>{
      const el=$(id); if(!el)return;
      el.addEventListener('pointerdown',e=>{e.preventDefault();el.setPointerCapture(e.pointerId);this.keys.add(k);if(action)action();});
      const release=e=>{e.preventDefault();this.keys.delete(k);};
      el.addEventListener('pointerup',release); el.addEventListener('pointercancel',release); el.addEventListener('lostpointercapture',()=>this.keys.delete(k));
    };
    bindControl('#left','arrowleft');bindControl('#right','arrowright');bindControl('#jump','w',()=>this.jump());bindControl('#shoot',' ',()=>this.fire());
    $('#pauseBtn').addEventListener('click',()=>this.pause());
    $('#soundBtn').addEventListener('click',()=>this.toggleSound());
  }
  toggleSound() {
    this.audio.setMuted(!this.audio.muted);
    $('#soundBtn').textContent=this.audio.muted?'🔇 Activar sonido':'🔊 Silenciar';
  }
  start() {
    this.score=createScore();this.lives=3;this.hits=0;this.loadLevel(0);
    this.audio.unlock();this.phase='playing';this.hideModal();
    this.canvas.focus({preventScroll:true});
  }
  pause() {
    if(this.phase==='playing'){
      this.phase='paused';this.keys.clear();
      this.showModal('Misión en pausa','El tiempo y los enemigos están detenidos.','Continuar',()=>{this.audio.unlock();this.phase='playing';this.hideModal();this.canvas.focus({preventScroll:true});});
    } else if(this.phase==='paused') {this.audio.unlock();this.phase='playing';this.hideModal();}
    this.updateHud();
  }
  showModal(title,description,buttonLabel,action) {
    $('#modalTitle').textContent=title;
    $('#modalDesc').textContent=description;
    $('#modalAction').textContent=buttonLabel;
    $('#modalAction').onclick=action;
    $('#modal').classList.remove('hidden');
    $('#modalAction').focus({preventScroll:true});
  }
  hideModal() {$('#modal').classList.add('hidden');}
  setNotice(text,seconds=2) {this.notice=text;this.noticeTime=seconds;}
  jump() {
    if(this.phase!=='playing'||!this.player.onGround) return;
    this.player.vy=JUMP;this.player.onGround=false;this.audio.unlock();this.audio.effect('jump');
  }
  fire() {
    if(this.phase!=='playing'||this.player.shotCooldown>0)return;
    const p=this.player;
    this.projectiles.push({x:p.x+(p.facing>0?p.w+2:-8),y:p.y+24,w:13,h:8,dx:550*p.facing,ttl:.72});
    p.shotCooldown=.4;this.audio.unlock();this.audio.effect('pulse');
  }
  damage() {
    const p=this.player;if(this.phase!=='playing'||p.invulnerable>0)return;
    if(p.shield){p.shield=false;p.invulnerable=1;this.audio.effect('shield');this.setNotice('BIP: ¡El escudo absorbió el golpe!',2);return;}
    this.lives--;this.hits++;
    applyScoreEvent(this.score,{id:`hit:${this.hits}`,type:'hit'});
    this.audio.effect('hit');
    if(this.lives<=0){this.lose('Axel se quedó sin vidas.');return;}
    p.x=this.level.spawn.x;p.y=this.level.spawn.y;p.vy=0;p.invulnerable=1.75;
    this.setNotice('¡Cuidado! Perdiste una vida.',2);this.updateHud();
  }
  lose(why) {
    this.phase='lost';this.keys.clear();
    this.showModal('MISIÓN FALLIDA',`${why} Puntuación: ${calculateScore(this.score)} puntos.`, 'Reintentar misión',()=>this.start());
  }
  completeLevel() {
    this.phase='level-clear';this.keys.clear();
    applyScoreEvent(this.score,{id:`level:${this.level.id}:complete`,type:'complete',remainingSeconds:this.remaining});
    this.audio.effect('win');this.updateHud();
    if(this.levelIndex===LEVELS.length-1){
      this.phase='won';
      this.showModal('¡NÚCLEO RESTAURADO!',`Axel y BIP salvaron NÉBULA. Puntuación final: ${calculateScore(this.score)} puntos.`, 'Jugar de nuevo',()=>this.start());
    }else {
      this.showModal(`SECTOR ${this.level.id} COMPLETADO`,`Cristales recuperados. Bono de tiempo: ${2*Math.floor(this.remaining)} puntos.`, 'Siguiente sector',()=>{
        this.loadLevel(this.levelIndex+1);this.audio.unlock();this.phase='playing';this.hideModal();this.canvas.focus({preventScroll:true});
      });
    }
  }
  update(dt) {
    this.elapsed+=dt;
    this.remaining=Math.max(0,this.remaining-dt);
    if(this.remaining===0){this.lose('Se agotó el tiempo del sector.');return;}
    this.noticeTime=Math.max(0,this.noticeTime-dt);
    this.audio.music(dt,this.levelIndex);
    const p=this.player;
    p.invulnerable=Math.max(0,p.invulnerable-dt);
    p.shotCooldown=Math.max(0,p.shotCooldown-dt);
    const left=this.keys.has('a')||this.keys.has('arrowleft');
    const right=this.keys.has('d')||this.keys.has('arrowright');
    const axis=Number(right)-Number(left);
    if(axis)p.facing=axis;
    p.x+=axis*MOVE*dt; p.x=clamp(p.x,0,W-p.w);
    for(const platform of this.level.platforms) {
      if(intersects(p,platform)){
        if(axis>0)p.x=platform.x-p.w;
        else if(axis<0)p.x=platform.x+platform.w;
      }
    }
    const lastBottom=p.y+p.h, lastTop=p.y;
    p.vy=clamp(p.vy+GRAVITY*dt,-850,950);
    p.y+=p.vy*dt;p.onGround=false;
    for(const platform of this.level.platforms) {
      if(!intersects(p,platform))continue;
      if(p.vy>=0 && lastBottom<=platform.y+12){p.y=platform.y-p.h;p.vy=0;p.onGround=true;}
      else if(p.vy<0 && lastTop>=platform.y+platform.h-10){p.y=platform.y+platform.h;p.vy=0;}
    }
    if(p.y>H+80){this.damage();if(this.phase==='playing'){p.x=this.level.spawn.x;p.y=this.level.spawn.y;p.vy=0;}return;}
    for(let i=0;i<this.level.gems.length;i++){
      const g=this.level.gems[i];if(g.taken)continue;
      if(intersects(p,{x:g.x-12,y:g.y-14,w:24,h:28})){
        g.taken=true;applyScoreEvent(this.score,{id:`level:${this.level.id}:gem:${i}`,type:'crystal'});
        this.audio.effect('crystal');this.setNotice(`Cristal recuperado: ${this.level.gems.filter(x=>x.taken).length}/${this.level.gems.length}`,1.3);
        if(this.level.gems.every(x=>x.taken)){this.setNotice('BIP: ¡Compuerta activada! Ve hasta la salida.',3);this.audio.effect('door');}
      }
    }
    if(!this.level.shield.taken && intersects(p,{x:this.level.shield.x-13,y:this.level.shield.y-14,w:26,h:28})){
      this.level.shield.taken=true;p.shield=true;this.audio.effect('shield');this.setNotice('Escudo adquirido: bloquea un golpe.',2);
    }
    for(const d of this.level.drones){
      if(!d.alive)continue;
      d.x+=d.speed*d.direction*dt;
      if(d.x>d.maxX){d.x=d.maxX;d.direction=-1;}
      if(d.x<d.minX){d.x=d.minX;d.direction=1;}
      if(intersects(p,{x:d.x-17,y:d.y-15,w:34,h:30}))this.damage();
    }
    for(const h of this.level.hazards)if(intersects(p,h))this.damage();
    for(const b of this.projectiles){
      b.x+=b.dx*dt;b.ttl-=dt;
      for(let i=0;i<this.level.drones.length;i++){
        const d=this.level.drones[i];if(!d.alive||b.ttl<=0)continue;
        if(intersects(b,{x:d.x-17,y:d.y-15,w:34,h:30})){
          d.alive=false;b.ttl=0;
          applyScoreEvent(this.score,{id:`level:${this.level.id}:drone:${i}`,type:'drone'});
          this.audio.effect('drone');this.setNotice('Dron desactivado: +50 puntos',1);
        }
      }
    }
    this.projectiles=this.projectiles.filter(b=>b.ttl>0 && b.x>-20 && b.x<W+20);
    if(this.level.gems.every(g=>g.taken)&&intersects(p,this.level.exit))this.completeLevel();
    this.updateHud();
  }
  updateHud(){
    $('#hudLevel').textContent=`${this.level.id} / ${LEVELS.length} · ${this.level.name}`;
    $('#hudScore').textContent=calculateScore(this.score).toLocaleString('es-MX');
    $('#hudTime').textContent=String(Math.ceil(this.remaining));
    $('#hudLives').textContent='♥'.repeat(Math.max(0,this.lives))+'♡'.repeat(3-Math.max(0,this.lives));
    $('#hudGems').textContent=`${this.level.gems.filter(g=>g.taken).length}/${this.level.gems.length}`;
    $('#hudShield').textContent=this.player.shield?'Escudo: activo':'Escudo: —';
    $('#pauseBtn').textContent=this.phase==='paused'?'▶ Reanudar':'⏸ Pausa';
  }
  frame(timestamp){
    const dt=Math.min((timestamp-this.last)/1000||0,0.034);
    this.last=timestamp;
    if(this.phase==='playing')this.update(dt);
    this.draw(timestamp/1000);
    requestAnimationFrame(t=>this.frame(t));
  }
  rectangle(x,y,w,h,color){this.ctx.fillStyle=color;this.ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
  draw(seconds){
    const c=this.ctx,l=this.level;
    const grad=c.createLinearGradient(0,0,0,H);grad.addColorStop(0,'#05101e');grad.addColorStop(.70,l.tint);grad.addColorStop(1,'#081425');
    c.fillStyle=grad;c.fillRect(0,0,W,H);
    // Fondo industrial y horizonte de estrellas, sin dependencias externas.
    for(let i=0;i<52;i++){
      const x=(i*131+19)%W,y=(i*77+23)%270;
      this.rectangle(x,y,1+(i%3===0?1:0),1,'#6fa9c688');
    }
    for(let i=0;i<13;i++){
      const x=i*86-10,h=92+(i*37)%130;
      this.rectangle(x,340-h,64,h,'#071a2e');this.rectangle(x+6,346-h,5,5,'#1c6270');this.rectangle(x+34,359-h,5,5,'#1c6270');
      this.rectangle(x+15,365-h,36,2,'#124254');
    }
    // Reactor central con pulsos cian.
    const glow=.60+.3*Math.sin(seconds*1.8);
    this.rectangle(443,72,74,230,'#163a54');this.rectangle(458,88,44,187,`rgba(32,233,231,${.10+glow*.16})`);
    this.rectangle(455,81,51,5,'#2ccbd1');this.rectangle(455,270,51,5,'#2ccbd1');
    this.rectangle(436,295,89,15,'#092e49');
    // Plataformas sólidas.
    for(const p of l.platforms){
      this.rectangle(p.x,p.y,p.w,p.h,'#1c2d48');this.rectangle(p.x,p.y,p.w,6,'#64d8ed');
      this.rectangle(p.x,p.y+7,p.w,5,'#2c617d');
      for(let x=p.x+10;x<p.x+p.w-8;x+=36)this.rectangle(x,p.y+15,17,5,'#415570');
      if(p.h>50)this.rectangle(p.x+4,p.y+40,p.w-8,6,'#101e30');
    }
    // Riesgos eléctricos.
    for(const h of l.hazards){
      this.rectangle(h.x,h.y,h.w,h.h,'#ac2846');
      for(let j=0;j<h.w-8;j+=12){
        c.strokeStyle='#ffcd5c';c.lineWidth=2;c.beginPath();c.moveTo(h.x+j+2,h.y+3);c.lineTo(h.x+j+8,h.y+9);c.lineTo(h.x+j+3,h.y+14);c.stroke();
      }
    }
    // Puerta: solo se abre después de todos los cristales.
    const open=l.gems.every(g=>g.taken),door=l.exit;
    this.rectangle(door.x-4,door.y-6,door.w+8,door.h+6,'#0b2639');
    this.rectangle(door.x,door.y,door.w,door.h,open?'#0a696a':'#79304a');
    this.rectangle(door.x+5,door.y+8,door.w-10,door.h-16,open?'#15c9bf':'#c73c59');
    c.fillStyle='#d7feff';c.font='bold 11px monospace';c.textAlign='center';c.fillText(open?'SALIDA':'CERRADA',door.x+door.w/2,door.y-15);
    // Cristales amarillos; animación ligera.
    l.gems.forEach((g,i)=>{if(g.taken)return;
      const y=g.y+Math.sin(seconds*4+i)*3;
      c.fillStyle='#ffe568';c.beginPath();c.moveTo(g.x,y-16);c.lineTo(g.x+12,y);c.lineTo(g.x,y+16);c.lineTo(g.x-12,y);c.closePath();c.fill();
      c.strokeStyle='#fff6bb';c.lineWidth=2;c.stroke();
      c.beginPath();c.moveTo(g.x,y-15);c.lineTo(g.x,y+14);c.moveTo(g.x-11,y);c.lineTo(g.x+11,y);c.stroke();
    });
    if(!l.shield.taken){
      const s=l.shield;c.strokeStyle='#9aeeff';c.lineWidth=3;c.beginPath();c.arc(s.x,s.y,12+Math.sin(seconds*4)*2,0,Math.PI*2);c.stroke();
      this.rectangle(s.x-4,s.y-6,8,12,'#67b0fc');
    }
    // Drones.
    for(const d of l.drones){if(!d.alive)continue;
      const by=d.y+Math.sin(seconds*5+d.x)*2;
      this.rectangle(d.x-17,by-12,34,24,'#63708a');this.rectangle(d.x-12,by-8,24,17,'#162739');
      this.rectangle(d.x-6,by-4,12,7,'#f54d6f');this.rectangle(d.x-22,by-3,6,7,'#727f95');this.rectangle(d.x+16,by-3,6,7,'#727f95');
      this.rectangle(d.x-3,by-18,5,6,'#b95a6e');
    }
    // Proyectiles.
    for(const b of this.projectiles){
      this.rectangle(b.x-3,b.y-3,b.w+6,b.h+6,'#146d87');this.rectangle(b.x,b.y,b.w,b.h,'#9bfdff');
    }
    // Axel: explorador y emisor de pulsos.
    const p=this.player;
    if(p.invulnerable===0 || Math.floor(seconds*12)%2===0){
      this.rectangle(p.x+2,p.y+22,25,22,'#d6e6f2');
      this.rectangle(p.x+3,p.y+42,10,5,'#4a8ec4');this.rectangle(p.x+18,p.y+42,10,5,'#4a8ec4');
      this.rectangle(p.x+2,p.y+6,26,24,'#e9f5ff');this.rectangle(p.x+6,p.y+11,18,15,'#263b5b');
      this.rectangle(p.x+10,p.y+17,4,4,'#81e9fb');this.rectangle(p.x+19,p.y+17,3,4,'#81e9fb');
      this.rectangle(p.x+3,p.y+27,23,6,'#48aed9');
      this.rectangle(p.x+(p.facing>0?25:-8),p.y+25,12,9,'#b3edfc');
      this.rectangle(p.x+(p.facing>0?34:-8),p.y+28,4,3,'#3de7e5');
    }
    if(p.shield){c.beginPath();c.arc(p.x+15,p.y+23,35,0,Math.PI*2);c.strokeStyle='#7ef0ff';c.lineWidth=2;c.stroke();}
    // BIP, guía holográfica que acompaña al jugador.
    const bx=clamp(p.x-42,11,W-32),by=p.y-39+Math.sin(seconds*4)*3;
    this.rectangle(bx,by,27,20,'#dceef9');this.rectangle(bx+4,by+3,19,13,'#113651');
    this.rectangle(bx+8,by+7,3,3,'#55fbe5');this.rectangle(bx+17,by+7,3,3,'#55fbe5');
    this.rectangle(bx+12,by+20,3,7,'#41ebef');
    // Indicador breve de la misión.
    if(this.noticeTime>0){
      c.fillStyle='rgba(2,14,28,.81)';c.fillRect(110,25,740,39);
      c.strokeStyle='#44b6cf';c.lineWidth=1;c.strokeRect(110,25,740,39);
      c.fillStyle='#e1faff';c.textAlign='center';c.font='bold 17px system-ui';c.fillText(this.notice,480,51);
    }
    if(this.phase==='paused'){c.fillStyle='rgba(0,0,0,.25)';c.fillRect(0,0,W,H);}
  }
}

// Instancia expuesta solo para inspección de QA (lectura de estado en pruebas E2E).
window.pulso_game = new PulseGame();
