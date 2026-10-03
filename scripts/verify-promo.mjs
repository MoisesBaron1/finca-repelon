import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import {readFileSync,mkdirSync} from 'node:fs';

const base=process.env.APP_URL||'http://127.0.0.1:5173';
// El Chromium del sistema incluye H.264/AAC; algunas compilaciones de Playwright no.
const executablePath=process.env.PROMO_BROWSER_PATH||'/usr/bin/chromium';
const proxyUrl=process.env.HTTPS_PROXY||process.env.HTTP_PROXY;
const proxy=proxyUrl&&!['localhost','127.0.0.1'].includes(new URL(base).hostname)?{server:proxyUrl,bypass:'localhost,127.0.0.1'}:undefined;
const browser=await chromium.launch({executablePath,headless:true,args:['--no-sandbox'],proxy});
try{
 const context=await browser.newContext({viewport:{width:1280,height:900},locale:'es-CO'});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'/guia-promocional/');
 await page.getByRole('heading',{name:'La finca, a tu alcance.'}).waitFor();
 const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
 assert.deepEqual(result.violations.map(v=>({id:v.id,target:v.nodes.map(n=>n.target)})),[]);
 for(const width of [320,390,1280]){
  await page.setViewportSize({width,height:900});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Desbordamiento a ${width}px`);
 }
 const links=await page.locator('a[href^="/downloads/"]').evaluateAll(els=>[...new Set(els.map(e=>e.getAttribute('href')))]);
 for(const link of links){const r=await context.request.get(base+link);assert.equal(r.status(),200,link);assert.ok((await r.body()).length>0)}
 assert.ok(await page.locator('video').evaluate(v=>v.canPlayType('video/mp4; codecs="avc1.4d401f, mp4a.40.2"')),'El navegador de pruebas necesita H.264/AAC');
 await page.locator('video').evaluate(v=>{v.preload='metadata';v.load()});
 await page.waitForFunction(()=>document.querySelector('video').readyState>=1);
 assert.ok(Math.abs(await page.locator('video').evaluate(v=>v.duration)-71)<0.1);
 await page.locator('video').evaluate(v=>{v.muted=true;v.play()});
 await page.waitForFunction(()=>document.querySelector('video').currentTime>.3);
 await page.locator('video').evaluate(v=>v.pause());
 assert.equal(await page.locator('video').evaluate(v=>v.error),null);
 const sw=readFileSync('dist/sw.js','utf8');assert.ok(!sw.includes('.mp4'));assert.ok(!sw.includes('downloads/'));
 assert.deepEqual(errors,[]);
 mkdirSync('artifacts',{recursive:true});
 await page.setViewportSize({width:390,height:844});
 await page.screenshot({path:'artifacts/promo-mobile.png',fullPage:true});
 console.log(`PASS: guía, WCAG AA, 320/390/1280px, ${links.length} descargas, reproducción H.264/AAC y caché offline ligera`);
}finally{await browser.close()}
