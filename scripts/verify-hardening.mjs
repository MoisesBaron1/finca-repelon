import {chromium} from 'playwright';
import assert from 'node:assert/strict';

const base=process.env.BASE_URL||'http://127.0.0.1:5173/';
const proxyUrl=/^https:/.test(base)&&(process.env.HTTPS_PROXY||process.env.HTTP_PROXY);
const browser=await chromium.launch({headless:true,args:['--no-sandbox'],proxy:proxyUrl?{server:proxyUrl}:undefined});
const cases=[],failures=[];
const test=(name,run)=>cases.push({name,run});
const modal=p=>p.locator('dialog[open]').last();
async function review(p,values){
 for(let step=0;step<5;step++){
  if(await modal(p).getByRole('heading',{name:'Revisa tu anotación',exact:true}).count())return;
  for(const [name,value] of Object.entries(values)){
   const input=modal(p).locator(`[name="${name}"]`);
   if(await input.count()&&await input.isVisible()){
    if(await input.evaluate(e=>e.tagName==='SELECT'))await input.selectOption(String(value));else await input.fill(String(value));
   }
  }
  await modal(p).getByRole('button',{name:'Continuar',exact:true}).click();
 }
 throw new Error('No se llegó a la revisión.');
}
async function events(p,mode='demo'){
 return p.evaluate(mode=>new Promise((resolve,reject)=>{
  const request=indexedDB.open('repelon-offline');
  request.onsuccess=()=>{const db=request.result,get=db.transaction('data').objectStore('data').get(`dataset.${mode}`);get.onsuccess=()=>{db.close();resolve(get.result)};get.onerror=()=>reject(get.error)};
  request.onerror=()=>reject(request.error);
 }),mode);
}
async function saved(p,title){await modal(p).getByRole('heading',{name:title,exact:true}).waitFor();await modal(p).getByRole('button',{name:'Seguir en esta pantalla',exact:true}).click();}
const latest=(data,kind,id)=>data.filter(e=>e.kind===kind&&(!id||e.entityId===id)).sort((a,b)=>b.version-a.version)[0];

test('Los errores al reportar una tarea se explican y permiten reintentar',async(p,context,errors)=>{
 await p.goto(`${base}#tasks`);await p.getByRole('button',{name:/Limpieza de plateo/}).click();
 await p.evaluate(()=>{const original=IDBObjectStore.prototype.put;IDBObjectStore.prototype.put=function(...args){if(!window.allowSave)throw new Error('No hay espacio para guardar.');return original.apply(this,args)};});
 await modal(p).getByRole('button',{name:'Reportar terminada',exact:true}).click();
 await modal(p).getByRole('alert').filter({hasText:'No hay espacio para guardar.'}).waitFor();
 assert.equal(latest(await events(p),'tasks','t1').payload.status,'En curso');
 assert.deepEqual(errors,[]);
 await p.evaluate(()=>window.allowSave=true);
 await modal(p).getByRole('button',{name:'Reportar terminada',exact:true}).click();
 await p.locator('dialog').waitFor({state:'hidden'});
 assert.equal(latest(await events(p),'tasks','t1').payload.status,'Por revisar');
});

test('Quitar una foto de la ficha elimina la foto del registro vigente',async p=>{
 await p.goto(`${base}#cattle`);await p.getByRole('button',{name:'Ver ficha de Lucero',exact:true}).click();await modal(p).getByRole('button',{name:'Editar ficha',exact:true}).click();
 const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aZHsAAAAASUVORK5CYII=','base64');
 if(!(await modal(p).locator('input[type="file"]').count()))await modal(p).getByRole('button',{name:'Continuar',exact:true}).click();
 await modal(p).locator('input[type="file"]').setInputFiles({name:'foto.png',mimeType:'image/png',buffer:png});
 await modal(p).locator('.photo-preview img').waitFor();
 if(await modal(p).getByRole('button',{name:'Continuar',exact:true}).count())await review(p,{});
 await modal(p).getByRole('button',{name:/^Guardar (registro|animal)$/}).click();await saved(p,'Animal guardado');
 assert.ok(latest(await events(p),'animals','a1').payload.photo);
 await p.getByRole('button',{name:'Ver ficha de Lucero',exact:true}).click();await modal(p).getByRole('button',{name:'Editar ficha',exact:true}).click();
 if(!(await modal(p).getByRole('button',{name:'Quitar foto',exact:true}).count())){
  for(let i=0;i<4;i++){await modal(p).getByRole('button',{name:'Continuar',exact:true}).click();if(await modal(p).getByRole('button',{name:'Quitar foto',exact:true}).count())break;}
 }
 await modal(p).getByRole('button',{name:'Quitar foto',exact:true}).click();
 if(await modal(p).getByRole('button',{name:'Continuar',exact:true}).count())await review(p,{});
 await modal(p).getByRole('button',{name:/^Guardar (registro|animal)$/}).click();await saved(p,'Animal guardado');
 assert.ok(!latest(await events(p),'animals','a1').payload.photo);
});

test('Abrir otra pestaña conserva una jornada que sigue capturando GPS',async(p,context)=>{
 await p.goto(base);await p.getByRole('button',{name:'Iniciar jornada',exact:false}).click();await review(p,{personId:'u1',zone:'Palmar norte'});await modal(p).getByRole('button',{name:'Comenzar jornada',exact:true}).click();
 await p.locator('.ongoing-journey').waitFor();
 const session=latest(await events(p),'sessions');
 const second=await context.newPage();await second.goto(`${base}#tasks`);await second.getByRole('heading',{name:'Tareas de la finca'}).waitFor();
 await second.waitForTimeout(400);
 assert.equal(latest(await events(p),'sessions',session.entityId).payload.status,'En curso');
 await second.close();
 await p.locator('.ongoing-journey').getByRole('button',{name:'Finalizar jornada',exact:true}).click();await modal(p).getByRole('button',{name:'Sí, finalizar y guardar',exact:true}).click();await saved(p,'Jornada guardada');
});

test('Una finca vacía explica qué falta y continúa al crear el primer animal',async p=>{
 await p.goto(base);await p.getByRole('button',{name:'Datos de ejemplo',exact:true}).click();await modal(p).getByRole('button',{name:'Usar mi finca',exact:true}).click();
 await p.getByRole('button',{name:'Ganado',exact:true}).click();await p.getByRole('button',{name:'Registrar pesaje',exact:true}).click();
 await modal(p).getByRole('button',{name:'Añadir mi primer animal',exact:true}).click();
 await review(p,{code:'PR-01',name:'Mi vaca',sex:'Hembra',lot:'Potrero 1',status:'Activo'});
 await modal(p).getByRole('button',{name:'Guardar animal',exact:true}).click();await modal(p).getByRole('heading',{name:'Animal guardado'}).waitFor();
 await modal(p).getByRole('button',{name:'Continuar con el pesaje',exact:true}).click();
 assert.match(await p.getByLabel('Animal',{exact:true}).locator('option:checked').innerText(),/Mi vaca/);
 await review(p,{kg:'350',method:'Báscula'});await modal(p).getByRole('button',{name:'Guardar pesaje',exact:true}).click();await saved(p,'Pesaje guardado');
 const data=await events(p,'real');assert.equal(data.filter(e=>e.kind==='weights').length,1);
});

test('La configuración protege una edición pendiente frente al cambio de otra pestaña',async(p,context)=>{
 await p.goto(`${base}#settings`);await p.getByLabel('Nombre de la finca',{exact:true}).fill('Mi edición pendiente');
 const second=await context.newPage();await second.goto(`${base}#settings`);await second.getByLabel('Nombre de la finca',{exact:true}).fill('Cambio confirmado');await second.getByRole('button',{name:'Guardar configuración',exact:true}).click();
 await second.locator('.sidebar-farm').filter({hasText:'Cambio confirmado'}).waitFor();
 await p.bringToFront();await p.locator('.sidebar-farm').filter({hasText:'Cambio confirmado'}).waitFor();
 await p.getByRole('button',{name:'Guardar configuración',exact:true}).click();
 await p.getByRole('alert').filter({hasText:'cambió en otra pantalla'}).waitFor();
 assert.equal(latest(await events(p),'settings','farm').payload.name,'Cambio confirmado');
 assert.equal(await p.getByLabel('Nombre de la finca',{exact:true}).inputValue(),'Mi edición pendiente');await second.close();
});

test('Los conflictos guardados con la versión anterior se pueden resolver',async p=>{
 await p.goto(`${base}#reports`);await p.getByRole('heading',{name:'Informes y seguimiento'}).waitFor();
 await p.evaluate(()=>new Promise((resolve,reject)=>{
  const open=indexedDB.open('repelon-offline');open.onsuccess=()=>{
   const db=open.result,tx=db.transaction('data','readwrite'),store=tx.objectStore('data'),request=store.get('dataset.demo');
   request.onsuccess=()=>{const data=request.result,base=data.find(e=>e.kind==='tasks'&&e.entityId==='t1');
    for(const [id,name] of [['legacy-local','Edición local anterior'],['legacy-remote','Edición recibida anterior']])data.push({...base,id,version:2,parentEventId:base.id,payload:{...base.payload,name,eventId:base.id,version:1,updatedAt:base.time,actor:base.actor}});
    store.put(data,'dataset.demo');};tx.oncomplete=()=>{db.close();resolve()};tx.onerror=()=>reject(tx.error);
  };open.onerror=()=>reject(open.error);
 }));
 await p.reload();await p.getByRole('tab',{name:/^Conflictos/}).click();await p.getByRole('button',{name:'Resolver',exact:true}).click();
 await modal(p).getByLabel('Motivo de la decisión').fill('Conservar la propuesta actual revisada.');
 await modal(p).getByRole('button',{name:'Conservar propuesta',exact:true}).click();await p.locator('dialog').waitFor({state:'hidden'});
 await p.getByRole('heading',{name:'Sin conflictos pendientes',exact:true}).waitFor();
 const data=await events(p);assert.equal(latest(data,'tasks','t1').payload.name,'Edición local anterior');
 assert.ok(data.some(e=>e.id==='legacy-local')&&data.some(e=>e.id==='legacy-remote'));
});

test('Corregir un pesaje conserva su identidad y muestra el nuevo valor',async p=>{
 await p.goto(`${base}#cattle`);await p.getByRole('button',{name:'Ver ficha de Lucero',exact:true}).click();
 await modal(p).getByRole('button',{name:/^Corregir pesaje del /}).first().click();
 await review(p,{kg:'377',method:'Báscula'});await modal(p).getByRole('button',{name:'Guardar pesaje',exact:true}).click();await saved(p,'Pesaje guardado');
 const data=await events(p);assert.equal(new Set(data.filter(e=>e.kind==='weights'&&e.payload.animalId==='a1').map(e=>e.entityId)).size,3);
 assert.equal(latest(data,'weights','w0-2').payload.kg,377);
});

for(const {name,run} of cases){
 if(process.env.TEST_CASE&&!name.includes(process.env.TEST_CASE))continue;
 const context=await browser.newContext({viewport:{width:1280,height:1000},locale:'es-CO',geolocation:{latitude:10.495,longitude:-75.125,accuracy:3},permissions:['geolocation']});
 const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));p.setDefaultTimeout(3500);
 try{await run(p,context,errors);assert.deepEqual(errors,[]);console.log(`PASS ${name}`)}catch(e){failures.push(name);console.error(`FAIL ${name}: ${e.message.split('\n')[0]}`)}finally{await context.close()}
}
await browser.close();assert.deepEqual(failures,[],`Recorridos fallidos: ${failures.join(', ')}`);
