import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LEVELS, validateLevels } from '../src/levels.js';
import { createScore, applyScoreEvent, calculateScore } from '../src/scoring.js';

test('tres niveles definidos y progresión 3/4/5 cristales, 2/3/4 drones',()=>{
  assert.equal(LEVELS.length,3);
  assert.equal(validateLevels(),true);
  assert.deepEqual(LEVELS.map(l=>l.gems.length),[3,4,5]);
  assert.deepEqual(LEVELS.map(l=>l.drones.length),[2,3,4]);
  assert.deepEqual(LEVELS.map(l=>l.time),[90,80,70]);
});
test('puntuación conforme a la rúbrica, con tiempo entero',()=>{
  const s=createScore();
  applyScoreEvent(s,{id:'g1',type:'crystal'});
  applyScoreEvent(s,{id:'d1',type:'drone'});
  applyScoreEvent(s,{id:'l1',type:'complete',remainingSeconds:43.9});
  applyScoreEvent(s,{id:'h1',type:'hit'});
  assert.equal(calculateScore(s),100+50+200+86-25);
});
test('eventos duplicados no se contabilizan',()=>{
  const s=createScore();
  assert.equal(applyScoreEvent(s,{id:'g1',type:'crystal'}),true);
  assert.equal(applyScoreEvent(s,{id:'g1',type:'crystal'}),false);
  assert.equal(calculateScore(s),100);
  assert.equal(s.crystals,1);
});
test('puntuación no negativa, incluso con daños al principio',()=>{
  const s=createScore();
  for(let i=0;i<7;i++)applyScoreEvent(s,{id:`h${i}`,type:'hit'});
  assert.equal(calculateScore(s),0);
  applyScoreEvent(s,{id:'g1',type:'crystal'});
  assert.equal(calculateScore(s),0);
});
test('eventos inválidos no alteran los contadores',()=>{
  const s=createScore();
  assert.equal(applyScoreEvent(s,{id:'x',type:'inventado'}),false);
  assert.equal(applyScoreEvent(s,{id:'',type:'crystal'}),false);
  assert.equal(calculateScore(s),0);
});
