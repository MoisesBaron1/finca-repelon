import React,{createContext,useContext,useState,useEffect,useRef,useMemo} from 'react';
import {uid,materialize,mergeEvents,today,estimateVisits,validateEvent,stockBalance} from './domain.mjs';
import {emptyState} from './seed.mjs';
import {read,write,loadDataset,deviceId,transact,isNative} from './storage.mjs';
import {appendRecords,importRecords} from './records.mjs';
import {acquireJourney,recordingInAnotherPage} from './journey-lock.mjs';

const Context=createContext();
export const useFarm=()=>useContext(Context);
export function FarmProvider({children}){
 const [mode,setMode]=useState('demo'),[events,setEvents]=useState([]),[ready,setReady]=useState(false),[toast,setToast]=useState(null),[dialog,setDialog]=useState(null),[page,setPage]=useState(location.hash.slice(1)||'overview'),[online,setOnline]=useState(navigator.onLine),[live,setLive]=useState(null),[fatal,setFatal]=useState('');
 const device=useRef(),watch=useRef(null),sessionRef=useRef(null),toastTimer=useRef(),channel=useRef(),releaseJourney=useRef();
 const eventsRef=useRef(events),modeRef=useRef(mode);eventsRef.current=events;modeRef.current=mode;
 const [largeText,updateLargeText]=useState(false);
 useEffect(()=>{read('ui.largeText').then(value=>updateLargeText(value===true)).catch(()=>{});},[]);
 useEffect(()=>{document.documentElement.classList.toggle('larger-text',largeText);},[largeText]);
 function setLargeText(value){updateLargeText(value);write('ui.largeText',value).catch(()=>notify('No se pudo recordar el tamaño de letra. Puedes elegirlo otra vez al abrir la app.','error'));}
 const state=useMemo(()=>{
  const data={...emptyState(),...materialize(events)},bySession=new Map();
  for(const point of data.points){if(!bySession.has(point.sessionId))bySession.set(point.sessionId,[]);bySession.get(point.sessionId).push(point);}
  data.sessions=data.sessions.map(s=>s.native?s:{...s,points:[...new Map([...(s.points||[]),...(bySession.get(s.id)||[])].map(p=>[p.id,p])).values()]});
  return data;
 },[events]);
 const farm=state.settings[0]||{},activeSession=live?.status==='En curso'?live:state.sessions.find(s=>s.status==='En curso'),conflicts=useMemo(()=>mergeEvents(events,[]).conflicts,[events]);
 const journeyElsewhere=!isNative()&&!!activeSession&&watch.current===null;
 function notify(message,type='success'){setToast({message,type});clearTimeout(toastTimer.current);toastTimer.current=setTimeout(()=>setToast(null),12000);}
 function navigate(next){const valid=['overview','tasks','palms','cattle','banana','resources','reports','settings'];next=valid.includes(next)?next:'overview';setPage(next);location.hash=next;setDialog(null);}
 useEffect(()=>{function change(){const next=location.hash.slice(1);if(next!=='main-content')setPage(['overview','tasks','palms','cattle','banana','resources','reports','settings'].includes(next)?next:'overview');}function network(){setOnline(navigator.onLine);}window.addEventListener('hashchange',change);window.addEventListener('online',network);window.addEventListener('offline',network);return()=>{window.removeEventListener('hashchange',change);window.removeEventListener('online',network);window.removeEventListener('offline',network);};},[]);
 useEffect(()=>{(async()=>{try{device.current=await deviceId();const stored=await read('mode'),selected=['demo','real'].includes(stored)?stored:'demo';setMode(selected);setEvents(await loadDataset(selected));setReady(true);}catch(e){setFatal('No se pudo abrir el almacenamiento local. Revisa el espacio disponible y vuelve a abrir la app.');}})();return()=>{if(watch.current!==null)navigator.geolocation.clearWatch(watch.current);releaseJourney.current?.();clearTimeout(toastTimer.current);};},[]);
 useEffect(()=>{
  if(!ready||isNative())return;
  let stopped=false,refreshing=false;
  async function refresh(){if(stopped||refreshing||document.hidden)return;refreshing=true;try{const loaded=await loadDataset(mode);if(!stopped)setEvents(old=>JSON.stringify(old)===JSON.stringify(loaded)?old:loaded);}catch(e){notify('No se pudieron actualizar los registros de otra pantalla. Vuelve a intentar al abrir Inicio.','error');}finally{refreshing=false;}}
  const bus=typeof BroadcastChannel==='function'?new BroadcastChannel('repelon-data'):null;channel.current=bus;
  if(bus)bus.onmessage=e=>{if(e.data?.mode===mode){refresh();window.dispatchEvent(new Event('backup-updated'));}};
  const visible=()=>{if(!document.hidden)refresh();};
  window.addEventListener('focus',refresh);document.addEventListener('visibilitychange',visible);
  return()=>{stopped=true;bus?.close();if(channel.current===bus)channel.current=null;window.removeEventListener('focus',refresh);document.removeEventListener('visibilitychange',visible);};
 },[ready,mode]);
 function publish(selected){channel.current?.postMessage({mode:selected});}
 async function save(kind,payload,{quiet=false,actor='Administrador'}={}) {
  return saveBatch([{kind,payload}],{quiet,actor});
 }
 async function saveBatch(records,{quiet=false,actor='Administrador'}={}) {
  const selected=mode,result=await transact(selected,old=>appendRecords(old,records,{deviceId:device.current,actor}));
  if(modeRef.current===selected)setEvents(result);publish(selected);if(!quiet)notify('Registro guardado en este dispositivo.');return result;
 }
 async function switchMode(next){
  if(activeSession||materialize(await loadDataset(mode)).sessions?.some(s=>s.status==='En curso'))throw new Error('Finaliza la jornada antes de cambiar de finca.');
  const loaded=await loadDataset(next);await write('mode',next);setEvents(loaded);setMode(next);setLive(null);setDialog(null);navigate('overview');notify(next==='real'?'Tu finca está lista. Configúrala en Datos y ajustes.':'Estás viendo los datos de ejemplo.');
 }
 async function importData(payload){
  if(activeSession)throw new Error('Finaliza la jornada antes de importar datos.');
  const result=await transact(mode,old=>importRecords(old,payload,mode));
  setEvents(result);publish(mode);notify('Paquete importado. Los registros repetidos se conservaron una sola vez.');
 }
 function pointFromPosition(p,id,segment){return{id:uid(),sessionId:id,lat:p.coords.latitude,lng:p.coords.longitude,accuracy:p.coords.accuracy,time:new Date(p.timestamp).toISOString(),monoMs:performance.now(),segment,ageMs:Math.max(0,Date.now()-p.timestamp),mock:false,provider:'Navegador'};}
 async function startSession(data){
  if(activeSession)throw new Error('Ya hay una jornada en curso.');
  const task=state.tasks.find(t=>t.id===data.taskId),id=uid(),session={id,name:data.name||'Jornada de campo',personId:data.personId,workerName:state.people.find(p=>p.id===data.personId)?.name||'Administrador',taskId:data.taskId,zone:data.zone||task?.zone||'Finca',start:new Date().toISOString(),status:'En curso',date:today(),points:[],mode,farmId:farm.farmId,palmIds:task?.palmIds||state.palms.map(p=>p.id),palmsSnapshot:state.palms,planVersion:task?.version||1,pilotApproved:farm.pilotApproved,segment:uid(),native:isNative()};
  if(isNative()) {
   await new Promise((resolve,reject)=>{const timer=setTimeout(()=>{window.removeEventListener('native-session-start',listener);reject(new Error('No se confirmó el inicio. Revisa los permisos y el estado de la jornada.'));},90000);function listener(e){clearTimeout(timer);window.removeEventListener('native-session-start',listener);e.detail.ok?resolve():reject(new Error(e.detail.error||'No se pudo iniciar.'));}window.addEventListener('native-session-start',listener);RepelonNative.startSession(JSON.stringify(session));});
   try{await save('sessions',session,{quiet:true});sessionRef.current=session;setLive(session);}catch(e){RepelonNative.stopSession();throw e;}
  }else{
   if(!navigator.geolocation)throw new Error('Este navegador no permite ubicación. Usa la APK Android.');
   const release=await acquireJourney(mode);releaseJourney.current=release;
   let firstPoint;
   try{
    const first=await new Promise((resolve,reject)=>navigator.geolocation.getCurrentPosition(resolve,()=>reject(new Error('No se obtuvo ubicación. Activa el GPS y permite la ubicación en el navegador.')),{enableHighAccuracy:true,timeout:20000,maximumAge:0}));
    firstPoint=pointFromPosition(first,id,session.segment);
    await saveBatch([{kind:'sessions',payload:session},{kind:'points',payload:firstPoint}],{quiet:true,actor:session.workerName});
   }catch(e){release();releaseJourney.current=null;throw e;}
   sessionRef.current={...session,points:[firstPoint]};setLive(sessionRef.current);
   watch.current=navigator.geolocation.watchPosition(async p=>{
    const current=sessionRef.current;if(!current)return;
    const point=pointFromPosition(p,id,session.segment);
    try{const next=await transact(mode,old=>{const currentSession=materialize(old).sessions.find(s=>s.id===id);if(!currentSession||currentSession.status!=='En curso')return old;return appendRecords(old,[{kind:'points',payload:point}],{deviceId:device.current,actor:session.workerName});});setEvents(next);publish(mode);const material=materialize(next),latest=material.sessions.find(s=>s.id===id);if(latest?.status==='En curso'){sessionRef.current={...latest,points:material.points.filter(p=>p.sessionId===id),segment:session.segment};setLive(sessionRef.current);}}catch(e){notify('No se pudo guardar el punto GPS. Revisa el espacio disponible.','error');}
   },()=>notify('GPS interrumpido. El tramo queda sin medición.','error'),{enableHighAccuracy:true,maximumAge:0,timeout:20000});
  }
  notify(isNative()?'Jornada iniciada. El GPS continuará con la pantalla bloqueada.':'Jornada iniciada. Mantén esta página visible para registrar GPS.');setDialog(null);navigate('palms');
 }
 async function finishSession(session=activeSession){
  if(!session)return;
  let points=session.points||[],diagnostics=[];
  if(isNative()&&session.native){const result=JSON.parse(RepelonNative.stopSession());if(!result.ok)throw new Error(result.error||'No se pudo finalizar.');points=JSON.parse(RepelonNative.points(session.id));diagnostics=JSON.parse(RepelonNative.diagnostics(session.id));}
  else if(watch.current!==null){navigator.geolocation.clearWatch(watch.current);watch.current=null;points=sessionRef.current?.points||points;}
  const result=await transact(mode,old=>{
   const latest=materialize(old).sessions?.find(s=>s.id===session.id)||session;
   if(latest.status==='Terminada')return old;
   return appendRecords(old,[{kind:'sessions',payload:{...latest,points,diagnostics,end:new Date().toISOString(),status:'Terminada'}}],{deviceId:device.current,actor:session.workerName});
  });setEvents(result);publish(mode);sessionRef.current=null;setLive(null);releaseJourney.current?.();releaseJourney.current=null;notify('Jornada finalizada y guardada. Puedes revisar o exportar el recorrido.');
 }
 useEffect(()=>{
  if(isNative()||!sessionRef.current)return;
  const current=state.sessions.find(s=>s.id===sessionRef.current.id);
  if(current&&current.status!=='En curso'){
   if(watch.current!==null){navigator.geolocation.clearWatch(watch.current);watch.current=null;}
   sessionRef.current=null;setLive(null);releaseJourney.current?.();releaseJourney.current=null;
  }
 },[state.sessions]);
 useEffect(()=>{
  if(!ready)return;
  if(!isNative()){
   const stale=state.sessions.find(s=>s.status==='En curso');
   if(stale&&!sessionRef.current)recordingInAnotherPage(mode).then(recording=>{
    if(recording===false)save('sessions',{...stale,status:'Interrumpida',end:new Date().toISOString(),reason:'La página se cerró o se recargó. Inicia una jornada nueva para continuar.'},{quiet:true}).catch(e=>notify(e.message,'error'));
   }).catch(()=>notify('Revisa el estado de tu jornada antes de continuar.','error'));
   return;
  }
  let stopped=false,processing=false;
  async function poll(){
   if(stopped||processing||document.hidden)return;processing=true;
   try{
    const snapshot=JSON.parse(RepelonNative.snapshot(mode));
    const existingSessions=materialize(eventsRef.current).sessions||[];
    for(const s of snapshot.sessions){
     const existing=existingSessions.find(x=>x.id===s.id);
     if(s.status!=='active'&&existing&&existing.status!=='En curso')continue;
     const points=JSON.parse(RepelonNative.points(s.id)),diagnostics=JSON.parse(RepelonNative.diagnostics(s.id));
     const nativeSession={...s,native:true,points,diagnostics,status:s.status==='active'?'En curso':s.status==='finished'?'Terminada':'Interrumpida'};
     if(s.status==='active'){setLive(nativeSession);sessionRef.current=nativeSession;}
     else if(!existing||existing.status==='En curso') {await save('sessions',{...nativeSession,...(existing?{eventId:existing.eventId}:{})},{quiet:true,actor:s.workerName});if(sessionRef.current?.id===s.id){setLive(null);sessionRef.current=null;}}
    }
   }catch(e){notify('No se pudo leer el recorrido guardado.','error');}finally{processing=false;}
  }
  poll();const timer=setInterval(poll,3000);return()=>{stopped=true;clearInterval(timer);};
 },[ready,mode]);
 useEffect(()=>{const onExport=e=>notify(e.detail.message,e.detail.ok?'success':'error');window.addEventListener('native-export',onExport);return()=>window.removeEventListener('native-export',onExport);},[]);
 const value={mode,state,events,farm,ready,fatal,toast,setToast,dialog,setDialog,page,navigate,online,save,saveBatch,notify,switchMode,importData,activeSession,journeyElsewhere,startSession,finishSession,live,conflicts,largeText,setLargeText};
 return <Context.Provider value={value}>{children}</Context.Provider>;
}
