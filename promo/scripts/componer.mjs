import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';

const timing=JSON.parse(readFileSync('timing.json','utf8'));
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const views={
 intro:{dark:true,label:'FINCA REPELÓN',title:'La finca, a tu alcance.',copy:'Tus anotaciones del campo. En tu celular.',body:'<img class="hero-mark" src="assets/marca.svg" alt="Hoja de Finca Repelón"><div class="promise"><strong>Gratis en esta etapa piloto</strong><span>Pasos cortos · Letras grandes</span></div>',foot:'Un cuaderno de campo fácil de usar.'},
 inicio:{label:'EMPIEZA EN INICIO',title:'¿Qué necesitas hacer?',copy:'Elige uno de los cuatro botones.',body:'<img class="home-screen" src="assets/inicio.png" alt="Inicio real con cuatro acciones"><p class="media-note">Tareas, ganado, cultivos y cuentas.</p>',foot:'Pantallas reales · Datos de ejemplo'},
 animal:{label:'ANOTAR UN PESO · PASO 1',title:'Elige el animal',copy:'Toca «Anotar un dato» y luego «Anotar peso de ganado».',body:'<div class="screen-stack"><div class="choice-stage"><img src="assets/opcion-peso.png" alt="Opción Anotar peso de ganado"><p class="choice-note">Después, selecciona el animal.</p></div><img class="animal-stage screen" src="assets/animal-form.png" alt="Formulario real: animal Lucero y fecha"></div>',foot:'Pantallas reales · Datos de ejemplo'},
 peso:{label:'ANOTAR UN PESO · PASO 2',title:'Escribe el peso',copy:'Indica cómo lo obtuviste: báscula o cinta.',body:'<img class="screen" src="assets/peso-form.png" alt="Peso de ejemplo: 402 kilogramos con báscula">',foot:'Luego toca «Continuar».'},
 revision:{label:'ANOTAR UN PESO · PASO 3',title:'Revisa y guarda',copy:'Puedes volver si necesitas corregir.',body:'<img class="screen" src="assets/revision-form.png" alt="Revisión real antes de Guardar pesaje">',foot:'Si todo está bien, toca «Guardar pesaje».'},
 guardado:{label:'LA APP TE CONFIRMA',title:'Listo. Quedó guardado.',copy:'Verás un aviso al terminar la anotación.',body:'<img class="screen" src="assets/guardado.png" alt="Confirmación real: Pesaje guardado">',foot:'Sin internet: abre la web una vez antes de salir al campo.'},
 ayuda:{label:'SI NECESITAS AYUDA',title:'A tu ritmo',copy:'Toca «Ayuda» para agrandar las letras.',body:'<img class="help-screen" src="assets/letras.png" alt="Botón real Usar texto más grande"><div class="backup-list"><h2>Cuida tus anotaciones</h2><p><span>1</span>Guarda una copia protegida.</p><p><span>2</span>Conserva su contraseña.</p><p><span>3</span>Pasa el archivo a tu equipo.</p></div>',foot:'Cada teléfono conserva sus propios datos.'},
 final:{dark:true,label:'FINCA REPELÓN',title:'Empieza con confianza.',copy:'Abre el enlace de la app y practica con los datos de ejemplo.',body:'<div class="final-actions"><div><span class="action-number">01</span><strong>Abre Finca Repelón</strong><p>Entra desde el enlace compartido.</p></div><div><span class="action-number">02</span><strong>¿Lo usarás en Android?</strong><p>Descarga la app para trabajar sin conexión.</p></div></div><p class="free-final">Gratis durante el piloto</p>',foot:'Anota. Revisa. Guarda.'}
};
mkdirSync('compositions',{recursive:true});
const scenes=timing.scenes.map((s,i)=>{
 const v=views[s.id];
 const duration=Math.min(s.duration+0.8,timing.duration-s.start).toFixed(3);
 const body=v.body;
 const id='scene-'+s.id;
 const motion=`const tl=gsap.timeline({paused:true});const p='#${id}';
 tl.fromTo(p+' .brand',{opacity:0,scale:.96},{opacity:1,scale:1,duration:.5,ease:'sine.out'},.12);
 tl.fromTo(p+' .eyebrow',{opacity:0,x:-16},{opacity:1,x:0,duration:.55,ease:'power2.out'},.18);
 tl.fromTo(p+' h1',{opacity:0,y:28},{opacity:1,y:0,duration:.65,ease:'power3.out'},.25);
 tl.fromTo(p+' .lead',{opacity:0,y:18},{opacity:1,y:0,duration:.6,ease:'power2.out'},.4);
 tl.fromTo(p+' .media',{opacity:0,y:24},{opacity:1,y:0,duration:.65,ease:'power3.out'},.52);
 tl.fromTo(p+' .foot',{opacity:0,y:10},{opacity:1,y:0,duration:.5,ease:'sine.out'},.68);
 ${s.id==='animal'?"tl.fromTo(p+' .animal-stage',{opacity:0},{opacity:1,duration:.6,ease:'power2.inOut'},4.4);tl.to(p+' .choice-stage',{opacity:0,duration:.6,ease:'sine.inOut'},4.4);":''}
 window.__timelines=window.__timelines||{};window.__timelines['${id}']=tl;`;
 writeFileSync(`compositions/${s.id}.html`,`<template><div id="${id}" class="sub-scene ${v.dark?'dark':''}" data-composition-id="${id}" data-width="1080" data-height="1920" data-start="0" data-duration="${duration}"><div class="scene-inner"><div class="scene-content"><div class="brand"><span class="brand-mark" aria-hidden="true"></span><span data-layout-allow-overlap="scene-crossfade">Finca Repelón</span></div><p class="eyebrow" data-layout-allow-overlap="scene-crossfade">${v.label}</p><h1 data-layout-allow-overlap="scene-crossfade">${v.title}</h1><p class="lead" data-layout-allow-overlap="scene-crossfade">${v.copy}</p><div class="media ${s.id}">${body}</div><p class="foot">${v.foot}</p></div></div></div><script>${motion}</script></template>`);
 return `<div id="${id}" class="clip scene" data-composition-id="${id}" data-composition-src="compositions/${s.id}.html" data-start="${s.start}" data-duration="${duration}" data-track-index="${i}"></div>`;
}).join('\n');
const audios=timing.scenes.map(s=>`<audio id="voice-${s.id}" class="clip" src="${s.file}" data-start="${s.voiceStart.toFixed(3)}" data-duration="${s.voiceDuration.toFixed(3)}" data-track-index="8" data-volume="1" preload="auto"></audio>`).join('\n');
const html=`<!doctype html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=1080, height=1920"><title>Finca Repelón — Guía promocional</title><script src="assets/gsap.min.js"></script><style>
@font-face{font-family:Manrope;src:url('assets/manrope-400.woff2') format('woff2');font-weight:400;font-display:block}
@font-face{font-family:Manrope;src:url('assets/manrope-800.woff2') format('woff2');font-weight:800;font-display:block}
*{box-sizing:border-box;margin:0;padding:0}html,body{width:1080px;height:1920px;overflow:hidden;background:#f5f7f5;font-family:Manrope,sans-serif;color:#20382e}#root{width:100%;height:100%;position:relative}.scene{position:absolute;inset:0;width:100%;height:100%;overflow:hidden}.sub-scene{width:100%;height:100%}.scene-inner{width:100%;height:100%;background:#f5f7f5}.dark .scene-inner{background:#123c30;color:#f5f7f5}.scene-content{width:100%;height:100%;padding:100px 84px 104px;display:flex;flex-direction:column;gap:28px}.brand{display:flex;align-items:center;gap:20px;font-size:34px;font-weight:800;line-height:1.2}.brand-mark{display:block;width:62px;height:62px;background:url(assets/marca.svg) center/contain no-repeat}.eyebrow{font-size:30px;font-weight:800;color:#2d6746;letter-spacing:.075em;margin-top:12px}.dark .eyebrow{color:#cee891}h1{font-size:84px;line-height:1.08;font-weight:800;letter-spacing:-.04em;max-width:900px}.lead{font-size:54px;line-height:1.35;max-width:890px}.media{flex:1;min-height:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:36px}.media img{display:block;max-width:100%;max-height:100%;object-fit:contain}.screen{height:100%;width:100%;border-radius:24px;object-fit:contain}.foot{font-size:42px;line-height:1.35;color:#526158;max-width:900px}.dark .foot{color:#f5f7f5}.media-note{font-size:45px;line-height:1.4;width:100%}.home-screen{width:100%;border-radius:22px}.screen-stack{display:grid;grid-template-columns:1fr;grid-template-rows:1fr;align-items:center;justify-items:center;width:100%;height:100%;min-height:0}.screen-stack>*{grid-area:1/1;min-height:0;max-height:100%}.choice-stage{display:flex;flex-direction:column;gap:44px;width:100%;align-items:center}.choice-stage img{width:100%;border:2px solid #c3d1c7;border-radius:26px;background:#fff}.choice-note{font-size:48px;line-height:1.4}.hero-mark{width:270px;height:270px;border:2px solid #2d6746;border-radius:70px}.promise{width:100%;border-top:2px solid #2d6746;padding-top:42px;display:flex;flex-direction:column;gap:24px}.promise strong{font-size:58px;line-height:1.2;color:#cee891;font-weight:800}.promise span{font-size:44px;line-height:1.4}#scene-intro h1,#scene-final h1{font-size:116px;line-height:1.04;letter-spacing:-.045em}#scene-intro .lead,#scene-final .lead{font-size:52px;line-height:1.4}.help-screen{width:100%;border:2px solid #c3d1c7;border-radius:26px}.backup-list{display:flex;flex-direction:column;gap:30px;width:100%;padding:36px 0}.backup-list h2{font-size:52px;line-height:1.2;font-weight:800;margin-bottom:6px}.backup-list p{display:flex;align-items:center;gap:22px;font-size:50px;line-height:1.35}.backup-list span{display:flex;align-items:center;justify-content:center;flex:none;width:64px;height:64px;border-radius:50%;background:#cee891;color:#123c30;font-weight:800}.final-actions{width:100%;display:flex;flex-direction:column;gap:60px}.final-actions>div{border-top:2px solid #2d6746;padding-top:28px;display:flex;flex-direction:column;gap:20px}.action-number{font-size:38px;font-weight:800;color:#cee891}.final-actions strong{font-size:56px;line-height:1.2;font-weight:800}.final-actions p{font-size:44px;line-height:1.35}.free-final{font-size:54px;font-weight:800;color:#cee891;line-height:1.3;width:100%;margin-top:18px}
</style></head><body><div id="root" data-composition-id="repelon-guide" data-start="0" data-duration="${timing.duration}" data-width="1080" data-height="1920">${scenes}\n${audios}</div><script>
const tl=gsap.timeline({paused:true});
const scenes=${JSON.stringify(timing.scenes.map(({id,start,duration})=>({id,start,duration})))};
for(let i=0;i<scenes.length;i++){
 const s=scenes[i],p='#scene-'+s.id,t=s.start;
 if(i===0){tl.fromTo(p+' .scene-inner',{opacity:0},{opacity:1,duration:.7,ease:'sine.inOut'},0)}else{
  tl.to('#scene-'+scenes[i-1].id+' .scene-inner',{opacity:0,duration:.8,ease:'sine.inOut'},t);
  tl.fromTo(p+' .scene-inner',{opacity:0},{opacity:1,duration:.8,ease:'sine.inOut'},t);
 }
}
window.__timelines=window.__timelines||{};window.__timelines['repelon-guide']=tl;
</script></body></html>`;
writeFileSync('index.html',html);

const stamp=t=>{const ms=Math.round(t*1000);return [Math.floor(ms/3600000),Math.floor(ms/60000)%60,Math.floor(ms/1000)%60].map(n=>String(n).padStart(2,'0')).join(':')+','+String(ms%1000).padStart(3,'0')};
let n=0;const captions=[];
for(const s of timing.scenes){
 const phrases=s.text.match(/[^.!?]+[.!?]?/g).map(v=>v.trim()).filter(Boolean);
 const words=phrases.map(p=>p.split(/\s+/).length),total=words.reduce((a,b)=>a+b,0);
 let at=s.voiceStart;
 for(let i=0;i<phrases.length;i++){
  const end=at+s.voiceDuration*words[i]/total;
  const lines=[];let line='';for(const word of phrases[i].split(' ')){if(line&&line.length+word.length+1>42){lines.push(line);line=word}else{line+=(line?' ':'')+word}}if(line)lines.push(line);
  captions.push(++n+'\n'+stamp(at)+' --> '+stamp(end)+'\n'+lines.join('\n'));at=end;
 }
}
mkdirSync('exports',{recursive:true});
writeFileSync('exports/Finca-Repelon-Subtitulos.srt',captions.join('\n\n')+'\n');
writeFileSync('exports/Finca-Repelon-Subtitulos.vtt','WEBVTT\n\n'+captions.join('\n\n').replace(/(\d\d:\d\d:\d\d),(\d{3})/g,'$1.$2')+'\n');
writeFileSync('STORYBOARD.md','# Guía promocional\n\n'+timing.scenes.map(s=>`- ${s.start.toFixed(2)}–${(s.start+s.duration).toFixed(2)} s · ${s.id}: ${views[s.id].title}`).join('\n')+'\n\nLa voz española se generó gratis y localmente con HyperFrames TTS, Kokoro y ef_dora. Capturas del MVP v0.2.0 con datos de ejemplo. Transiciones suaves de 0,8 segundos, títulos de 84–116 px y texto principal de 50–54 px.\n');
console.log(`Composición escrita: ${timing.duration}s, 8 escenas, 1080 × 1920.`);
