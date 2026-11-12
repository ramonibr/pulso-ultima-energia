/** Datos declarativos de los sectores de la estación NÉBULA. */
export const LEVELS = [
  {
    id: 1, name: 'Muelle de Carga', time: 90,
    story: 'BIP: Recupera tres cristales para activar la compuerta.',
    spawn: { x: 38, y: 426 }, exit: { x: 884, y: 409, w: 46, h: 66 },
    platforms: [
      {x:0,y:475,w:255,h:65}, {x:305,y:475,w:245,h:65}, {x:602,y:475,w:358,h:65},
      {x:149,y:384,w:163,h:18}, {x:401,y:362,w:157,h:18}, {x:671,y:387,w:162,h:18}
    ],
    gems: [{x:219,y:346},{x:476,y:325},{x:752,y:348}],
    drones: [
      {x:385,y:443,minX:327,maxX:525,speed:75},
      {x:753,y:353,minX:702,maxX:809,speed:60}
    ],
    hazards: [], shield: {x:339,y:441}, tint: '#073f63'
  },
  {
    id: 2, name: 'Conductos Eléctricos', time: 80,
    story: 'BIP: Los conductos están energizados. Usa el escudo.',
    spawn: { x: 38, y: 426 }, exit: { x: 884, y: 409, w: 46, h: 66 },
    platforms: [
      {x:0,y:475,w:236,h:65}, {x:315,y:475,w:230,h:65}, {x:627,y:475,w:333,h:65},
      {x:150,y:383,w:136,h:18}, {x:303,y:353,w:151,h:18}, {x:518,y:328,w:177,h:18}, {x:748,y:380,w:130,h:18}
    ],
    gems: [{x:206,y:344},{x:376,y:313},{x:592,y:288},{x:813,y:342}],
    drones: [
      {x:396,y:441,minX:338,maxX:518,speed:95},
      {x:616,y:297,minX:548,maxX:669,speed:78},
      {x:822,y:442,minX:704,maxX:893,speed:106}
    ],
    hazards: [{x:454,y:456,w:48,h:19}], shield: {x:664,y:443}, tint: '#473064'
  },
  {
    id: 3, name: 'Cámara del Núcleo', time: 70,
    story: 'BIP: Este es el último sector. Estabiliza el reactor.',
    spawn: { x: 38, y: 426 }, exit: { x: 884, y: 409, w: 46, h: 66 },
    platforms: [
      {x:0,y:475,w:248,h:65}, {x:339,y:475,w:208,h:65}, {x:636,y:475,w:324,h:65},
      {x:178,y:381,w:149,h:18}, {x:380,y:344,w:158,h:18}, {x:590,y:314,w:165,h:18}, {x:768,y:378,w:133,h:18}
    ],
    gems: [{x:242,y:342},{x:449,y:304},{x:663,y:275},{x:823,y:337},{x:872,y:441}],
    drones: [
      {x:409,y:444,minX:360,maxX:518,speed:92},
      {x:471,y:314,minX:409,maxX:514,speed:84},
      {x:665,y:284,minX:615,maxX:734,speed:100},
      {x:796,y:441,minX:682,maxX:899,speed:114}
    ],
    hazards: [{x:356,y:456,w:43,h:19},{x:736,y:456,w:42,h:19}], shield: {x:686,y:438}, tint: '#124a4a'
  }
];

export function validateLevels(levels = LEVELS) {
  return levels.every((l,i) =>
    l.id === i + 1 && l.time > 0 && l.gems.length === i + 3 &&
    l.drones.length === i + 2 && l.platforms.length >= 3 &&
    l.spawn.x >= 0 && l.exit.x < 960 &&
    l.platforms.every(p=>p.w>0 && p.h>0 && p.x>=0 && p.x+p.w<=960) &&
    l.gems.every(g=>g.x>=0 && g.x<=960 && g.y>=0 && g.y<=540)
  );
}
