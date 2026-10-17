import React,{useEffect,useState} from 'react';
import {Button} from './components.jsx';
import {isNative} from './storage.mjs';
import {version} from '../package.json';

async function checkDownload(){
 if(isNative())return 'native';
 if(!('serviceWorker' in navigator))return 'missing';
 let channel;
 try{
  const registration=await navigator.serviceWorker.getRegistration();
  if(!registration?.active)return 'missing';
  const result=await new Promise(resolve=>{
   channel=new MessageChannel();const timer=setTimeout(()=>resolve(false),2500);
   channel.port1.onmessage=event=>{clearTimeout(timer);resolve(event.data?.ready===true)};
   registration.active.postMessage({type:'REPELON_OFFLINE_STATUS'},[channel.port2]);
  });
  return result?'ready':'missing';
 }catch{return 'missing';}finally{channel?.port1.close();channel?.port2.close();}
}

export function FieldHelp(){
 const [status,setStatus]=useState('checking');
 useEffect(()=>{let alive=true;checkDownload().then(result=>{if(alive)setStatus(result)});return()=>{alive=false}},[]);
 async function retry(){setStatus('checking');try{if(!isNative()&&'serviceWorker' in navigator){const registration=await navigator.serviceWorker.register(new URL('sw.js',document.baseURI));await registration.update();}}catch{}setStatus(await checkDownload());}
 return <section aria-label="Preparación sin señal"><p className="muted">Versión {version}</p>
 <p role="status"><strong>{status==='checking'?'Comprobando la descarga…':status==='native'?'La app Android está incluida en este teléfono.':status==='ready'?'App guardada para abrir sin señal.':'Falta completar la descarga de la app.'}</strong></p>
 {status==='missing'&&<p>Con internet, vuelve a abrir la app y espera un momento. Después comprueba otra vez. Todavía no se ha confirmado que puedas reabrirla sin señal.</p>}
 <Button variant="secondary" disabled={status==='checking'} onClick={retry}>Comprobar descarga otra vez</Button>
 <details className="help-details"><summary>Preparar el teléfono para ir sin señal</summary><ol className="help-steps"><li><strong>Haz una prueba antes de salir</strong><p>Activa modo avión y comprueba que Wi-Fi y datos móviles estén apagados. Si registrarás un recorrido, vuelve a activar Ubicación.</p></li><li><strong>Guarda y vuelve a abrir</strong><p>Haz una anotación en Datos de ejemplo, espera la confirmación, cierra y abre la app otra vez. Comprueba que la anotación sigue ahí.</p></li><li><strong>Elige Mi finca para los datos reales</strong><p>Los ejemplos se guardan aparte. Cada teléfono conserva sus propias anotaciones.</p></li><li><strong>Al terminar, haz una copia</strong><p>Finaliza la jornada y guarda una copia protegida en Archivos o Descargas del teléfono. No necesitas señal para crearla. Compártela con otro equipo cuando tengas un medio disponible y conserva la contraseña.</p></li></ol>
 <p>Para un recorrido con la pantalla bloqueada usa Android instalado. En iPhone o navegador mantén la app visible: el recorrido puede interrumpirse al bloquear la pantalla.</p>
 <p>El GPS puede funcionar sin señal móvil. Sal a un lugar abierto y espera la ubicación; bajo árboles o techo puede tardar o perder precisión. Las anotaciones manuales siguen disponibles aunque falle el GPS.</p>
 <p>No desinstales la app ni borres los datos del navegador durante la prueba. Lleva batería cargada y una batería portátil. La autonomía debe comprobarse en tu teléfono.</p>
 </details></section>;
}
