const CACHE='repelon-1387a38cc207';
const ASSETS=["./assets/index-DnAcn8x9.js","./assets/index-Dr2vGh6i.css","./assets/manrope-latin-400-normal-8tf8FM3T.woff","./assets/manrope-latin-400-normal-PaqtzbVb.woff2","./assets/manrope-latin-500-normal-BYYD-dBL.woff2","./assets/manrope-latin-500-normal-DMZssgOp.woff","./assets/manrope-latin-600-normal-4f0koTD-.woff2","./assets/manrope-latin-600-normal-BqgrALkZ.woff","./assets/manrope-latin-700-normal-BZp_XxE4.woff2","./assets/manrope-latin-700-normal-DGRFkw-m.woff","./assets/manrope-latin-800-normal-BfWYOv1c.woff2","./assets/manrope-latin-800-normal-uHUdIJgA.woff","./favicon.svg","./guia-promocional/index.html","./guia-promocional/manrope-400.woff2","./guia-promocional/manrope-800.woff2","./index.html","./manifest.webmanifest"];
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
