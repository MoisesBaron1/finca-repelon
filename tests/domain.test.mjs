import test from 'node:test';
import assert from 'node:assert/strict';
import { estimateVisits, dailyGain, mergeEvents, stockBalance, materialize, parseCsv } from '../src/domain.mjs';

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
test('la importación rechaza entidades desconocidas y coordenadas con tipos incorrectos',()=>{
 const base={id:'e1',entityId:'p1',kind:'palms',version:1,payload:{code:'P1',lat:'bad',lng:0,accuracy:1}};
 assert.throws(()=>mergeEvents([],[base]),/inválid/);
 assert.throws(()=>mergeEvents([],[{...base,kind:'__proto__'}]),/inválid/);
});
test('CSV conserva separadores, comillas y saltos de línea dentro de campos',()=>{
 const csv='codigo;zona;fila\n"P-""01";"Norte;\nSur";1\n';
 assert.deepEqual(parseCsv(csv),[['codigo','zona','fila'],['P-"01','Norte;\nSur','1']]);
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
