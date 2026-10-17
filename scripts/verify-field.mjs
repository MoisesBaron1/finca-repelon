import {chromium} from 'playwright';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import assert from 'node:assert/strict';

let stalled=false,stalledWorker=false;
const root=resolve('dist');
const server=createServer(async(req,res)=>{
 if(stalled&&req.headers['sec-fetch-mode']==='navigate'||stalledWorker&&req.url==='/sw.js')return;
 try{
  let path=decodeURIComponent(new URL(req.url,'http://local').pathname);if(path.endsWith('/'))path+='index.html';
  const file=resolve(root,'.'+path);if(!file.startsWith(root+'/'))throw new Error('path');
  const data=await readFile(file);
  const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.webmanifest':'application/manifest+json','.woff':'font/woff','.woff2':'font/woff2'};
  res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(data);
 }catch{res.writeHead(404);res.end('No encontrado');}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${server.address().port}/`;
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{
 const context=await browser.newContext({viewport:{width:390,height:844},locale:'es-CO',acceptDownloads:true});
 const page=await context.newPage();const errors=[];page.on('pageerror',error=>errors.push(error.message));
 const home=()=>page.getByRole('heading',{name:'¿Qué necesitas hacer?',exact:true});
 await page.goto(base);await home().waitFor();await page.evaluate(()=>navigator.serviceWorker.ready);await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
 stalled=true;
 try{await page.goto(base,{timeout:2200,waitUntil:'domcontentloaded'});}catch(error){throw new Error('La app espera a la red al reabrir aunque ya esté descargada. '+error.message);}
 await home().waitFor();stalled=false;
 console.log('PASS: reapertura inmediata con conexión aparente y red sin respuesta');
 await page.getByRole('button',{name:'Ayuda',exact:true}).click();
 await page.getByText('App guardada para abrir sin señal.',{exact:true}).waitFor();
 stalledWorker=true;await page.getByRole('button',{name:'Comprobar descarga otra vez',exact:true}).click();await page.getByText('App guardada para abrir sin señal.',{exact:true}).waitFor({timeout:2200});stalledWorker=false;
 console.log('PASS: comprobar la descarga no espera una actualización de red bloqueada');
 await page.getByRole('button',{name:'Cerrar',exact:true}).click();
 await context.setOffline(true);
 await page.reload();await home().waitFor();
 const other=await context.newPage();await other.goto(base);await other.getByRole('heading',{name:'¿Qué necesitas hacer?',exact:true}).waitFor();await other.close();
 await page.getByRole('button',{name:'Anotar un dato',exact:false}).click();await page.getByRole('button',{name:'Anotar peso de ganado',exact:false}).click();
 const dialog=()=>page.locator('dialog[open]').last();
 await page.getByLabel('Animal',{exact:true}).selectOption('a1');await dialog().getByRole('button',{name:'Continuar',exact:true}).click();
 await page.getByLabel('Peso en kilogramos',{exact:true}).fill('411');await dialog().getByRole('button',{name:'Continuar',exact:true}).click();await dialog().getByRole('button',{name:'Guardar pesaje',exact:true}).click();
 await dialog().getByRole('heading',{name:'Pesaje guardado',exact:true}).waitFor();await dialog().getByRole('button',{name:'Volver al inicio',exact:true}).click();
 await page.reload();await home().waitFor();await page.goto(base+'#cattle');await page.getByRole('heading',{name:'Ganado bovino',exact:true}).waitFor();assert.match(await page.locator('tr').filter({hasText:'Lucero'}).innerText(),/411 kg/);
 console.log('PASS: modo avión, reapertura en otra pantalla y pesaje persistente sin red');
 await page.getByRole('button',{name:'Ayuda',exact:true}).click();await page.getByText('App guardada para abrir sin señal.',{exact:true}).waitFor();await page.getByText('¿Cómo hago una copia de mis datos?',{exact:true}).click();await page.getByRole('button',{name:'Hacer una copia',exact:true}).click();
 await page.getByLabel('Contraseña de la copia',{exact:true}).fill('PruebaCampo2026');const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Guardar copia protegida',exact:true}).click();const file=await downloadPromise;assert.ok(file.suggestedFilename().endsWith('.finca'));await page.waitForFunction(()=>!document.querySelector('dialog[open]'));
 console.log('PASS: copia cifrada descargada sin conexión');
 await page.evaluate(async()=>{for(const name of await caches.keys()){if(name.startsWith('repelon-')){const cache=await caches.open(name);for(const request of await cache.keys())if(new URL(request.url).pathname.endsWith('.js')&&!request.url.endsWith('/sw.js'))await cache.delete(request);}}});
 await page.getByRole('button',{name:'Ayuda',exact:true}).click();await page.getByText('Falta completar la descarga de la app.',{exact:true}).waitFor();
 assert.deepEqual(errors,[]);
 console.log('PASS: una descarga incompleta se advierte y nunca se anuncia lista');
 await context.close();
}finally{await browser.close();server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
