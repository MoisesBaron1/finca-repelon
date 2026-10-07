import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const baseUrl=process.env.BASE_URL||'http://127.0.0.1:5173/';
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
const context=await browser.newContext({viewport:{width:1440,height:1100},locale:'es-CO'});
const errors=[];
let page;
try {
 // Run before any app module: Android WebViews can lack these built-in methods.
 await context.addInitScript(()=>{
  for(const name of ['toSorted','toReversed','at'])Object.defineProperty(Array.prototype,name,{value:undefined,writable:true,configurable:true});
  Object.defineProperty(crypto,'randomUUID',{value:undefined,writable:true,configurable:true});
  window.__compatApisMissing=['toSorted','toReversed','at'].every(name=>Array.prototype[name]===undefined)&&crypto.randomUUID===undefined;
  window.__compatRandomCalls=0;
  const getRandomValues=crypto.getRandomValues.bind(crypto);
  Object.defineProperty(crypto,'getRandomValues',{configurable:true,value:array=>{window.__compatRandomCalls++;return getRandomValues(array);}});
 });
 page=await context.newPage();
 page.setDefaultTimeout(10000);
 page.on('pageerror',error=>errors.push(error.message));
 const dialog=()=>page.locator('dialog[open]').last();
 await page.goto(baseUrl);
 await page.getByRole('heading',{name:'¿Qué necesitas hacer?',exact:true}).waitFor();
 assert.equal(await page.evaluate(()=>window.__compatApisMissing),true,'APIs must be disabled before loading the app');
 assert.equal(await page.evaluate(()=>['toSorted','toReversed','at'].every(name=>typeof Array.prototype[name]==='function')&&typeof crypto.randomUUID==='function'),true);
 console.log('PASS home loads with toSorted, toReversed, at and randomUUID initially missing');

 await page.getByRole('button',{name:'Tareas',exact:true}).first().click();
 await page.getByRole('heading',{name:'Tareas de la finca',exact:true}).waitFor();
 const taskName='Tarea de compatibilidad sin APIs recientes';
 await page.getByRole('button',{name:'Nueva tarea',exact:true}).click();
 for(let step=0;step<5;step++){
  if(await dialog().getByRole('heading',{name:'Revisa tu anotación',exact:true}).count())break;
  for(const [name,value] of Object.entries({name:taskName,module:'General',zone:'Prueba WebView',personId:'u1'})){
   const field=dialog().locator(`[name="${name}"]`);
   if(await field.count()&&await field.isVisible()){
    if(await field.evaluate(element=>element.tagName==='SELECT'))await field.selectOption(value);else await field.fill(value);
   }
  }
  await dialog().getByRole('button',{name:'Continuar',exact:true}).click();
 }
 await dialog().getByRole('heading',{name:'Revisa tu anotación',exact:true}).waitFor();
 await dialog().getByRole('button',{name:'Guardar tarea',exact:true}).click();
 await dialog().getByRole('heading',{name:'Tarea guardada',exact:true}).waitFor();
 await dialog().getByRole('button',{name:'Seguir en esta pantalla',exact:true}).click();
 await page.reload();
 await page.getByRole('button',{name:taskName,exact:false}).first().waitFor();
 const saved=await page.evaluate(async name=>{
  const database=await new Promise((resolve,reject)=>{const request=indexedDB.open('repelon-offline',1);request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});
  try{
   const events=await new Promise((resolve,reject)=>{const request=database.transaction('data').objectStore('data').get('dataset.demo');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});
   const event=events.find(event=>event.kind==='tasks'&&event.payload.name===name);
   return {id:event?.id,entityId:event?.entityId,randomCalls:window.__compatRandomCalls};
  }finally{database.close();}
 },taskName);
 const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
 assert.match(saved.id,uuid);
 assert.match(saved.entityId,uuid);
 assert.notEqual(saved.id,saved.entityId);
 assert.ok(saved.randomCalls>0,'UUID fallback must call crypto.getRandomValues');
 console.log('PASS task saves with secure UUID v4 identifiers and survives reload');
 await page.getByRole('button',{name:taskName,exact:false}).first().click();
 await dialog().getByRole('heading',{name:taskName,exact:true}).waitFor();
 await dialog().getByRole('button',{name:'Cerrar',exact:true}).click();

 await page.getByRole('button',{name:'Ganado',exact:true}).first().click();
 await page.getByRole('heading',{name:'Ganado bovino',exact:true}).waitFor();
 await page.getByRole('button',{name:'Ver ficha de Lucero',exact:true}).click();
 await dialog().getByRole('heading',{name:'Evolución del peso',exact:true}).waitFor();
 await dialog().getByRole('button',{name:'Cerrar',exact:true}).click();
 await page.getByRole('button',{name:'Palmas y jornadas',exact:true}).first().click();
 await page.getByRole('heading',{name:'Palma y jornadas',exact:true}).waitFor();
 await page.getByRole('tab',{name:'Jornadas',exact:true}).click();
 await page.getByRole('heading',{name:'Jornadas registradas',exact:true}).waitFor();
 await page.getByRole('button',{name:'Informes',exact:true}).first().click();
 await page.getByRole('heading',{name:'Informes y seguimiento',exact:true}).waitFor();
 await page.getByRole('tab',{name:'Historial',exact:true}).click();
 await page.getByRole('heading',{name:'Historial de registros',exact:true}).waitFor();
 assert.ok((await page.locator('tbody').innerText()).includes(taskName));
 const date=await page.evaluate(()=>new Intl.DateTimeFormat('es-CO',{year:'numeric',month:'long',day:'numeric'}).format(new Date('2026-10-07T12:00:00Z')));
 assert.match(date,/2026/);
 assert.match(date.toLowerCase(),/octubre/);
 assert.deepEqual(errors,[]);
 console.log('PASS tasks, cattle weight history, journeys, reports and Spanish date formatting without browser errors');
}catch(error){
 if(page)console.error(JSON.stringify({browserErrors:errors,screen:await page.locator('#root').innerText().catch(()=>null)}));
 throw error;
}finally{
 await browser.close();
}
