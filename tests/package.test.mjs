import test from 'node:test';
import assert from 'node:assert/strict';
import { encryptPackage, decryptPackage } from '../src/storage.mjs';
import { seed } from '../src/seed.mjs';
import { mergeEvents } from '../src/domain.mjs';

// Fixture independiente del exportador: conserva el contrato criptográfico v1 anterior.
async function sealV1Fixture(payload){
 const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12));
 const plain=new TextEncoder().encode(JSON.stringify(payload)),b64=value=>Buffer.from(value).toString('base64');
 const base=await crypto.subtle.importKey('raw',new TextEncoder().encode('finca-segura'),'PBKDF2',false,['deriveKey']);
 const key=await crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:250000,hash:'SHA-256'},base,{name:'AES-GCM',length:256},false,['encrypt']);
 const body=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:new TextEncoder().encode('repelon-v1')},key,plain);
 return JSON.stringify({format:'repelon-encrypted',schema:1,salt:b64(salt),iv:b64(iv),checksum:b64(await crypto.subtle.digest('SHA-256',plain)),body:b64(body)});
}
test('un respaldo protegido conserva IDs y datos de ejemplo separados',async()=>{
 const events=seed('demo','device1');const encrypted=await encryptPackage(events,'finca-segura','demo');
 const decoded=await decryptPackage(encrypted,'finca-segura');
 assert.deepEqual(decoded.events,events);assert.equal(decoded.mode,'demo');assert(!encrypted.includes('Carlos Mendoza'));
});
test('las copias válidas del contrato v1 anterior siguen abriendo sin migración',async()=>{
 const events=seed('real','device1'),payload={format:'repelon',schema:1,mode:'real',farmId:events[0].farmId,farmName:'Mi finca',createdAt:'2026-10-01T12:00:00Z',events};
 assert.deepEqual(await decryptPackage(await sealV1Fixture(payload),'finca-segura'),payload);
});
test('un contenido autenticado con registros corruptos se rechaza antes de importarse',async()=>{
 const events=seed('real','device1'),base={format:'repelon',schema:1,mode:'real',farmId:events[0].farmId,events};
 const person={...events[1],payload:{name:'Responsable',role:{}}};
 const session={...events[1],id:'s',entityId:'s',kind:'sessions',payload:{start:'2026-10-02T12:00:00Z',status:'Terminada',points:[null]}};
 for(const payload of [null,[],{...base,events:null},{...base,events:[events[0],person]},{...base,events:[...events,session]}]){
  await assert.rejects(decryptPackage(await sealV1Fixture(payload),'finca-segura'),/alterado/);
 }
});
test('contraseña incorrecta y contenido alterado rechazan el paquete',async()=>{
 const encrypted=await encryptPackage(seed('demo','device1'),'finca-segura','demo');
 await assert.rejects(decryptPackage(encrypted,'otra-clave'),/incorrecta/);
 const e=JSON.parse(encrypted);e.body=e.body.slice(0,30)+'A'+e.body.slice(31);
 await assert.rejects(decryptPackage(JSON.stringify(e),'finca-segura'),/alterado/);
});
test('un JSON sin sobre de copia devuelve un error comprensible en español',async()=>{
 for(const text of ['null','[]','true','123','"copia"','{}']){
  await assert.rejects(decryptPackage(text,'finca-segura'),error=>error.constructor===Error&&/copia|archivo/.test(error.message));
 }
});
test('una copia no se crea si faltan la finca o los registros son inválidos',async()=>{
 for(const events of [[],null,{}])await assert.rejects(encryptPackage(events,'finca-segura','real'),error=>error.constructor===Error&&/registros|finca|copia/.test(error.message));
 const events=seed('real','device1');
 await assert.rejects(encryptPackage([...events,{...events[1],id:'invalid',payload:{name:'Responsable',role:{}}}],'finca-segura','real'),/inválid/);
});
test('el modo y las contraseñas de copias se validan antes de crear un archivo',async()=>{
 const events=seed('demo','device1');
 await assert.rejects(encryptPackage(events,'finca-segura','unknown'),/modo|copia|formato/i);
 for(const password of [null,12345678,[],{},'corta']){
  await assert.rejects(encryptPackage(events,password,'demo'),error=>error.constructor===Error&&/contraseña|8 caracteres/.test(error.message));
 }
});
test('la copia no se crea mezclando registros de otra finca',async()=>{
 const first=seed('real','device1'),second=seed('real','device2');
 await assert.rejects(encryptPackage([...first,{...second[1],id:'other-person',entityId:'other-person'}],'finca-segura','real'),/finca/);
});
test('los campos corruptos de un sobre nunca producen errores técnicos ni datos importados',async()=>{
 const encrypted=await encryptPackage(seed('demo','device1'),'finca-segura','demo'),envelope=JSON.parse(encrypted);
 for(const patch of [{salt:null},{salt:[]},{iv:'AA=='},{checksum:{}},{body:null},{body:'no-es-base64'},{schema:2}]){
  await assert.rejects(decryptPackage(JSON.stringify({...envelope,...patch}),'finca-segura'),error=>error.constructor===Error&&/copia|alterado/.test(error.message));
 }
 for(const password of [null,12345678,[],{},'corta'])await assert.rejects(decryptPackage(encrypted,password),/8 caracteres/);
});
test('el inventario inicial de ejemplo se transfiere entre dispositivos sin colisión de IDs',()=>{
 const first=seed('demo','device1'),second=seed('demo','device2');
 assert.equal(mergeEvents(first,second).events.length,first.length);
 assert.equal(mergeEvents(first,second).conflicts.length,0);
});
