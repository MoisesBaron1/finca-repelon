import React,{createContext,useContext,useState,useEffect,useRef} from 'react';
import {uid,materialize,mergeEvents,today,estimateVisits,validateEvent,stockBalance} from './domain.mjs';
import {emptyState} from './seed.mjs';
import {read,write,loadDataset,deviceId,transact,isNative} from './storage.mjs';

const Context=createContext();
export const useFarm=()=>useContext(Context);
export function FarmProvider({children}){
 const [mode,setMode]=useState('demo'),[events,setEvents]=useState([]),[ready,setReady]=useState(false),[toast,setToast]=useState(null),[dialog,setDialog]=useState(null),[page,setPage]=useState(location.hash.slice(1)||'overview'),[online,setOnline]=useState(navigator.onLine),[live,setLive]=useState(null),[fatal,setFatal]=useState('');
 const device=useRef(),watch=useRef(null),sessionRef=useRef(null),toastTimer=useRef();
 const [largeText,updateLargeText]=useState(false);
 useEffect(()=>{read('ui.largeText').then(value=>updateLargeText(value===true)).catch(()=>{});},[]);
 useEffect(()=>{document.documentElement.classList.toggle('larger-text',largeText);},[largeText]);
 function setLargeText(value){updateLargeText(value);write('ui.largeText',value).catch(()=>notify('No se pudo recordar el tamaño de letra. Puedes elegirlo otra vez al abrir la app.','error'));}
 const state={...emptyState(),...materialize(events)};
 state.sessions=state.sessions.map(s=>s.native?s:{...s,points:[...new Map([...(s.points||[]),...state.points.filter(p=>p.sessionId===s.id)].map(p=>[p.id,p])).values()]});
 const farm=state.settings[0]||{},activeSession=live?.status==='En curso'?live:state.sessions.find(s=>s.status==='En curso'),conflicts=mergeEvents(events,[]).conflicts;
 function notify(message,type='success'){setToast({message,type});clearTimeout(toastTimer.current);toastTimer.current=setTimeout(()=>setToast(null),12000);}
 function navigate(next){setPage(next);location.hash=next;setDialog(null);}
 useEffect(()=>{function change(){setPage(location.hash.slice(1)||'overview');}function network(){setOnline(navigator.onLine);}window.addEventListener('hashchange',change);window.addEventListener('online',network);window.addEventListener('offline',network);return()=>{window.removeEventListener('hashchange',change);window.removeEventListener('online',network);window.removeEventListener('offline',network);};},[]);
 useEffect(()=>{(async()=>{try{device.current=await deviceId();const selected=await read('mode')||'demo';setMode(selected);setEvents(await loadDataset(selected));setReady(true);}catch(e){setFatal('No se pudo abrir el almacenamiento local. Revisa el espacio disponible y vuelve a abrir la app.');}})();return()=>{if(watch.current!==null)navigator.geolocation.clearWatch(watch.current);};},[]);
 async function save(kind,payload,{quiet=false,actor='Administrador'}={}) {
  return saveBatch([{kind,payload}],{quiet,actor});
 }
 async function saveBatch(records,{quiet=false,actor='Administrador'}={}) {
  const result=await transact(mode,old=>{
   const next=[...old],queue=[...records];
   for(let index=0;index<queue.length;index++){
    const {kind,payload}=queue[index],id=payload.id||uid(),previous=next.filter(x=>x.kind===kind&&x.entityId===id),current=materialize(next),existing=current[kind]?.find(x=>x.id===id);
    if(['palms','animals'].includes(kind)&&current[kind]?.some(x=>x.id!==id&&x.code.toLowerCase()===payload.code.trim().toLowerCase()))throw new Error('Este código ya existe. Usa un identificador único.');
    if(kind==='movements'){const others=(current.movements||[]).filter(x=>x.id!==id);if(stockBalance(others,payload.resourceId)+payload.delta<0)throw new Error('La salida supera el saldo disponible.');}
    const event={id:uid(),entityId:id,kind,payload:{...payload,id},version:Math.max(0,...previous.map(x=>x.version))+1,parentEventId:existing?.eventId||null,time:new Date().toISOString(),deviceId:device.current,actor,farmId:current.settings[0].farmId};
    validateEvent(event);next.push(event);
    if(kind==='tasks'&&payload.status!=='Verificada')for(const p of current.palms||[])if(p.reviewedTaskId===id&&p.workStatus==='verified')queue.push({kind:'palms',payload:{...p,workStatus:'pending',reviewedTaskId:null}});
   }
   return next;
  });setEvents(result);if(!quiet)notify('Registro guardado en este dispositivo.');return result;
 }
 async function switchMode(next){
  if(activeSession)throw new Error('Finaliza la jornada antes de cambiar de finca.');
  const loaded=await loadDataset(next);await write('mode',next);setEvents(loaded);setMode(next);setLive(null);setDialog(null);navigate('overview');notify(next==='real'?'Tu finca está lista. Configúrala en Datos y ajustes.':'Estás viendo los datos de ejemplo.');
 }
 async function importData(payload){
  if(payload.mode!==mode)throw new Error('El paquete pertenece a otro modo. Cambia entre Ejemplo y Mi finca antes de importar.');
  if(activeSession)throw new Error('Finaliza la jornada antes de importar datos.');
  const realRecords=events.filter(e=>!['settings','people'].includes(e.kind));
  if(payload.farmId!==farm.farmId && realRecords.length)throw new Error('Este paquete pertenece a otra finca. No se mezclaron los registros.');
  const result=await transact(mode,old=>payload.farmId===farm.farmId?mergeEvents(old,payload.events).events:mergeEvents([],payload.events).events);
  setEvents(result);notify('Paquete importado. Los registros repetidos se conservaron una sola vez.');
 }
 function pointFromPosition(p,id){return{id:uid(),sessionId:id,lat:p.coords.latitude,lng:p.coords.longitude,accuracy:p.coords.accuracy,time:new Date(p.timestamp).toISOString(),monoMs:performance.now(),segment:sessionRef.current.segment,ageMs:Math.max(0,Date.now()-p.timestamp),mock:false,provider:'Navegador'};}
 async function startSession(data){
  if(activeSession)throw new Error('Ya hay una jornada en curso.');
  const task=state.tasks.find(t=>t.id===data.taskId),id=uid(),session={id,name:data.name||'Jornada de campo',personId:data.personId,workerName:state.people.find(p=>p.id===data.personId)?.name||'Administrador',taskId:data.taskId,zone:data.zone||task?.zone||'Finca',start:new Date().toISOString(),status:'En curso',date:today(),points:[],mode,farmId:farm.farmId,palmIds:task?.palmIds||state.palms.map(p=>p.id),palmsSnapshot:state.palms,planVersion:task?.version||1,pilotApproved:farm.pilotApproved,segment:uid(),native:isNative()};
  if(isNative()) {
   await new Promise((resolve,reject)=>{const timer=setTimeout(()=>{window.removeEventListener('native-session-start',listener);reject(new Error('No se confirmó el inicio. Revisa los permisos y el estado de la jornada.'));},90000);function listener(e){clearTimeout(timer);window.removeEventListener('native-session-start',listener);e.detail.ok?resolve():reject(new Error(e.detail.error||'No se pudo iniciar.'));}window.addEventListener('native-session-start',listener);RepelonNative.startSession(JSON.stringify(session));});
   await save('sessions',session,{quiet:true});sessionRef.current=session;setLive(session);
  }else{
   if(!navigator.geolocation)throw new Error('Este navegador no permite ubicación. Usa la APK Android.');
   const first=await new Promise((resolve,reject)=>navigator.geolocation.getCurrentPosition(resolve,()=>reject(new Error('No se obtuvo ubicación. Activa el GPS y permite la ubicación en el navegador.')),{enableHighAccuracy:true,timeout:20000,maximumAge:0}));
   sessionRef.current=session;await save('sessions',session,{quiet:true});const firstPoint=pointFromPosition(first,id);await save('points',firstPoint,{quiet:true,actor:session.workerName});sessionRef.current={...session,points:[firstPoint]};setLive(sessionRef.current);
   watch.current=navigator.geolocation.watchPosition(async p=>{
    const current=sessionRef.current;if(!current)return;
    const point=pointFromPosition(p,id);
    try{const next=await transact(mode,old=>{const currentSession=materialize(old).sessions.find(s=>s.id===id);if(!currentSession||currentSession.status!=='En curso')return old;const event={id:uid(),entityId:point.id,kind:'points',payload:point,version:1,time:new Date().toISOString(),deviceId:device.current,actor:session.workerName,farmId:farm.farmId};return [...old,event];});setEvents(next);const material=materialize(next),latest=material.sessions.find(s=>s.id===id);sessionRef.current={...latest,points:material.points.filter(p=>p.sessionId===id),segment:session.segment};setLive(sessionRef.current);}catch(e){notify('No se pudo guardar el punto GPS. Revisa el espacio disponible.','error');}
   },()=>notify('GPS interrumpido. El tramo queda sin medición.','error'),{enableHighAccuracy:true,maximumAge:0,timeout:20000});
  }
  notify(isNative()?'Jornada iniciada. El GPS continuará con la pantalla bloqueada.':'Jornada iniciada. Mantén esta página visible para registrar GPS.');setDialog(null);navigate('palms');
 }
 async function finishSession(session=activeSession){
  if(!session)return;
  let points=session.points||[],diagnostics=[];
  if(isNative()&&session.native){const result=JSON.parse(RepelonNative.stopSession());if(!result.ok)throw new Error(result.error||'No se pudo finalizar.');points=JSON.parse(RepelonNative.points(session.id));diagnostics=JSON.parse(RepelonNative.diagnostics(session.id));}
  else if(watch.current!==null){navigator.geolocation.clearWatch(watch.current);watch.current=null;points=sessionRef.current?.points||points;}
  await save('sessions',{...session,points,diagnostics,end:new Date().toISOString(),status:'Terminada'},{quiet:true,actor:session.workerName});sessionRef.current=null;setLive(null);notify('Jornada finalizada y guardada. Puedes revisar o exportar el recorrido.');
 }
 useEffect(()=>{
  if(!ready)return;
  if(!isNative()){
   const stale=state.sessions.find(s=>s.status==='En curso');
   if(stale&&!sessionRef.current)save('sessions',{...stale,status:'Interrumpida',end:new Date().toISOString(),reason:'La página se cerró o se recargó. Inicia un segmento nuevo.'},{quiet:true}).catch(e=>notify(e.message,'error'));
   return;
  }
  let stopped=false,processing=false;
  async function poll(){
   if(stopped||processing)return;processing=true;
   try{
    const snapshot=JSON.parse(RepelonNative.snapshot(mode));
    for(const s of snapshot.sessions){
     const points=JSON.parse(RepelonNative.points(s.id)),diagnostics=JSON.parse(RepelonNative.diagnostics(s.id));
     const nativeSession={...s,native:true,points,diagnostics,status:s.status==='active'?'En curso':s.status==='finished'?'Terminada':'Interrumpida'};
     if(s.status==='active'){setLive(nativeSession);sessionRef.current=nativeSession;}
     else {const existing=materialize(await loadDataset(mode)).sessions.find(x=>x.id===s.id);if(!existing||existing.status==='En curso') {await save('sessions',nativeSession,{quiet:true,actor:s.workerName});setLive(null);sessionRef.current=null;}}
    }
   }catch(e){notify('No se pudo leer el recorrido guardado.','error');}finally{processing=false;}
  }
  poll();const timer=setInterval(poll,3000);return()=>{stopped=true;clearInterval(timer);};
 },[ready,mode]);
 useEffect(()=>{const onExport=e=>notify(e.detail.message,e.detail.ok?'success':'error');window.addEventListener('native-export',onExport);return()=>window.removeEventListener('native-export',onExport);},[]);
 const value={mode,state,events,farm,ready,fatal,toast,setToast,dialog,setDialog,page,navigate,online,save,saveBatch,notify,switchMode,importData,activeSession,startSession,finishSession,live,conflicts,largeText,setLargeText};
 return <Context.Provider value={value}>{children}</Context.Provider>;
}
