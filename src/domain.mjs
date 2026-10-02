export const uid = () => crypto.randomUUID();
export const today = () => new Date().toLocaleDateString('en-CA', {timeZone:'America/Bogota'});
export const validCoordinate = (lat,lng) => Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat)<=90 && Math.abs(lng)<=180;
export function distance(a,b) {
 const r = Math.PI/180, dlat=(b.lat-a.lat)*r, dlng=(b.lng-a.lng)*r;
 const x=Math.sin(dlat/2)**2+Math.cos(a.lat*r)*Math.cos(b.lat*r)*Math.sin(dlng/2)**2;
 return 6371000*2*Math.atan2(Math.sqrt(x),Math.sqrt(Math.max(0,1-x)));
}

export function estimateVisits(points,palms,{pilotApproved=false,radius=4}={}) {
 const fullInventory=palms.filter(x=>!x.archived);
 pilotApproved=pilotApproved&&fullInventory.length>0&&fullInventory.every(x=>x.validated&&validCoordinate(x.lat,x.lng)&&Number.isFinite(x.accuracy)&&x.accuracy>=0&&x.accuracy<=5);
 const visits=[], classified=[], gaps=[]; let ambiguous=0, run=[], meters=0, measuredSeconds=0;
 function closeRun() {
  if(run.length>=3 && run.at(-1).monoMs-run[0].monoMs>=10000) {
   visits.push({palmId:run[0].palmId,seconds:(run.at(-1).monoMs-run[0].monoMs)/1000,start:run[0].time,end:run.at(-1).time,pointIds:run.map(p=>p.id)});
  }
  run=[];
 }
 for(const point of points) {
  const p={...point,quality:'invalid',palmId:null};
  const admissible=validCoordinate(p.lat,p.lng) && Number.isFinite(p.accuracy) && p.accuracy>=0 && p.ageMs<=15000 && !p.mock;
  if(admissible && p.accuracy<=20) p.quality='zone';
  if(p.mock) p.quality='simulated';
  else if(p.ageMs>15000) p.quality='old';
  else if(p.accuracy>20) p.quality='imprecise';
  if(admissible && p.accuracy<=5 && pilotApproved) {
   const inventory=palms.filter(x=>!x.archived && x.validated && Number.isFinite(x.accuracy));
   const candidates=inventory.filter(x=>distance(p,x)<=radius);
   if(candidates.length) {
    const candidate=candidates[0], uncertainty=p.accuracy+candidate.accuracy;
    const overlap=inventory.some(x=>x.id!==candidate.id && distance(p,x)<=radius+uncertainty+x.accuracy);
    if(candidates.length!==1 || overlap) { p.quality='ambiguous'; ambiguous++; }
    else {p.quality='valid';p.palmId=candidate.id;}
   }
  }
  const prev=classified.at(-1), dt=prev?(p.monoMs-prev.monoMs)/1000:0;
  const continuous=prev && prev.segment===p.segment && dt>0 && dt<=15;
  const trackable=q=>['zone','valid','ambiguous'].includes(q);
  if(continuous && trackable(prev.quality) && trackable(p.quality)) {
   const d=distance(prev,p);
   if(d/dt<=10) {meters+=d; measuredSeconds+=dt;} else {p.quality='anomalous';p.palmId=null;}
  } else if(prev) gaps.push({start:prev.time,end:p.time,seconds:Math.max(0,dt),reason:prev.segment!==p.segment?'Reinicio o reanudación':dt>15?'Sin puntos continuos':'Precisión insuficiente'});
  if(p.quality==='valid') {
   if(!continuous || run.at(-1)?.palmId!==p.palmId) closeRun();
   run.push(p);
  } else closeRun();
  classified.push(p);
 }
 closeRun();
 return {visits,ambiguous,points:classified,gaps,meters,measuredSeconds};
}

export function dailyGain(weights) {
 const w=weights.filter(x=>x.kg>0&&!x.archived).toSorted((a,b)=>a.date.localeCompare(b.date));
 if(w.length<2)return null;
 const a=w.at(-2),b=w.at(-1),days=(Date.parse(b.date)-Date.parse(a.date))/86400000;
 if(days<=0 || a.method!==b.method || a.method!=='Báscula') return null;
 return (b.kg-a.kg)/days;
}

export function mergeEvents(existing,incoming) {
 const byId=new Map(existing.map(e=>[e.id,e]));
 for(const event of incoming) {
  validateEvent(event);
  const previous=byId.get(event.id);
  if(previous && JSON.stringify(previous)!==JSON.stringify(event)) throw new Error('Un ID tiene contenido diferente. La importación fue rechazada.');
  if(!previous) byId.set(event.id,event);
 }
 const events=[...byId.values()],groups=new Map(),resolved=new Set(events.flatMap(e=>e.payload.resolvedEventIds||[])),parents=new Set(events.map(e=>e.parentEventId).filter(Boolean));
 for(const event of events) {
  if(parents.has(event.id)||resolved.has(event.id))continue;
  const key=`${event.kind}:${event.entityId}`;
  if(!groups.has(key))groups.set(key,[]);
  groups.get(key).push(event);
 }
 const conflicts=[...groups.values()].filter(g=>g.length>1).map(g=>({id:g[0].entityId,kind:g[0].kind,version:Math.max(...g.map(e=>e.version)),proposals:g}));
 return {events,conflicts};
}

export function materialize(events) {
 const state=Object.create(null);
 for(const e of events) {
  if(!state[e.kind])state[e.kind]=new Map();
  const old=state[e.kind].get(e.entityId);
  if(!old||(e.version>old.version&&(!e.parentEventId||e.parentEventId===old.eventId||e.payload.resolvedEventIds?.includes(old.eventId))))state[e.kind].set(e.entityId,{...e.payload,id:e.entityId,version:e.version,eventId:e.id,updatedAt:e.time,actor:e.actor});
 }
 return Object.fromEntries(Object.entries(state).map(([key,value])=>[key,[...value.values()].filter(x=>!x.archived)]));
}

export const RECORD_KINDS=new Set(['settings','tasks','palms','animals','weights','health','plots','harvests','labors','resources','movements','finances','incidents','sessions','points','people']);
export function validateEvent(event) {
 if(!event||typeof event.id!=='string'||typeof event.entityId!=='string'||!RECORD_KINDS.has(event.kind)||!Number.isSafeInteger(event.version)||event.version<1||!event.payload||Array.isArray(event.payload)||typeof event.payload!=='object')throw new Error('El paquete contiene registros inválidos.');
 const p=event.payload,string=k=>typeof p[k]==='string'&&p[k].length>0,num=k=>Number.isFinite(p[k]),bad=()=>{throw new Error(`Registro inválido: ${event.kind}. Revisa su formato.`);};
 for(const field of ['name','code','zone','lot','status','date','note','title','target','module','sex','breed','birth','variety','stage','unit','currency','type','personId','animalId','plotId','resourceId','concept','destination','method','start','end','workerName','location'])if(p[field]!==undefined&&typeof p[field]!=='string')bad();
 if(p.resolvedEventIds&&(!Array.isArray(p.resolvedEventIds)||p.resolvedEventIds.some(x=>typeof x!=='string')))bad();
 if(p.review&&(!stringReview(p.review)))bad();
 if(p.photo&&!/^data:image\/(jpeg|png|webp);base64,/.test(p.photo))bad();
 if(event.kind==='settings'&&(!string('farmId')||!string('name')))bad();
 if(event.kind==='tasks'&&(!string('name')||!['Palma','Ganado','Plátano','General'].includes(p.module)||p.palmIds&&(!Array.isArray(p.palmIds)||p.palmIds.some(x=>typeof x!=='string'))))bad();
 if(event.kind==='palms'&&(!string('code')||!validCoordinate(p.lat,p.lng)||!num('accuracy')||p.accuracy<0))bad();
 if(event.kind==='animals'&&(!string('code')||!string('name')))bad();
 if(event.kind==='people'&&!string('name'))bad();
 if(event.kind==='health'&&(!string('animalId')||!string('note')||!string('type')))bad();
 if(event.kind==='incidents'&&(!string('title')||!string('note')||!string('target')))bad();
 if(event.kind==='labors'&&(!string('plotId')||!string('type')||!string('note')))bad();
 if(event.kind==='weights'&&(!string('animalId')||!num('kg')||p.kg<=0||!['Báscula','Cinta','Estimación visual'].includes(p.method)||!string('date')))bad();
 if(event.kind==='plots'&&(!string('name')||!num('area')||p.area<=0||!Number.isInteger(p.cycle)||p.cycle<1))bad();
 if(event.kind==='harvests'&&(!string('plotId')||!num('quantity')||p.quantity<=0||!['kg','racimos'].includes(p.unit)||!string('date')))bad();
 if(event.kind==='resources'&&(!string('name')||!string('unit')||!num('minimum')||p.minimum<0))bad();
 if(event.kind==='movements'&&(!string('resourceId')||!num('delta')||p.delta===0))bad();
 if(event.kind==='finances'&&(!num('amount')||p.amount<=0||!['COP','USD','EUR'].includes(p.currency)||!['Gasto','Ingreso'].includes(p.type)))bad();
 if(event.kind==='points'&&(!validCoordinate(p.lat,p.lng)||!num('accuracy')||!num('monoMs')||!string('sessionId')||!string('segment')))bad();
 if(event.kind==='sessions'&&(!string('start')||!string('status')||!Array.isArray(p.points)||p.points.some(x=>!validCoordinate(x.lat,x.lng)||!Number.isFinite(x.accuracy)||!Number.isFinite(x.monoMs)||typeof x.segment!=='string')))bad();
 if(event.kind==='sessions'){
  if(p.palmsSnapshot!==undefined){if(!Array.isArray(p.palmsSnapshot))bad();for(const palm of p.palmsSnapshot)validateEvent({id:'snapshot',entityId:'snapshot',kind:'palms',version:1,payload:palm});}
  if(p.diagnostics!==undefined&&(!Array.isArray(p.diagnostics)||p.diagnostics.some(d=>typeof d.reason!=='string'||typeof d.time!=='string')))bad();
 }
}
const stringReview=p=>typeof p==='object'&&typeof p.by==='string'&&typeof p.date==='string'&&typeof p.reason==='string'&&(!p.photo||/^data:image\/(jpeg|png|webp);base64,/.test(p.photo));

export function parseCsv(text) {
 text=text.replace(/^\uFEFF/,'');
 const first=text.slice(0,text.indexOf('\n')<0?text.length:text.indexOf('\n')),delimiter=first.includes(';')?';':',';
 const rows=[];let row=[],value='',quoted=false;
 for(let i=0;i<text.length;i++){
  const c=text[i];
  if(c==='"'){if(quoted&&text[i+1]==='"'){value+='"';i++;}else quoted=!quoted;}
  else if(c===delimiter&&!quoted){row.push(value);value='';}
  else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(value);if(row.some(x=>x!==''))rows.push(row);row=[];value='';}
  else value+=c;
 }
 if(quoted)throw new Error('El CSV tiene comillas sin cerrar.');
 if(value||row.length){row.push(value);rows.push(row);}
 return rows;
}

export const stockBalance = (movements,resourceId) => movements.filter(x=>x.resourceId===resourceId).reduce((s,x)=>s+Number(x.delta),0);
export const sumByUnit = records => records.reduce((s,x)=>({...s,[x.unit]:(s[x.unit]||0)+Number(x.quantity)}),{});
export function toCsv(rows) {
 if(!rows.length)return '\uFEFF';
 const columns=[...new Set(rows.flatMap(x=>Object.keys(x)))],escape=x=>'"'+String(x??'').replaceAll('"','""')+'"';
 const safe=x=>typeof x==='string'&&/^[=+@\-]/.test(x)?`'${x}`:x;
 return '\uFEFF'+[columns.map(escape).join(';'),...rows.map(row=>columns.map(c=>escape(safe(row[c]))).join(';'))].join('\r\n');
}
