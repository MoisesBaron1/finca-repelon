import { readdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
async function walk(dir){const entries=await readdir(dir,{withFileTypes:true});return (await Promise.all(entries.filter(x=>x.name!=='downloads'&&x.name!=='sw.js').map(async e=>e.isDirectory()?walk(`${dir}/${e.name}`):[`${dir}/${e.name}`]))).flat();}
const files=await walk('dist');
const hash=createHash('sha256');for(const file of files)hash.update(await readFile(file));
const assets=files.map(p=>'./'+p.replace(/^dist\//,''));
await writeFile('dist/sw.js',`const CACHE='repelon-${hash.digest('hex').slice(0,12)}';
const ASSETS=${JSON.stringify(assets)};
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('repelon-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('message',e=>{if(e.data?.type!=='REPELON_OFFLINE_STATUS'||!e.ports[0])return;e.waitUntil(caches.open(CACHE).then(async cache=>{const available=await Promise.all(ASSETS.map(asset=>cache.match(asset)));e.ports[0].postMessage({ready:available.every(response=>response?.ok),assets:ASSETS.length,cache:CACHE});}).catch(()=>e.ports[0].postMessage({ready:false})));});
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;
 if(e.request.mode==='navigate'){
  e.respondWith((async()=>{const cache=await caches.open(CACHE);const url=new URL(e.request.url);url.hash='';url.search='';if(url.pathname.endsWith('/'))url.pathname+='index.html';const saved=await cache.match(url.href);if(saved)return saved;try{return await fetch(e.request);}catch{return await cache.match('./index.html')||Response.error();}})());return;
 }
 e.respondWith(caches.open(CACHE).then(cache=>cache.match(e.request)).then(found=>found||fetch(e.request).catch(()=>Response.error())));
});
`);
console.log(`Offline cache: ${assets.length} assets`);
