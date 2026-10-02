import test from 'node:test';
import assert from 'node:assert/strict';
import { encryptPackage, decryptPackage } from '../src/storage.mjs';
import { seed } from '../src/seed.mjs';
import { mergeEvents } from '../src/domain.mjs';
test('un respaldo protegido conserva IDs y datos de ejemplo separados',async()=>{
 const events=seed('demo','device1');const encrypted=await encryptPackage(events,'finca-segura','demo');
 const decoded=await decryptPackage(encrypted,'finca-segura');
 assert.deepEqual(decoded.events,events);assert.equal(decoded.mode,'demo');assert(!encrypted.includes('Carlos Mendoza'));
});
test('contraseña incorrecta y contenido alterado rechazan el paquete',async()=>{
 const encrypted=await encryptPackage(seed('demo','device1'),'finca-segura','demo');
 await assert.rejects(decryptPackage(encrypted,'otra-clave'),/incorrecta/);
 const e=JSON.parse(encrypted);e.body=e.body.slice(0,30)+'A'+e.body.slice(31);
 await assert.rejects(decryptPackage(JSON.stringify(e),'finca-segura'),/alterado/);
});
test('el inventario inicial de ejemplo se transfiere entre dispositivos sin colisión de IDs',()=>{
 const first=seed('demo','device1'),second=seed('demo','device2');
 assert.equal(mergeEvents(first,second).events.length,first.length);
 assert.equal(mergeEvents(first,second).conflicts.length,0);
});
