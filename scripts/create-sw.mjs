import { readdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
async function walk(dir){const entries=await readdir(dir,{withFileTypes:true});return (await Promise.all(entries.filter(x=>x.name!=='downloads'&&x.name!=='sw.js').map(async e=>e.isDirectory()?walk(`${dir}/${e.name}`):[`${dir}/${e.name}`]))).flat();}
const files=await walk('dist');
const hash=createHash('sha256');for(const file of files)hash.update(await readFile(file));
const assets=files.map(p=>'./'+p.replace(/^dist\//,''));
await writeFile('dist/sw.js',`const CACHE='repelon-${hash.digest('hex').slice(0,12)}';
const ASSETS=${JSON.stringify(assets)};
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('repelon-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;e.respondWith(caches.match(e.request).then(found=>found||fetch(e.request).catch(()=>e.request.mode==='navigate'?caches.match('./index.html'):Response.error())))});
`);
console.log(`Offline cache: ${assets.length} assets`);
