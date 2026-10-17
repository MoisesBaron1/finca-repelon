import React,{useState,useRef,useEffect} from 'react';
import {ClipboardList,Scale,Sprout,Wallet,HeartPulse,Leaf,ChevronRight,CheckCircle2,ShieldCheck,House,Type,Square} from 'lucide-react';
import {Button,Dialog,RecordForm} from './components.jsx';
import {useFarm} from './farm.jsx';
import {FieldHelp} from './field-help.jsx';

export const guidedSteps={
 task:[{title:'¿Qué trabajo hay que hacer?',fields:['name','module','zone','personId']},{title:'¿Para cuándo?',fields:['date','priority','status']}],
 weight:[{title:'Elige el animal',fields:['animalId','date']},{title:'Anota el peso',fields:['kg','method'],hint:'Escribe el peso y cómo lo obtuviste.'}],
 harvest:[{title:'Elige el lote',fields:['plotId','date']},{title:'Anota lo que cosechaste',fields:['quantity','unit','destination'],hint:'Elige kilogramos o racimos según lo que contaste.'}],
 incident:[{title:'¿Qué pasó y dónde?',fields:['title','target','module']},{title:'Cuéntanos el detalle',fields:['note','priority','date']}],
 finance:[{title:'¿Qué dinero quieres anotar?',fields:['type','concept','module']},{title:'Anota el valor',fields:['amount','currency','date']}],
 session:[{title:'¿Quién hará el recorrido?',fields:['personId','zone','name','taskId'],hint:'Elige el responsable y la zona. Después podrás revisar e iniciar.'}],
 animal:[{title:'Identifica el animal',fields:['code','name','sex','lot']},{title:'Estado del animal',fields:['status'],hint:'Puedes añadir la raza, el nacimiento y una foto si los tienes.'}],
 health:[{title:'Elige el animal y el cuidado',fields:['animalId','type','date','priority']},{title:'Anota lo observado',fields:['note','nextDate'],hint:'El próximo control es opcional. Sigue las indicaciones del veterinario.'}],
 plot:[{title:'Identifica el lote',fields:['name','area','variety']},{title:'Siembra y etapa actual',fields:['planted','stage','plants'],hint:'Si no conoces el número de plantas, déjalo vacío.'}],
 labor:[{title:'Elige el trabajo y el lote',fields:['plotId','type','date','personId']},{title:'Anota lo que hiciste',fields:['note']}],
 movement:[{title:'Elige el recurso y el movimiento',fields:['resourceId','direction']},{title:'Anota la cantidad',fields:['quantity','date','note']}],
 resource:[{title:'Identifica el recurso',fields:['name','unit','minimum'],hint:'El saldo se anota después con una entrada de inventario.'}],
 person:[{title:'Añade el responsable',fields:['name','role']}],
 palm:[{title:'Identifica la palma',fields:['code','zone','row']},{title:'Coordenadas del levantamiento',fields:['lat','lng','accuracy']},{title:'Revisa el origen de las coordenadas',fields:['surveyDate','surveyMethod','validatedText']}],
};
export const saveLabels={task:'Guardar tarea',weight:'Guardar pesaje',harvest:'Guardar cosecha',incident:'Guardar problema',finance:'Guardar gasto o ingreso',session:'Comenzar jornada',health:'Guardar salud',labor:'Guardar trabajo',animal:'Guardar animal',plot:'Guardar lote',movement:'Guardar movimiento',resource:'Guardar recurso',person:'Guardar responsable',palm:'Guardar palma'};
export const savedTitles={task:'Tarea guardada',weight:'Pesaje guardado',harvest:'Cosecha guardada',incident:'Problema guardado',finance:'Movimiento de dinero guardado',animal:'Animal guardado',palm:'Palma guardada',plot:'Lote guardado',health:'Salud guardada',labor:'Trabajo guardado',resource:'Recurso guardado',movement:'Entrada o salida guardada',person:'Responsable guardado',review:'Revisión guardada'};

export function EntryDialog({title,subtitle,onClose,fields,values,form,onSubmit,photo,submitLabel,children}){
 const [dirty,setDirty]=useState(false),[busy,setBusy]=useState(false),[discard,setDiscard]=useState(false),keepRef=useRef();
 const lastFocus=useRef();
 function requestClose(){if(busy)return;if(dirty){lastFocus.current=document.activeElement;setDiscard(true);}else onClose();}
 useEffect(()=>{if(discard)keepRef.current?.focus();},[discard]);
 useEffect(()=>{if(!dirty)return;const warn=e=>{e.preventDefault();e.returnValue='';};window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn)},[dirty]);
 return <Dialog title={title} subtitle={subtitle} onClose={requestClose} closeDisabled={busy}>
 <div hidden={discard}>{children}<RecordForm fields={fields} values={values} steps={guidedSteps[form]} onSubmit={onSubmit} onCancel={requestClose} onDirtyChange={setDirty} onBusyChange={setBusy} photo={photo} submitLabel={submitLabel||saveLabels[form]||'Guardar registro'}/></div>
 {discard&&<div className="discard-question" role="alert"><h3>¿Salir sin guardar?</h3><p>Tu anotación todavía no se ha guardado. Puedes volver para terminarla.</p><div className="stack-buttons"><button ref={keepRef} className="button primary" onClick={()=>{setDiscard(false);requestAnimationFrame(()=>lastFocus.current?.focus())}}>Seguir anotando</button><Button variant="secondary" onClick={onClose}>Salir sin guardar</Button></div></div>}
 </Dialog>;
}

export function RecordChoices({onClose}){
 const {state,setDialog}=useFarm();
 const entries=[
  ['weight','Anotar peso de ganado','Elige el animal y escribe su peso.',Scale,state.animals.some(a=>a.status==='Activo')?'weight':'animal','Primero añade un animal.'],
  ['harvest','Anotar cosecha de plátano','Escribe cuántos kilos o racimos recogiste.',Sprout,state.plots.some(p=>p.stage!=='Finalizado')?'harvest':'plot','Primero añade un lote.'],
  ['finance','Anotar gasto o ingreso','Registra dinero que sale o entra.',Wallet,'finance'],
  ['task','Crear una tarea','Indica el trabajo y quién lo hará.',ClipboardList,'task'],
  ['health','Anotar salud de ganado','Registra una observación o cuidado.',HeartPulse,state.animals.some(a=>a.status==='Activo')?'health':'animal','Primero añade un animal.'],
  ['labor','Anotar trabajo de cultivo','Registra limpieza, riego u otra labor.',Leaf,state.plots.some(p=>p.stage!=='Finalizado')?'labor':'plot','Primero añade un lote.'],
 ];
 return <Dialog title="¿Qué quieres anotar?" subtitle="Elige una opción. Te ayudaremos paso a paso." onClose={onClose}><div className="record-choices">{entries.map(([id,label,detail,Icon,type,first])=><button key={id} className="record-choice" onClick={()=>setDialog({type,followUp:type===id?undefined:id})}><Icon size={27}/><span><strong>{label}</strong><small>{type===id?detail:first}</small></span><ChevronRight size={23}/></button>)}</div></Dialog>;
}

export function SavedDialog({data,onClose}){
 const {navigate,setDialog}=useFarm();
 return <Dialog title={data.title||'Anotación guardada'} onClose={onClose}><div className="saved-result"><CheckCircle2 size={54}/><h3>Listo. Tus datos quedaron guardados.</h3><p>Puedes continuar trabajando, aunque no tengas internet.</p>{data.summary&&<p className="saved-summary">{data.summary}</p>}<div className="stack-buttons"><>{data.continueWith&&<Button onClick={()=>setDialog(data.continueWith)}>{data.continueLabel}</Button>}<Button variant={data.continueWith?'secondary':'primary'} icon={House} onClick={()=>navigate('overview')}>Volver al inicio</Button></><Button variant="secondary" onClick={onClose}>Seguir en esta pantalla</Button>{data.again&&<Button variant="secondary" onClick={()=>setDialog({type:data.again})}>Hacer otra anotación</Button>}</div></div></Dialog>;
}

export function HelpDialog({onClose}){
 const {navigate,setDialog,largeText,setLargeText}=useFarm();
 return <Dialog title="Ayuda para usar la app" subtitle="No necesitas internet para hacer tus anotaciones." onClose={onClose}><div className="help-content"><FieldHelp/><ol className="help-steps"><li><strong>Empieza en Inicio</strong><p>Elige «Ver tareas», «Anotar un dato» o «Avisar un problema».</p></li><li><strong>Completa una pantalla a la vez</strong><p>Toca Continuar. Puedes volver al paso anterior para corregir.</p></li><li><strong>Revisa y guarda</strong><p>Comprueba tus datos y toca Guardar. Verás un mensaje cuando termine.</p></li></ol><div className="help-text-size"><h3>¿Necesitas letras más grandes?</h3><button className="button secondary" aria-pressed={largeText} onClick={()=>setLargeText(!largeText)}><Type size={24}/>{largeText?'Usar tamaño habitual':'Usar texto más grande'}</button></div><details className="help-details"><summary>¿Cómo hago una copia de mis datos?</summary><p>Toca «Hacer una copia». Escribe una contraseña que recuerdes y guarda el archivo fuera del teléfono. Para pasarlo a otro equipo, abre el archivo desde «Traer una copia» y usa la misma contraseña.</p><Button variant="secondary" icon={ShieldCheck} onClick={()=>setDialog({type:'backup'})}>Hacer una copia</Button></details><details className="help-details"><summary>¿Cómo registro mi recorrido?</summary><p>Toca «Iniciar jornada», elige el responsable y permite la ubicación. Al terminar, toca «Finalizar jornada».</p><p>Para trabajar con la pantalla bloqueada, usa la app Android. En el navegador debes mantener esta página visible.</p></details><div className="stack-buttons"><Button icon={House} onClick={()=>navigate('overview')}>Volver al inicio</Button></div></div></Dialog>;
}

export function FinishJourneyDialog({onClose}){
 const {activeSession,finishSession,setDialog}=useFarm(),[busy,setBusy]=useState(false),[error,setError]=useState('');
 async function finish(){setBusy(true);try{await finishSession();setDialog({type:'saved',data:{title:'Jornada guardada',summary:'El registro del recorrido ha terminado.'}})}catch(e){setError(e.message)}finally{setBusy(false)}}
 return <Dialog title="¿Terminaste tu jornada?" onClose={onClose} closeDisabled={busy}><div className="help-content"><p>Al finalizar, se guardará tu recorrido y dejará de registrarse la ubicación.</p>{activeSession&&<p className="saved-summary">{activeSession.workerName} · {activeSession.zone}</p>}{error&&<p className="form-error" role="alert">{error}</p>}<div className="stack-buttons"><Button icon={Square} disabled={busy} onClick={finish}>{busy?'Guardando recorrido…':'Sí, finalizar y guardar'}</Button><Button variant="secondary" disabled={busy} onClick={onClose}>Seguir trabajando</Button></div></div></Dialog>;
}
