import test from 'node:test';
import assert from 'node:assert/strict';
import {appendRecords,importRecords} from '../src/records.mjs';
import {seed} from '../src/seed.mjs';
import {materialize} from '../src/domain.mjs';

const save=(events,kind,payload)=>appendRecords(events,[{kind,payload}],{deviceId:'device-test'});
test('una copia de otra finca no borra los responsables añadidos',()=>{
 const local=save(seed('real','local'),'people',{name:'Rosa',role:'Encargado'});
 const remote=seed('real','remote');
 assert.throws(()=>importRecords(local,{events:remote,mode:'real',farmId:remote[0].farmId},'real'),/otra finca/);
 assert.equal(materialize(local).people.length,2);
});
test('una finca configurada se conserva al recibir una copia ajena',()=>{
 const base=seed('real','local'),farm=materialize(base).settings[0];
 const local=save(base,'settings',{...farm,name:'La Ceiba'}),remote=seed('real','remote');
 assert.throws(()=>importRecords(local,{events:remote,mode:'real',farmId:remote[0].farmId},'real'),/otra finca/);
});
test('el espacio real recién abierto permite restaurar otra finca',()=>{
 const local=seed('real','local'),remote=seed('real','remote');
 const imported=importRecords(local,{events:remote,mode:'real',farmId:remote[0].farmId},'real');
 assert.equal(materialize(imported).settings[0].farmId,remote[0].farmId);
});
test('una edición desactualizada no sobrescribe el cambio de otra pestaña',()=>{
 const base=seed('demo','device'),task=materialize(base).tasks[0];
 const changed=save(base,'tasks',{...task,name:'Cambio recién guardado'});
 assert.throws(()=>save(changed,'tasks',{...task,name:'Edición desactualizada'}),/cambió/);
 assert.equal(materialize(changed).tasks[0].name,'Cambio recién guardado');
});
test('el saldo decimal exacto se puede retirar sin un falso saldo negativo',()=>{
 let events=save(seed('real','local'),'resources',{id:'r',name:'Semillas',unit:'kg',minimum:0});
 events=save(events,'movements',{resourceId:'r',delta:0.3,date:'2026-10-01',note:'Entrada'});
 events=save(events,'movements',{resourceId:'r',delta:-0.1,date:'2026-10-01',note:'Salida'});
 assert.doesNotThrow(()=>save(events,'movements',{resourceId:'r',delta:-0.2,date:'2026-10-01',note:'Salida final'}));
 assert.throws(()=>save(events,'movements',{resourceId:'r',delta:-0.21,date:'2026-10-01',note:'Excede el saldo'}),/supera/);
});
test('dos inicios concurrentes no crean dos jornadas en curso',()=>{
 const base=seed('real','local');
 const first=save(base,'sessions',{id:'s1',name:'Primera',start:'2026-10-01T10:00:00Z',status:'En curso',points:[]});
 assert.throws(()=>save(first,'sessions',{id:'s2',name:'Segunda',start:'2026-10-01T10:00:00Z',status:'En curso',points:[]}),/jornada/);
});
