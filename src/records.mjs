import {uid,materialize,mergeEvents,validateEvent,stockBalance} from './domain.mjs';

// Shared by the browser and Android storage transactions.
export function appendRecords(old,records,{deviceId,actor='Administrador'}={}){
 const next=[...old],queue=[...records],state=materialize(old);
 const entities=Object.fromEntries(Object.entries(state).map(([kind,rows])=>[kind,new Map(rows.map(row=>[row.id,row]))]));
 const versions=new Map();
 for(const event of old){const key=`${event.kind}:${event.entityId}`;versions.set(key,Math.max(versions.get(key)||0,event.version));}
 const codes=Object.fromEntries(['palms','animals'].map(kind=>[kind,new Map((state[kind]||[]).map(row=>[row.code.trim().toLowerCase(),row.id]))]));
 const farmId=state.settings?.[0]?.farmId;
 if(!farmId)throw new Error('No se encontró la configuración de la finca. Vuelve al inicio e intenta otra vez.');
 for(let index=0;index<queue.length;index++){
  const {kind,payload}=queue[index],id=payload.id||uid();
  const existing=entities[kind]?.get(id),key=`${kind}:${id}`;
  if(payload.eventId&&existing?.eventId!==payload.eventId)throw new Error('Este registro cambió en otra pantalla. Conserva lo escrito, cierra esta anotación y abre el registro actualizado antes de corregirlo.');
  const {eventId,version,updatedAt,actor:previousActor,...clean}=payload;
  const event={id:uid(),entityId:id,kind,payload:{...clean,id},version:(versions.get(key)||0)+1,parentEventId:existing?.eventId||null,time:new Date().toISOString(),deviceId,actor,farmId};
  validateEvent(event);
  if(codes[kind]){
   const code=payload.code.trim().toLowerCase(),owner=codes[kind].get(code);
   if(owner&&owner!==id)throw new Error('Este código ya existe. Usa un identificador único.');
   if(existing)codes[kind].delete(existing.code.trim().toLowerCase());
   codes[kind].set(code,id);
  }
  if(kind==='movements'){
   if(!entities.resources?.has(payload.resourceId))throw new Error('Selecciona un recurso registrado en la finca.');
   const others=[...(entities.movements?.values()||[])].filter(x=>x.id!==id),balance=stockBalance(others,payload.resourceId);
   const tolerance=Number.EPSILON*Math.max(1,Math.abs(balance),Math.abs(payload.delta))*8;
   if(balance+payload.delta < -tolerance)throw new Error('La salida supera el saldo disponible. Revisa las entradas y salidas antes de guardar.');
   if(existing&&existing.resourceId!==payload.resourceId){
    const originalBalance=stockBalance(others,existing.resourceId);
    if(originalBalance < -tolerance)throw new Error('Cambiar el recurso dejaría un saldo negativo. Revisa sus movimientos antes de guardar.');
   }
  }
  if(kind==='resources'&&existing&&existing.unit!==payload.unit&&[...(entities.movements?.values()||[])].some(m=>m.resourceId===id))throw new Error('Este recurso ya tiene movimientos. Conserva su unidad o crea un recurso con la nueva unidad.');
  if(kind==='sessions'&&payload.status==='En curso'&&[...(entities.sessions?.values()||[])].some(s=>s.id!==id&&s.status==='En curso'))throw new Error('Ya hay una jornada en curso. Finalízala antes de iniciar otra.');
  next.push(event);versions.set(key,event.version);
  entities[kind]??=new Map();
  entities[kind].set(id,{...event.payload,id,eventId:event.id,version:event.version,updatedAt:event.time,actor});
  if(kind==='tasks'&&payload.status!=='Verificada')for(const p of entities.palms?.values()||[])if(p.reviewedTaskId===id&&p.workStatus==='verified')queue.push({kind:'palms',payload:{...p,workStatus:'pending',reviewedTaskId:null}});
 }
 return next;
}

export function importRecords(old,payload,mode){
 if(payload.mode!==mode)throw new Error('La copia pertenece a otro espacio. Cambia entre Ejemplo y Mi finca antes de traerla.');
 const farm=materialize(old).settings[0];
 if(materialize(old).sessions?.some(s=>s.status==='En curso'))throw new Error('Finaliza la jornada antes de traer una copia.');
 const untouched=old.length===2&&old.every(e=>e.version===1&&!e.parentEventId&&e.id===`real-seed-${e.kind}-${e.entityId}`&&['settings','people'].includes(e.kind));
 if(payload.farmId!==farm.farmId&&!untouched)throw new Error('Esta copia pertenece a otra finca. No se mezclaron tus registros. Para recuperarla, usa un equipo con Mi finca sin configurar.');
 return payload.farmId===farm.farmId?mergeEvents(old,payload.events).events:mergeEvents([],payload.events).events;
}
