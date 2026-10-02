import React,{useState} from 'react';
import {Check,ShieldCheck,ClipboardList,Play,Download,Upload,LockKeyhole,AlertTriangle,FileText} from 'lucide-react';
import {useFarm} from './farm.jsx';
import {Dialog,RecordForm,Button,Field,Badge,Avatar} from './components.jsx';
import {today,uid,stockBalance,validCoordinate,toCsv,mergeEvents} from './domain.mjs';
import {encryptPackage,decryptPackage,download,isNative,read,write,MAX_PACKAGE_BYTES} from './storage.mjs';
import {EntryDialog,RecordChoices,SavedDialog,HelpDialog,FinishJourneyDialog,savedTitles} from './easy-ui.jsx';

const commonDate={name:'date',label:'Fecha',type:'date',required:true,defaultValue:today()};
const priorities={name:'priority',label:'Prioridad',type:'select',options:['Alta','Media','Baja'],defaultValue:'Media',required:true};
const modules=['Palma','Ganado','Plátano','General'];
export default function Forms(){
 const ctx=useFarm(),{dialog,state,save,setDialog,notify,mode}=ctx;if(!dialog)return null;
 const close=()=>setDialog(null),data=dialog.data||{},form=dialog.type;
 if(form==='recordMenu')return <RecordChoices onClose={close}/>;
 if(form==='help')return <HelpDialog onClose={close}/>;
 if(form==='saved')return <SavedDialog data={data} onClose={close}/>;
 if(form==='finishSession')return <FinishJourneyDialog onClose={close}/>;
 const people=state.people.map(p=>({value:p.id,label:p.name})),plots=state.plots.map(p=>({value:p.id,label:p.name})),animals=state.animals.filter(a=>a.status==='Activo').map(a=>({value:a.id,label:`${a.code} · ${a.name}`}));
 let title='',subtitle='Puedes guardar sin conexión.',fields=[],kind='',extra=null,photo=false,submitLabel;
 if(form==='task'){
  title=data.id?'Editar tarea':'Nueva tarea';kind='tasks';fields=[{name:'name',label:'Labor a realizar',required:true,wide:true},{name:'module',label:'Actividad',type:'select',options:modules,defaultValue:'General',required:true},{name:'zone',label:'Zona o lote',required:true},{name:'personId',label:'Responsable',type:'select',options:people,required:true},commonDate,priorities,{name:'status',label:'Estado',type:'select',options:['Pendiente','En curso','Por revisar'],defaultValue:data.status==='Verificada'?'Pendiente':'Pendiente',required:true},{name:'note',label:'Instrucciones',type:'textarea',wide:true}];
  if(state.palms.length)fields.push({name:'palmCodes',label:'Palmas incluidas (opcional)',wide:true,help:'Códigos separados por coma, por ejemplo P-001, P-002. El plan se conserva al iniciar la jornada.',defaultValue:data.palmIds?.map(id=>state.palms.find(p=>p.id===id)?.code).filter(Boolean).join(', ')});
 }
 if(form==='incident'){
  title='Avisar un problema';kind='incidents';photo=true;fields=[{name:'title',label:'¿Qué ocurrió?',required:true,wide:true},{name:'module',label:'Actividad',type:'select',options:modules,defaultValue:data.module||'General',required:true},{name:'target',label:'Palma, animal, lote o zona',required:true,help:'Por ejemplo: potrero norte, palma P-001 o el nombre del animal.'},priorities,commonDate,{name:'note',label:'Detalles y seguimiento necesario',type:'textarea',required:true,wide:true}];
 }
 if(form==='animal'){
  title=data.id?'Editar ficha del animal':'Nuevo animal';kind='animals';photo=true;fields=[{name:'code',label:'Arete o código',required:true},{name:'name',label:'Nombre',required:true},{name:'sex',label:'Sexo',type:'select',options:['Hembra','Macho'],defaultValue:'Hembra',required:true},{name:'breed',label:'Raza o cruce'},{name:'lot',label:'Potrero o lote',required:true},{name:'birth',label:'Fecha de nacimiento (si se conoce)',type:'date'},{name:'status',label:'Estado',type:'select',options:['Activo','Vendido','Retirado','Fallecido'],defaultValue:'Activo',required:true},{name:'note',label:'Observaciones',type:'textarea',wide:true}];
 }
 if(form==='weight'){
  title='Registrar pesaje';kind='weights';fields=[{name:'animalId',label:'Animal',type:'select',options:animals,required:true,defaultValue:data.animalId},{name:'kg',label:'Peso en kilogramos',type:'number',min:0.1,max:2000,step:0.1,required:true},commonDate,{name:'method',label:'Método',type:'select',options:['Báscula','Cinta','Estimación visual'],required:true,defaultValue:'Báscula'},{name:'equipment',label:'Equipo o referencia (opcional)',wide:true},{name:'note',label:'Observaciones',type:'textarea',wide:true}];subtitle='El peso con cinta o a ojo se marca como estimado.';
 }
 if(form==='health'){
  title='Registro de salud';kind='health';photo=true;fields=[{name:'animalId',label:'Animal',type:'select',options:animals,required:true,defaultValue:data.animalId},{name:'type',label:'Tipo de registro',type:'select',options:['Observación','Vacunación','Desparasitación','Tratamiento','Evaluación veterinaria'],defaultValue:'Observación',required:true},commonDate,priorities,{name:'nextDate',label:'Próximo control (opcional)',type:'date'},{name:'professional',label:'Profesional o responsable (si aplica)'},{name:'note',label:'Signos observados o indicación profesional',type:'textarea',required:true,wide:true}];subtitle='Registra hechos e indicaciones del veterinario. La app no genera diagnósticos ni dosis.';
 }
 if(form==='plot'){
  title=data.id?'Editar lote de plátano':'Nuevo lote de plátano';kind='plots';fields=[{name:'name',label:'Nombre del lote',required:true},{name:'area',label:'Área (hectáreas)',type:'number',min:0.01,step:0.01,required:true},{name:'variety',label:'Variedad',required:true,defaultValue:'Hartón'},{name:'planted',label:'Fecha de siembra',type:'date',required:true,defaultValue:today()},{name:'plants',label:'Plantas iniciales (si se conocen)',type:'number',min:1,step:1},{name:'stage',label:'Etapa',type:'select',options:['Establecimiento','Desarrollo','Floración','Producción','Finalizado'],defaultValue:'Desarrollo',required:true},{name:'note',label:'Observaciones',type:'textarea',wide:true}];
 }
 if(form==='harvest'){
  title='Registrar cosecha';kind='harvests';fields=[{name:'plotId',label:'Lote',type:'select',options:plots,required:true,defaultValue:data.plotId},commonDate,{name:'quantity',label:'Cantidad',type:'number',required:true,min:.01,step:.01},{name:'unit',label:'Unidad',type:'select',options:['kg','racimos'],defaultValue:'kg',required:true},{name:'destination',label:'Destino',type:'select',options:['Venta local','Consumo','Otro'],required:true,defaultValue:'Venta local'},{name:'note',label:'Observaciones',type:'textarea',wide:true}];subtitle='Los kilogramos y los racimos se registran y suman por separado.';
 }
 if(form==='labor'){
  title='Registrar labor de cultivo';kind='labors';photo=true;fields=[{name:'plotId',label:'Lote',type:'select',options:plots,required:true,defaultValue:data.plotId},commonDate,{name:'type',label:'Labor',type:'select',options:['Riego','Deshoje','Deshije','Limpieza','Fertilización','Inspección'],required:true,defaultValue:'Limpieza'},{name:'personId',label:'Responsable',type:'select',options:people,required:true},{name:'note',label:'Detalle de la labor',type:'textarea',required:true,wide:true}];
 }
 if(form==='resource'){
  title='Nuevo recurso';kind='resources';fields=[{name:'name',label:'Nombre del insumo o herramienta',required:true,wide:true},{name:'unit',label:'Unidad',type:'select',options:['kg','L','unidades','pares','sacos'],required:true,defaultValue:'unidades'},{name:'minimum',label:'Alerta de stock mínimo',type:'number',min:0,step:0.01,defaultValue:0,required:true}];subtitle='El saldo se calcula con las entradas y salidas registradas.';
 }
 if(form==='movement'){
  title='Movimiento de inventario';kind='movements';fields=[{name:'resourceId',label:'Recurso',type:'select',options:state.resources.map(r=>({value:r.id,label:`${r.name} (${r.unit})`})),required:true,defaultValue:data.resourceId},{name:'direction',label:'Movimiento',type:'select',options:['Entrada','Salida'],defaultValue:'Entrada',required:true},{name:'quantity',label:'Cantidad',type:'number',required:true,min:.01,step:.01},commonDate,{name:'note',label:'Motivo o referencia',required:true,wide:true}];
 }
 if(form==='finance'){
  title='Nuevo movimiento de dinero';kind='finances';fields=[{name:'type',label:'Tipo',type:'select',options:['Gasto','Ingreso'],defaultValue:'Gasto',required:true},{name:'amount',label:'Valor',type:'number',required:true,min:1,step:.01},{name:'currency',label:'Moneda',type:'select',options:['COP','USD','EUR'],required:true,defaultValue:'COP'},commonDate,{name:'concept',label:'Concepto',required:true,wide:true},{name:'module',label:'Actividad',type:'select',options:modules,defaultValue:'General',required:true},{name:'note',label:'Observaciones',type:'textarea',wide:true}];
 }
 if(form==='person'){
  title='Añadir responsable';kind='people';fields=[{name:'name',label:'Nombre completo',required:true,wide:true},{name:'role',label:'Función en la finca',type:'select',options:['Trabajador','Encargado','Supervisor','Administrador'],required:true,defaultValue:'Trabajador'}];subtitle='Organiza la asignación de labores. No crea una cuenta ni un permiso de acceso.';
 }
 if(form==='palm'){
  title=data.id?'Editar palma':'Registrar palma';kind='palms';fields=[{name:'code',label:'Código de palma',required:true},{name:'zone',label:'Zona',required:true},{name:'row',label:'Fila',type:'number',min:1,step:1,required:true},{name:'lat',label:'Latitud WGS84',type:'number',step:'any',min:-90,max:90,required:true},{name:'lng',label:'Longitud WGS84',type:'number',step:'any',min:-180,max:180,required:true},{name:'accuracy',label:'Precisión del levantamiento (m)',type:'number',min:0,step:.1,required:true},{name:'surveyDate',label:'Fecha del levantamiento',type:'date',defaultValue:today(),required:true},{name:'surveyMethod',label:'Método del levantamiento',required:true,defaultValue:'GPS del teléfono'},{name:'validatedText',label:'Coordenadas contrastadas en terreno',type:'select',options:['No','Sí'],defaultValue:data.validated?'Sí':'No',required:true}];subtitle='La atribución individual requiere levantamiento validado y piloto aprobado.';
 }
 if(form==='session'){
  title='Iniciar jornada';fields=[{name:'name',label:'Nombre de la jornada',required:true,wide:true,defaultValue:'Jornada de campo'},{name:'personId',label:'Responsable',type:'select',options:people,required:true,defaultValue:people.length===1?people[0].value:undefined},{name:'zone',label:'Zona de trabajo',required:true},{name:'taskId',label:'Tarea asociada (opcional)',type:'select',options:state.tasks.filter(t=>t.status!=='Verificada').map(t=>({value:t.id,label:t.name}))}];submitLabel='Comenzar jornada';subtitle=isNative()?'Activa la ubicación del teléfono. Al comenzar, aparecerá un aviso de jornada activa.':'En el navegador, mantén esta página visible para registrar el recorrido. Con pantalla bloqueada, usa la app Android.';extra=<div className="inline-notice"><ShieldCheck size={18}/><p>El recorrido no confirma que una tarea esté terminada. Esa revisión se hace por separado.</p></div>;
 }
 if(form==='backup')return <BackupDialog onClose={close}/>;
 if(form==='mode')return <Dialog title="Tu espacio de trabajo" onClose={close}><div className="mode-content"><div className="mode-option"><LeafIcon/><div><h3>Explorar el ejemplo</h3><p>Prueba todos los módulos con registros ilustrativos. Tus cambios de ejemplo también se guardan.</p></div><Button variant={mode==='demo'?'secondary':'primary'} onClick={()=>ctx.switchMode('demo').catch(e=>notify(e.message,'error'))}>{mode==='demo'?'En uso':'Abrir ejemplo'}</Button></div><div className="mode-option"><ShieldCheck size={24}/><div><h3>Empezar con mi finca</h3><p>Un espacio vacío para tus datos reales. Podrás añadir inventarios y responsables sin cambiar el código.</p></div><Button variant={mode==='real'?'secondary':'primary'} onClick={()=>ctx.switchMode('real').catch(e=>notify(e.message,'error'))}>{mode==='real'?'En uso':'Usar mi finca'}</Button></div><p className="privacy-note">Los datos permanecen en este dispositivo. Transfiérelos mediante una copia protegida para consultarlos en otro equipo.</p></div></Dialog>;
 if(form==='taskDetail')return <TaskDetail data={data} onClose={close}/>;
 if(form==='review'){
  title='Verificar labor';kind='tasks';submitLabel='Guardar revisión';subtitle='La revisión conserva tu decisión, fecha y evidencia en el historial.';photo=true;fields=[{name:'status',label:'Resultado de revisión',type:'select',options:['Verificada','Pendiente'],required:true,defaultValue:'Verificada'},{name:'reason',label:'Evidencia de inspección o motivo de corrección',type:'textarea',required:true,wide:true},{name:'reviewer',label:'Nombre del revisor',required:true,defaultValue:'Administrador'}];extra=<div className="inline-notice"><ClipboardList size={18}/><p>{data.name}</p></div>;
 }
 if(form==='resolve')return <ConflictDialog conflict={data} onClose={close}/>;
 if(!title)return null;
 async function submit(values){
  if(form==='session')return ctx.startSession(values);
  let payload={...data,...values};
  if(form==='task'){
   const codes=(values.palmCodes||'').split(',').map(x=>x.trim()).filter(Boolean);payload.palmIds=codes.map(code=>{const p=state.palms.find(p=>p.code.toLowerCase()===code.toLowerCase());if(!p)throw new Error(`No existe la palma ${code}.`);return p.id;});delete payload.palmCodes;
  }
  if(form==='animal'&&state.animals.some(a=>a.code.toLowerCase()===values.code.trim().toLowerCase()&&a.id!==data.id))throw new Error('Este código ya pertenece a otro animal. Usa un identificador único.');
  if(form==='palm'){
   if(!validCoordinate(values.lat,values.lng))throw new Error('Las coordenadas no son válidas.');
   if(state.palms.some(p=>p.code.toLowerCase()===values.code.trim().toLowerCase()&&p.id!==data.id))throw new Error('Ya existe una palma con ese código.');
   payload.validated=values.validatedText==='Sí';delete payload.validatedText;
  }
  if(['weight','health'].includes(form)&&!state.animals.some(a=>a.id===values.animalId&&a.status==='Activo'))throw new Error('Selecciona un animal activo.');
  if(['weight','health','harvest','labor','movement','finance'].includes(form)&&values.date>today())throw new Error('Un registro realizado no puede tener fecha futura.');
  if(form==='weight'&&!(values.kg>0))throw new Error('El peso debe ser mayor que cero.');
  if(form==='incident')payload.status='Abierta';
  if(form==='health')payload.resolved=false;
  if(form==='plot')payload.cycle=data.cycle||1;
  if(['harvest','labor'].includes(form)){const lot=state.plots.find(p=>p.id===values.plotId);if(!lot||lot.stage==='Finalizado')throw new Error('Selecciona un lote con ciclo vigente.');payload.cycle=lot.cycle;}
  if(form==='movement'){
   const delta=values.quantity*(values.direction==='Salida'?-1:1);
   if(stockBalance(state.movements,values.resourceId)+delta<0)throw new Error('La salida supera el saldo disponible. Revisa los movimientos antes de guardar.');payload.delta=delta;delete payload.quantity;delete payload.direction;
  }
  if(form==='review')payload={...data,status:values.status,review:{by:values.reviewer,date:new Date().toISOString(),reason:values.reason,photo:values.photo||null}};
  const records=[{kind,payload}];
  if(form==='review'&&values.status==='Verificada')for(const id of data.palmIds||[]){const p=state.palms.find(p=>p.id===id);if(p)records.push({kind:'palms',payload:{...p,workStatus:'verified',reviewedTaskId:data.id}});}
  await ctx.saveBatch(records,{quiet:true});
  const summary=payload.name||payload.title||payload.concept||(form==='weight'?`${state.animals.find(a=>a.id===payload.animalId)?.name||'Animal'} · ${payload.kg} kg`:form==='harvest'?`${payload.quantity} ${payload.unit}`:'');
  setDialog({type:'saved',data:{title:savedTitles[form],summary,again:!data.id&&form!=='review'?form:undefined}});
 }
 return <EntryDialog key={`${form}-${data.id||'new'}`} title={title} subtitle={subtitle} onClose={close} fields={fields} values={data} form={form} onSubmit={submit} photo={photo} submitLabel={submitLabel}>{extra}</EntryDialog>;
}
function LeafIcon(){return <ShieldCheck size={24}/>}

function TaskDetail({data,onClose}){
 const {state,save,setDialog,events}=useFarm(),person=state.people.find(p=>p.id===data.personId),history=events.filter(e=>e.kind==='tasks'&&e.entityId===data.id);
 return <Dialog title={data.name} subtitle={`${data.module} · ${data.zone}`} onClose={onClose}><div className="detail-content"><div className="detail-meta"><Badge>{data.status}</Badge><Badge>{data.priority}</Badge><span>{data.date}</span><span className="person"><Avatar name={person?.name} small/>{person?.name||'Sin responsable'}</span></div>{data.note&&<p>{data.note}</p>}{!!data.palmIds?.length&&<p className="muted">Plan: {data.palmIds.length} palmas · {data.palmIds.map(id=>state.palms.find(p=>p.id===id)?.code).filter(Boolean).join(', ')}</p>}{data.review&&<div className="review-note"><ShieldCheck size={20}/><div><strong>Revisión de {data.review.by}</strong><p>{data.review.reason}</p></div></div>}
 <h3>Historial de cambios</h3><div className="timeline">{history.toReversed().map(e=><div key={e.id}><span className="timeline-dot"/><div><strong>{e.payload.status} · {e.actor}</strong><small>{new Date(e.time).toLocaleString('es-CO')}</small></div></div>)}</div></div><div className="dialog-foot"><Button variant="secondary" onClick={()=>setDialog({type:'task',data})}>Editar</Button>{data.status!=='Verificada'&&<Button variant="secondary" onClick={async()=>{await save('tasks',{...data,status:'Por revisar'});onClose()}}>Reportar terminada</Button>}<Button icon={ShieldCheck} onClick={()=>setDialog({type:'review',data})}>Revisar labor</Button></div></Dialog>;
}

function BackupDialog({onClose}){
 const {events,mode,farm,importData,notify,activeSession}=useFarm(),[tab,setTab]=useState('export'),[busy,setBusy]=useState(false),[error,setError]=useState(''),[file,setFile]=useState(null);
 async function submit(e){e.preventDefault();setBusy(true);setError('');try{
  if(activeSession)throw new Error('Finaliza la jornada para incluir todos sus puntos en el respaldo.');
  const password=new FormData(e.currentTarget).get('password');
  if(tab==='export'){
   const backup=await encryptPackage(events,password,mode);await download(`repelon-${mode}-${today()}.finca`,backup,'application/octet-stream');await write(`lastBackup.${mode}`,new Date().toISOString());if(!isNative())notify('Copia protegida descargada. Conserva también la contraseña.');onClose();
  }else{
   if(!file)throw new Error('Selecciona un archivo .finca.');if(file.size>MAX_PACKAGE_BYTES)throw new Error('El archivo supera el límite de 75 MB de esta versión.');
   const payload=await decryptPackage(await file.text(),password);await importData(payload);onClose();
  }
 }catch(e){setError(e.message);}finally{setBusy(false)}}
 return <Dialog title="Copia de mis datos" subtitle="Guarda una copia fuera del teléfono o trae la de otro equipo." onClose={onClose} closeDisabled={busy}><div className="backup-tabs"><Button variant={tab==='export'?'primary':'secondary'} icon={Download} onClick={()=>{setTab('export');setError('')}}>Guardar una copia</Button><Button variant={tab==='import'?'primary':'secondary'} icon={Upload} onClick={()=>{setTab('import');setError('')}}>Traer una copia</Button></div><form onSubmit={submit} className="record-form"><div className="backup-summary"><LockKeyhole size={28}/><div><strong>{farm.name}</strong><p>Todos tus datos y fotos · {mode==='demo'?'datos de ejemplo':'datos reales'}</p></div></div>{tab==='import'&&<label className="file-input-label">Archivo protegido<input type="file" accept=".finca,application/octet-stream,application/json" required onChange={e=>setFile(e.target.files[0])}/></label>}<Field name="password" label={tab==='export'?'Contraseña de la copia':'Contraseña de esa copia'} type="password" required help="Escribe al menos 8 letras o números que recuerdes. Necesitarás esta contraseña para abrir la copia."/><p className="privacy-note">{tab==='export'?'La contraseña no se guarda en la app. Guarda el archivo fuera del teléfono y conserva la contraseña para recuperarlo.':'Revisaremos el archivo antes de guardar. Tus anotaciones repetidas se conservarán una sola vez.'}</p>{error&&<p className="form-error" role="alert">{error}</p>}<div className="dialog-foot"><Button variant="secondary" type="button" disabled={busy} onClick={onClose}>Cerrar</Button><Button disabled={busy} type="submit" icon={tab==='export'?Download:Upload}>{busy?'Guardando tus datos…':tab==='export'?'Guardar copia protegida':'Revisar y traer copia'}</Button></div></form></Dialog>;
}

function ConflictDialog({conflict,onClose}){
 const {save,state,events}=useFarm(),current=state[conflict.kind]?.find(x=>x.id===conflict.id),currentEvent=events.find(e=>e.id===current?.eventId),proposals=[...new Map([...(currentEvent?[currentEvent]:[]),...conflict.proposals].map(e=>[e.id,e])).values()], [selected,setSelected]=useState(currentEvent?.id||conflict.proposals[0].id),[reason,setReason]=useState(''),[error,setError]=useState('');
 return <Dialog title="Resolver cambio simultáneo" subtitle="Las propuestas y la versión actual se conservan en el historial." onClose={onClose}><div className="detail-content">{proposals.map(e=><label className="conflict-proposal" key={e.id}><input type="radio" name="proposal" checked={selected===e.id} onChange={()=>setSelected(e.id)}/><div><strong>{e.id===currentEvent?.id?'Versión actual':'Propuesta recibida'} · v{e.version}</strong><p>{e.payload.name||e.payload.title||e.entityId} · {e.payload.status||e.payload.lot||'Registro'}</p><small>{e.actor} · {new Date(e.time).toLocaleString('es-CO')}</small></div></label>)}{proposals.find(e=>e.id===selected)?.version<(currentEvent?.version||0)&&<p className="form-error">Esta propuesta reemplazará el registro completo y puede revertir cambios posteriores. Revisa la versión actual antes de continuar.</p>}<label className="field"><span>Motivo de la decisión</span><textarea required value={reason} onChange={e=>setReason(e.target.value)}/></label>{error&&<p className="form-error">{error}</p>}</div><div className="dialog-foot"><Button variant="secondary" onClick={onClose}>Cancelar</Button><Button onClick={async()=>{if(!reason.trim()){setError('Indica el motivo de la decisión.');return;}const p=proposals.find(e=>e.id===selected);await save(conflict.kind,{...p.payload,id:conflict.id,resolvedEventIds:[...new Set([...(currentEvent?.payload.resolvedEventIds||[]),...conflict.proposals.map(e=>e.id)])],resolutionReason:reason});onClose();}}>Conservar propuesta</Button></div></Dialog>;
}
