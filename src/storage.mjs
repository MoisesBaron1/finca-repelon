import { uid, mergeEvents, materialize } from './domain.mjs';
import { seed } from './seed.mjs';

export const isNative = () => !!globalThis.RepelonNative;
export const MAX_DATA_BYTES=40*1024*1024;
export const MAX_PACKAGE_BYTES=75*1024*1024;
function checkSize(value){if(new TextEncoder().encode(JSON.stringify(value)).byteLength>MAX_DATA_BYTES)throw new Error('Se alcanzó la capacidad de registros de este MVP (40 MB). Conserva una copia antes de añadir más adjuntos.');}
let dbPromise;
function db() {
 if(!dbPromise)dbPromise=new Promise((resolve,reject)=>{
  const request=indexedDB.open('repelon-offline',1);
  request.onupgradeneeded=()=>request.result.createObjectStore('data');
  request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);
 });
 return dbPromise;
}
export async function read(key) {
 if(isNative()) {const value=RepelonNative.read(key);return value?JSON.parse(value):null;}
 const database=await db();
 return new Promise((resolve,reject)=>{const req=database.transaction('data').objectStore('data').get(key);req.onsuccess=()=>resolve(req.result??null);req.onerror=()=>reject(req.error);});
}
export async function write(key,value) {
 if(key.startsWith('dataset.'))checkSize(value);
 if(isNative()) {
  const result=JSON.parse(RepelonNative.write(key,JSON.stringify(value)));
  if(!result.ok)throw new Error(result.error||'No se pudo guardar en el teléfono.');
  return;
 }
 const database=await db();
 return new Promise((resolve,reject)=>{const tx=database.transaction('data','readwrite');tx.objectStore('data').put(value,key);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||new Error('La escritura se interrumpió.'));});
}
async function ensureKey(key,fallback) {
 if(isNative()){const current=await read(key);if(current!==null)return current;await write(key,fallback);return fallback;}
 const database=await db();return new Promise((resolve,reject)=>{
  const tx=database.transaction('data','readwrite'),store=tx.objectStore('data');let result;
  const req=store.get(key);req.onsuccess=()=>{result=req.result??fallback;if(req.result===undefined)store.put(result,key);};
  tx.oncomplete=()=>resolve(result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||new Error('No se pudo preparar el almacenamiento.'));
 });
}
export async function deviceId() {
 return ensureKey('device',uid());
}
export async function loadDataset(mode) {
 return ensureKey(`dataset.${mode}`,seed(mode,await deviceId()));
}
let lock=Promise.resolve();
export function transact(mode,mutator) {
 const job=lock.then(async()=>{
  await loadDataset(mode);
  if(isNative()){const next=mutator(await read(`dataset.${mode}`));checkSize(next);await write(`dataset.${mode}`,next);return next;}
  const database=await db();
  return new Promise((resolve,reject)=>{
   const tx=database.transaction('data','readwrite'),store=tx.objectStore('data');let next,problem;
   const req=store.get(`dataset.${mode}`);req.onsuccess=()=>{try{next=mutator(req.result);if(!Array.isArray(next))throw new Error('La operación local debe devolver registros válidos.');checkSize(next);store.put(next,`dataset.${mode}`);}catch(e){problem=e;tx.abort();}};
   tx.oncomplete=()=>resolve(next);tx.onerror=()=>reject(problem||tx.error);tx.onabort=()=>reject(problem||tx.error||new Error('La escritura se interrumpió.'));
  });
 });
 lock=job.catch(()=>{});return job;
}

const b64=bytes=>{let s='';for(const b of bytes)s+=String.fromCharCode(b);return btoa(s);};
const unb64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
async function keyFor(password,salt,usage) {
 if(typeof password!=='string'||password.length<8)throw new Error('Usa una contraseña de al menos 8 caracteres.');
 const base=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveKey']);
 return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:250000,hash:'SHA-256'},base,{name:'AES-GCM',length:256},false,[usage]);
}
function packageFarm(events){
 if(!Array.isArray(events))throw new Error('La copia contiene registros inválidos.');
 checkSize(events);mergeEvents([],events);
 const settings=materialize(events).settings;
 if(!settings||settings.length!==1)throw new Error('La copia debe contener una única finca válida.');
 const farm=settings[0];
 if(events.some(e=>e.farmId!==farm.farmId))throw new Error('La copia contiene registros de otra finca.');
 return farm;
}
export async function encryptPackage(events,password,mode) {
 if(!['demo','real'].includes(mode))throw new Error('El modo de la copia no es válido.');
 const farm=packageFarm(events),payload={format:'repelon',schema:1,mode,farmId:farm.farmId,farmName:farm.name,createdAt:new Date().toISOString(),events};
 const plain=new TextEncoder().encode(JSON.stringify(payload)),checksum=b64(new Uint8Array(await crypto.subtle.digest('SHA-256',plain)));
 const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12));
 const key=await keyFor(password,salt,'encrypt');
 const encrypted=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:new TextEncoder().encode('repelon-v1')},key,plain);
 return JSON.stringify({format:'repelon-encrypted',schema:1,salt:b64(salt),iv:b64(iv),checksum,body:b64(new Uint8Array(encrypted))});
}
export async function decryptPackage(text,password) {
 let envelope;try{envelope=JSON.parse(text);}catch{throw new Error('El archivo no es una copia de Finca Repelón.');}
 if(!envelope||typeof envelope!=='object'||Array.isArray(envelope)||envelope.format!=='repelon-encrypted'||envelope.schema!==1)throw new Error('Formato de copia no compatible.');
 try {
  if(['salt','iv','checksum','body'].some(field=>typeof envelope[field]!=='string'))throw new Error('envelope');
  const salt=unb64(envelope.salt),iv=unb64(envelope.iv),body=unb64(envelope.body);
  if(salt.length!==16||iv.length!==12||unb64(envelope.checksum).length!==32||body.length<16)throw new Error('envelope');
  const key=await keyFor(password,salt,'decrypt');
  const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv,additionalData:new TextEncoder().encode('repelon-v1')},key,body);
  const checksum=b64(new Uint8Array(await crypto.subtle.digest('SHA-256',plain)));
  if(checksum!==envelope.checksum)throw new Error('checksum');
  const payload=JSON.parse(new TextDecoder().decode(plain));
  if(!payload||typeof payload!=='object'||Array.isArray(payload)||payload.format!=='repelon'||payload.schema!==1||typeof payload.farmId!=='string'||!payload.farmId||!['demo','real'].includes(payload.mode))throw new Error('schema');
  const farm=packageFarm(payload.events);
  if(farm.farmId!==payload.farmId)throw new Error('farm-config');
  return payload;
 }catch(error){if(error.message.includes('8 caracteres'))throw error;throw new Error('Contraseña incorrecta o archivo alterado. No se importó ningún dato.');}
}
export async function download(name,content,type='text/plain;charset=utf-8') {
 if(isNative()) {
  const body=typeof content==='string'?content:await content.text();
  return new Promise((resolve,reject)=>{
   function done(e){window.removeEventListener('native-export',done);e.detail.ok?resolve():reject(new Error(e.detail.message||'No se exportó el archivo.'));}
   window.addEventListener('native-export',done);
   try{const result=JSON.parse(RepelonNative.exportFile(name,body,type));if(!result.ok){window.removeEventListener('native-export',done);reject(new Error(result.error));}}catch(e){window.removeEventListener('native-export',done);reject(e);}
  });
 }
 const blob=content instanceof Blob?content:new Blob([content],{type});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);
}
