import test from 'node:test';
import assert from 'node:assert/strict';
import { estimateVisits, dailyGain, mergeEvents, stockBalance, materialize, parseCsv, toCsv } from '../src/domain.mjs';

test('el orden de las claves JSON no convierte una copia idéntica en una colisión',()=>{
 const original={id:'same',entityId:'task',kind:'tasks',version:1,payload:{name:'La misma tarea',module:'General',review:{by:'Rosa',date:'2026-10-01',reason:'Revisión'}}};
 const reordered={payload:{review:{reason:'Revisión',date:'2026-10-01',by:'Rosa'},module:'General',name:'La misma tarea'},version:1,kind:'tasks',entityId:'task',id:'same'};
 assert.equal(mergeEvents([original],[reordered]).events.length,1);
 assert.throws(()=>mergeEvents([original],[{...reordered,payload:{...reordered.payload,name:'Otro contenido'}}]),/contenido diferente/);
});

const palm = { id: 'p1', lat: 10.495, lng: -75.125, accuracy: 0.5, validated: true };
const points = [0,5000,10000].map((monoMs,i) => ({ id: `g${i}`, lat:palm.lat,lng:palm.lng,accuracy:1,monoMs,segment:'s1',ageMs:0,mock:false }));
test('3 puntos consecutivos y 10 s confirman una visita e incluyen intervalos iniciales', () => {
 const result=estimateVisits(points,[palm],{pilotApproved:true});
 assert.equal(result.visits.length,1); assert.equal(result.visits[0].seconds,10);
});
test('las palmas cercanas producen ambigüedad sin atribución falsa', () => {
 const result=estimateVisits(points,[palm,{...palm,id:'p2',lng:palm.lng+0.00004}],{pilotApproved:true});
 assert.equal(result.visits.length,0); assert.equal(result.ambiguous,3);
});
test('un hueco de 20 s y un reinicio no inflan la permanencia', () => {
 const result=estimateVisits([...points,{...points[0],monoMs:30000},{...points[1],monoMs:35000},{...points[2],monoMs:40000},{...points[0],monoMs:0,segment:'s2'}],[palm],{pilotApproved:true});
 assert.equal(result.visits.reduce((s,v)=>s+v.seconds,0),20);
});
test('el piloto y el levantamiento son requisitos para atribuir una palma', () => {
 assert.equal(estimateVisits(points,[palm],{pilotApproved:false}).visits.length,0);
 assert.equal(estimateVisits(points,[{...palm,validated:false}],{pilotApproved:true}).visits.length,0);
});
test('puntos antiguos, simulados e imprecisos rompen la secuencia', () => {
 for (const patch of [{ageMs:16000},{mock:true},{accuracy:6}]) {
  assert.equal(estimateVisits([points[0],{...points[1],...patch},points[2]],[palm],{pilotApproved:true}).visits.length,0);
 }
});
test('ganancia diaria usa solo dos mediciones compatibles y fechas diferentes', () => {
 assert.equal(dailyGain([{kg:300,date:'2026-09-01',method:'Báscula'},{kg:330,date:'2026-10-01',method:'Báscula'}]),1);
 assert.equal(dailyGain([{kg:300,date:'2026-09-01',method:'Báscula'},{kg:330,date:'2026-10-01',method:'Cinta'}]),null);
 assert.equal(dailyGain([{kg:300,date:'2026-09-01',method:'Báscula'},{kg:330,date:'2026-09-01',method:'Báscula'}]),null);
});
test('reimportar eventos no duplica registros y guarda propuestas conflictivas', () => {
 const a={id:'e1',entityId:'t1',kind:'tasks',version:1,payload:{name:'A',module:'General'}};
 assert.equal(mergeEvents([a],[a]).events.length,1);
 const b={...a,id:'e2',payload:{name:'B',module:'General'}};
 assert.equal(mergeEvents([a],[b]).conflicts.length,1);
 assert.equal(mergeEvents([a],[b]).events.length,2);
});
test('el saldo se deriva de movimientos, incluidos retiros', () => {
 assert.equal(stockBalance([{resourceId:'r1',delta:10},{resourceId:'r1',delta:-3},{resourceId:'r2',delta:100}], 'r1'),7);
});
test('el inventario incompleto o con referencia imprecisa no permite atribución individual',()=>{
 assert.equal(estimateVisits(points,[palm,{...palm,id:'p2',lng:palm.lng+.00004,validated:false}],{pilotApproved:true}).visits.length,0);
 assert.equal(estimateVisits(points,[{...palm,accuracy:50}],{pilotApproved:true}).visits.length,0);
});
test('una rama recibida no sobrescribe cambios posteriores de la rama local',()=>{
 const e=(id,version,parentEventId,payload)=>({id,entityId:'a1',kind:'animals',version,parentEventId,payload});
 const events=[e('a1',1,null,{code:'X',name:'Inicial',lot:'1'}),e('a2',2,'a1',{code:'X',name:'Bruno',lot:'1'}),e('a3',3,'a2',{code:'X',name:'Bruno',lot:'2'}),e('b2',2,'a1',{code:'X',name:'Ene',lot:'1'}),e('b3',4,'b2',{code:'X',name:'Ene',lot:'3'})];
 assert.equal(materialize(events).animals[0].lot,'2');
});
test('una cadena recibida se materializa hasta su último cambio aunque llegue al revés',()=>{
 const base={id:'v1',entityId:'a1',kind:'animals',version:1,payload:{code:'X',name:'Inicial'}};
 const v2={...base,id:'v2',version:2,parentEventId:'v1',payload:{...base.payload,name:'Segundo'}};
 const v3={...v2,id:'v3',version:3,parentEventId:'v2',payload:{...base.payload,name:'Último'}};
 for(const incoming of [[v3,v2,base],[v2,v3,base],[base,v3,v2]]){
  const merged=mergeEvents([base],incoming);
  assert.equal(materialize(merged.events).animals[0].eventId,'v3');
  assert.equal(merged.conflicts.length,0);
  assert.equal(materialize(incoming).animals[0].eventId,'v3');
 }
});
test('el orden causal conserva la rama local aunque su versión supere a la rama recibida',()=>{
 const base={id:'base',entityId:'a1',kind:'animals',version:1,payload:{code:'X',name:'Inicial'}};
 const local={...base,id:'local',version:5,parentEventId:'base',payload:{...base.payload,name:'Local'}};
 const received={...base,id:'received',version:2,parentEventId:'base',payload:{...base.payload,name:'Recibido'}};
 const tip={...received,id:'received-tip',version:6,parentEventId:'received'};
 const merged=mergeEvents([base,local],[tip,received,base]);
 assert.equal(materialize(merged.events).animals[0].eventId,'local');
 assert.deepEqual(merged.conflicts[0].proposals.map(e=>e.id),['local','received-tip']);
});
test('un padre o resolución de otra entidad no puede ocultar sus conflictos',()=>{
 const base={id:'base',entityId:'a1',kind:'animals',version:1,payload:{code:'X',name:'Inicial'}};
 const branch={...base,id:'branch',payload:{...base.payload,name:'Propuesta'}};
 for(const patch of [{parentEventId:'base'},{payload:{code:'Y',name:'Otro',resolvedEventIds:['base']}}]){
  const unrelated={...base,id:'unrelated',entityId:'a2',version:2,payload:{code:'Y',name:'Otro'},...patch};
  assert.throws(()=>mergeEvents([base,branch],[unrelated]),/inválid|historial/);
 }
 assert.equal(mergeEvents([base],[branch]).conflicts.length,1);
});
test('las dependencias conocidas avanzan la versión y no forman ciclos',()=>{
 const base={id:'base',entityId:'a1',kind:'animals',version:2,payload:{code:'X',name:'Inicial'}};
 const child={...base,id:'child',version:1,parentEventId:'base'};
 assert.throws(()=>mergeEvents([base],[child]),/inválid|historial/);
 assert.throws(()=>mergeEvents([],[{...base,parentEventId:'child'},child]),/inválid|historial/);
});
test('un historial previo con padre ausente conserva su lectura',()=>{
 const event={id:'e',entityId:'a1',kind:'animals',version:2,parentEventId:'no-incluido',payload:{code:'X',name:'Animal'}};
 assert.equal(materialize(mergeEvents([],[event]).events).animals[0].eventId,'e');
});
test('la importación rechaza entidades desconocidas y coordenadas con tipos incorrectos',()=>{
 const base={id:'e1',entityId:'p1',kind:'palms',version:1,payload:{code:'P1',lat:'bad',lng:0,accuracy:1}};
 assert.throws(()=>mergeEvents([],[base]),/inválid/);
 assert.throws(()=>mergeEvents([],[{...base,kind:'__proto__'}]),/inválid/);
});
test('CSV conserva separadores, comillas y saltos de línea dentro de campos',()=>{
 const csv='codigo;zona;fila\n"P-""01";"Norte;\nSur";1\n';
 assert.deepEqual(parseCsv(csv),[['codigo','zona','fila'],['P-"01','Norte;\nSur','1']]);
});
test('el CSV se exporta con comillas aunque el teléfono no tenga String.replaceAll',()=>{
 const replaceAll=Object.getOwnPropertyDescriptor(String.prototype,'replaceAll');
 try{
  delete String.prototype.replaceAll;
  assert.deepEqual(parseCsv(toCsv([{codigo:'P-"01',zona:'Norte;\nSur'}])),[['codigo','zona'],['P-"01','Norte;\nSur']]);
 }finally{if(replaceAll)Object.defineProperty(String.prototype,'replaceAll',replaceAll);}
});
test('una resolución explícita se aplica al receptor de la otra rama',()=>{
 const base={id:'base',entityId:'a1',kind:'animals',version:1,payload:{code:'X',name:'Inicial',lot:'1'}};
 const a2={...base,id:'a2',version:2,parentEventId:'base',payload:{code:'X',name:'Bruno',lot:'1'}};
 const a3={...a2,id:'a3',version:3,parentEventId:'a2',payload:{code:'X',name:'Bruno',lot:'2'}};
 const b2={...a2,id:'b2',payload:{code:'X',name:'Ene',lot:'1'}};
 const resolution={...a3,id:'r4',version:4,parentEventId:'a3',payload:{...a3.payload,resolvedEventIds:['a2','b2']}};
 const merged=mergeEvents([base,b2],[base,a2,a3,b2,resolution]);
 assert.equal(merged.conflicts.length,0);assert.equal(materialize(merged.events).animals[0].lot,'2');
 const b3={...b2,id:'b3',version:3,parentEventId:'b2',payload:{...b2.payload,lot:'3'}};
 const newer=mergeEvents([base,b2,b3],[base,a2,a3,b2,resolution]);
 assert.equal(materialize(newer.events).animals[0].lot,'3');assert.equal(newer.conflicts.length,1);
});
test('un snapshot o diagnóstico mal formado no puede entrar en una jornada',()=>{
 const session={id:'s',entityId:'s',kind:'sessions',version:1,payload:{start:'2026-10-02T12:00:00.000Z',status:'Terminada',points:[],palmsSnapshot:{}}};
 assert.throws(()=>mergeEvents([],[session]),/inválid/);
 assert.throws(()=>mergeEvents([],[{...session,payload:{...session.payload,palmsSnapshot:[],diagnostics:[{}]}}]),/inválid/);
});
test('los elementos nulos de jornadas se rechazan con errores de registros en español',()=>{
 const session={id:'s',entityId:'s',kind:'sessions',version:1,payload:{start:'2026-10-02T12:00:00.000Z',status:'Terminada',points:[]}};
 for(const patch of [{points:[null]},{diagnostics:[null]},{palmsSnapshot:[null]}]){
  assert.throws(()=>mergeEvents([],[{...session,payload:{...session.payload,...patch}}]),error=>error.constructor===Error&&/inválid/.test(error.message));
 }
});
test('los textos mostrados en pantalla no admiten objetos ni colecciones',()=>{
 const records=[
  {kind:'people',payload:{name:'Responsable',role:{}}},
  {kind:'health',payload:{animalId:'a1',type:'Observación',note:'Revisar',nextDate:[]}},
  {kind:'health',payload:{animalId:'a1',type:'Observación',note:'Revisar',professional:{}}},
  {kind:'plots',payload:{name:'Lote',area:1,cycle:1,planted:{}}},
  {kind:'incidents',payload:{title:'Cerca',target:'Sur',note:'Revisar',resolution:{}}},
  {kind:'tasks',payload:{name:'Revisar',module:'General',priority:{}}},
  {kind:'animals',payload:{code:'X',name:'Animal'},actor:{}}
 ];
 for(const record of records)assert.throws(()=>mergeEvents([],[{id:'e',entityId:'r',version:1,...record}]),/inválid/);
});
test('los indicadores de archivo, revisión y GPS conservan su tipo booleano',()=>{
 const base={id:'e',entityId:'r',kind:'palms',version:1,payload:{code:'P1',lat:10,lng:-75,accuracy:1}};
 for(const field of ['archived','validated','pilotApproved','resolved','mock','native']){
  assert.throws(()=>mergeEvents([],[{...base,payload:{...base.payload,[field]:'false'}}]),/inválid/);
 }
});
test('los números opcionales no admiten infinito, colecciones ni precisión negativa',()=>{
 const records=[
  {kind:'settings',payload:{name:'Finca',farmId:'f',area:Infinity}},
  {kind:'palms',payload:{code:'P1',lat:10,lng:-75,accuracy:1,row:[]}},
  {kind:'plots',payload:{name:'Lote',area:1,cycle:1,plants:Infinity}},
  {kind:'points',payload:{sessionId:'s',segment:'g',lat:10,lng:-75,accuracy:-1,monoMs:0}},
  {kind:'points',payload:{sessionId:'s',segment:'g',lat:10,lng:-75,accuracy:1,monoMs:0,ageMs:Infinity}}
 ];
 for(const record of records)assert.throws(()=>mergeEvents([],[{id:'e',entityId:'r',version:1,...record}]),/inválid/);
});
test('las fechas imposibles no producen cálculos ni calendarios inválidos',()=>{
 const records=[
  {kind:'weights',payload:{animalId:'a1',kg:300,method:'Báscula',date:'2026-02-30'}},
  {kind:'health',payload:{animalId:'a1',type:'Observación',note:'Revisar',nextDate:'mañana'}},
  {kind:'plots',payload:{name:'Lote',area:1,cycle:1,planted:'2026-13-01'}},
  {kind:'sessions',payload:{start:'sin fecha',status:'Terminada',points:[]}}
 ];
 for(const record of records)assert.throws(()=>mergeEvents([],[{id:'e',entityId:'r',version:1,...record}]),/inválid/);
});
test('los calendarios de salud y labores requieren una fecha para ordenar registros',()=>{
 const records=[
  {kind:'health',payload:{animalId:'a1',type:'Observación',note:'Revisar'}},
  {kind:'health',payload:{animalId:'a1',type:'Observación',note:'Revisar',date:'',nextDate:''}},
  {kind:'labors',payload:{plotId:'l1',type:'Limpieza',note:'Terminada'}}
 ];
 for(const record of records)assert.throws(()=>mergeEvents([],[{id:'e',entityId:'r',version:1,...record}]),/inválid/);
});
test('los estados desconocidos no ocultan tareas, animales ni jornadas activas',()=>{
 const records=[
  {kind:'tasks',payload:{name:'Revisar',module:'General',status:'Terminada'}},
  {kind:'animals',payload:{code:'X',name:'Animal',status:'active'}},
  {kind:'sessions',payload:{start:'2026-10-02T12:00:00.000Z',status:'active',points:[]}},
  {kind:'plots',payload:{name:'Lote',area:1,cycle:1,stage:'Cosechado'}}
 ];
 for(const record of records)assert.throws(()=>mergeEvents([],[{id:'e',entityId:'r',version:1,...record}]),/inválid/);
});
test('las colecciones opcionales con valores falsos no rompen el detalle ni los conflictos',()=>{
 const base={id:'e',entityId:'r',kind:'tasks',version:1,payload:{name:'Revisar',module:'General'}};
 for(const patch of [{palmIds:''},{palmIds:0},{resolvedEventIds:0}]){
  assert.throws(()=>mergeEvents([],[{...base,payload:{...base.payload,...patch}}]),/inválid/);
 }
});
test('los campos opcionales vacíos y los formatos de revisión anteriores siguen siendo válidos',()=>{
 const records=[
  {kind:'animals',payload:{code:'X',name:'Animal',birth:''}},
  {kind:'plots',payload:{name:'Lote',area:1,cycle:1,plants:null}},
  {kind:'health',payload:{animalId:'a1',type:'Observación',note:'Revisar',date:'2024-02-29',nextDate:''}},
  {kind:'palms',payload:{code:'P1',lat:10,lng:-75,accuracy:1,reviewedTaskId:null}},
  {kind:'tasks',payload:{name:'Revisar',module:'General',review:{by:'Administrador',date:'2026-10-02',reason:'Inspección'}}},
  {kind:'tasks',payload:{name:'Revisar',module:'General',review:{by:'Administrador',date:'2026-10-02T12:00:00.000Z',reason:'Inspección',photo:null}}}
 ];
 for(const record of records)assert.equal(mergeEvents([],[{id:'e',entityId:'r',version:1,...record}]).events.length,1);
});
