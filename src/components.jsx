import React,{useEffect,useRef,useState,useId} from 'react';
import {X,Leaf,Plus,ChevronRight,Check,MapPin,Navigation,LocateFixed,ZoomIn,ZoomOut,ImagePlus,AlertCircle} from 'lucide-react';
import {preparePhoto} from './photo.mjs';

export function IconButton({label,children,...props}){return <button className="icon-button" aria-label={label} title={label} {...props}>{children}</button>}
export function Button({children,icon:Icon,variant='primary',className='',...props}){return <button className={`button ${variant} ${className}`} {...props}>{Icon&&<Icon size={17}/>}<span>{children}</span></button>}
export function AsyncButton({onClick,children,disabled,busyLabel='Guardando…',onError,...props}){
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),pending=useRef(false);
 async function run(e){if(pending.current)return;pending.current=true;setBusy(true);setError('');try{await onClick(e)}catch(e){const message=e.message||'No se pudo completar. Tus datos siguen guardados. Intenta otra vez.';setError(message);onError?.(e)}finally{pending.current=false;setBusy(false)}}
 return <>{error&&<span className="action-error" role="alert">{error}</span>}<Button {...props} disabled={disabled||busy} aria-busy={busy} onClick={run}>{busy?busyLabel:children}</Button></>;
}
export function Badge({children,tone}){
 const tones={'Verificada':'green','Activo':'green','Producción':'green','Terminada':'green','Por revisar':'amber','Alta':'red','Abierta':'amber','Pendiente':'gray','En curso':'blue','Interrumpida':'red','Floración':'amber','Baja':'gray','Media':'amber','Resuelta':'green','Reportada':'blue','Probable':'blue','Ambigua':'amber'};
 return <span className={`badge ${tone||tones[children]||'gray'}`}>{children}</span>
}
export function Avatar({name='Administrador',small=false}){const initials=name.split(' ').slice(0,2).map(x=>x[0]).join('');return <span className={`avatar ${small?'small':''}`} title={name}>{initials}</span>}
export function Empty({title='Todavía no hay registros',text='Añade el primer registro para comenzar.',action}){return <div className="empty"><Leaf size={30}/><h3>{title}</h3><p>{text}</p>{action}</div>}
export function Dialog({title,subtitle,children,onClose,wide=false,closeDisabled=false}){
 const ref=useRef(),closeRef=useRef();closeRef.current=()=>{if(!closeDisabled)onClose()};
 useEffect(()=>{const d=ref.current;d.showModal();const onBack=()=>closeRef.current();window.addEventListener('native-back',onBack);return()=>{window.removeEventListener('native-back',onBack);d.close()};},[]);
 return <dialog ref={ref} className={`dialog ${wide?'wide':''}`} aria-labelledby="dialog-title" onCancel={e=>{e.preventDefault();if(!closeDisabled)onClose()}}>
 <div className="dialog-head"><div><h2 id="dialog-title">{title}</h2>{subtitle&&<p>{subtitle}</p>}</div><Button variant="secondary" disabled={closeDisabled} onClick={onClose}>Cerrar</Button></div>
 {children}</dialog>
}
export function Field({label,name,type='text',options,required=false,defaultValue,value,onChange,help,min,max,step,wide=false,disabled=false,minLength,maxLength}){
 const helpId=useId();
 const control=value!==undefined?{value,onChange}:{defaultValue};
 return <label className={`field ${wide?'full':''}`}><span>{label}{required&&<span className="required" aria-hidden="true"> *</span>}</span>
 {type==='select'?<select aria-label={label} aria-describedby={help?helpId:undefined} name={name} {...control} required={required} disabled={disabled}><option value="" disabled={required}>{required?'Elige una opción':'Sin seleccionar'}</option>{options?.map(o=><option key={o.value??o} value={o.value??o}>{o.label??o}</option>)}</select>:type==='textarea'?<textarea aria-label={label} aria-describedby={help?helpId:undefined} name={name} rows={3} {...control} required={required} disabled={disabled} maxLength={maxLength||4000}/>:<input aria-label={label} aria-describedby={help?helpId:undefined} name={name} type={type} inputMode={type==='number'?(String(step)==='1'?'numeric':'decimal'):undefined} {...control} required={required} disabled={disabled} min={min} max={max} step={step} minLength={minLength} maxLength={maxLength||(type==='text'?300:undefined)} autoComplete={type==='password'?'new-password':'off'}/>}
 {help&&<small id={helpId}>{help}</small>}</label>
}
export function RecordForm({fields,onSubmit,onCancel,values={},children,submitLabel='Guardar registro',photo=false,steps,onDirtyChange,onBusyChange}){
 const [busy,setBusy]=useState(false),[attaching,setAttaching]=useState(false),[error,setError]=useState(''),[image,setImage]=useState(values.photo||''),[step,setStep]=useState(0),pending=useRef(false);
 const [draft,setDraft]=useState(()=>Object.fromEntries(fields.map(f=>{const value=values[f.name]??f.defaultValue??'';return[f.name,f.type==='select'&&value!==''&&!f.options?.some(o=>(o.value??o)===value)?f.defaultValue??'':value]})));
 const formRef=useRef(),headingRef=useRef(),isReview=!!steps&&step===steps.length;
 const shown=steps?(steps[step]?.fields||[]).map(name=>fields.find(f=>f.name===name)).filter(Boolean):fields.filter(f=>f.required);
 const optional=fields.filter(f=>!f.required&&!steps?.some(s=>s.fields.includes(f.name)));
 useEffect(()=>{if(step>0)headingRef.current?.focus();},[step]);
 useEffect(()=>{onBusyChange?.(busy||attaching)},[busy,attaching]);
 function change(name,value){setDraft(d=>({...d,[name]:value}));onDirtyChange?.(true);setError('');}
 function validate(){
  const controls=[...formRef.current.querySelectorAll('input,select,textarea')];
  for(const control of controls)if(control.required&&['text','textarea'].includes(control.type))control.setCustomValidity(control.value.trim()?'':'Escribe este dato.');
  const invalid=controls.find(control=>!control.validity.valid);
  if(!invalid)return true;
  const field=fields.find(f=>f.name===invalid.name);
  setError(`Revisa «${field?.label||'este dato'}». ${invalid.validity.valueMissing||invalid.validity.customError?'Falta completarlo.':'Usa un valor dentro del rango indicado.'}`);
  const details=invalid.closest('details');if(details)details.open=true;
  invalid.focus();invalid.reportValidity();return false;
 }
 async function submit(e){
  e.preventDefault();if(pending.current||attaching||!validate())return;
  if(steps&&!isReview){setError('');setStep(s=>s+1);return;}
  pending.current=true;setBusy(true);setError('');
  try{const data={...draft};for(const f of fields){if(typeof data[f.name]==='string')data[f.name]=data[f.name].trim();if(f.type==='number')data[f.name]=data[f.name]===''?null:Number(data[f.name]);}if(photo)data.photo=image||null;await onSubmit(data);}
  catch(e){setError(e.message||'No se pudo guardar. Tus datos siguen aquí. Intenta otra vez.');}
  finally{pending.current=false;setBusy(false);}
 }
 async function attach(e){const input=e.target,f=input.files[0];if(!f)return;setAttaching(true);setError('');onDirtyChange?.(true);try{setImage(await preparePhoto(f))}catch(e){setError(e.message)}finally{setAttaching(false);input.value='';}}
 function showValue(f){const value=draft[f.name];if(value===''||value==null)return 'Sin anotar';if(f.type==='select')return f.options?.find(o=>(o.value??o)===value)?.label||value;if(f.type==='date')return new Date(value+'T12:00:00').toLocaleDateString('es-CO',{day:'numeric',month:'long',year:'numeric'});return value;}
 const renderField=f=><Field key={f.name} {...f} disabled={busy||attaching} value={draft[f.name]} onChange={e=>{e.target.setCustomValidity('');change(f.name,e.target.value)}}/>;
 return <form ref={formRef} onSubmit={submit} className="record-form" noValidate>
 {steps&&<div className="form-step"><p>Paso {step+1} de {steps.length+1}</p><h3 ref={headingRef} tabIndex={-1}>{isReview?'Revisa tu anotación':steps[step].title}</h3><p>{isReview?'Si todo está bien, toca el botón de abajo para guardar.':steps[step].hint||'Completa estos datos y toca Continuar.'}</p></div>}
 {isReview?<><dl className="record-review">{fields.filter(f=>f.required||draft[f.name]!=='').map(f=><div key={f.name}><dt>{f.label}</dt><dd>{showValue(f)}</dd></div>)}</dl>{image&&<p className="review-photo"><Check size={20}/> Foto incluida</p>}</>:<><p className="required-note">Los datos con * son necesarios.</p><div className="form-grid">{shown.map(renderField)}{children}</div>
 {(!steps||step===steps.length-1)&&optional.length>0&&<details className="optional-fields"><summary>Añadir otros detalles (opcional)</summary><div className="form-grid">{optional.map(renderField)}</div></details>}
 {photo&&(!steps||step===steps.length-1)&&<div className="field full photo-field"><span>Foto (opcional)</span><label className="photo-picker"><ImagePlus size={23}/> {attaching?'Preparando foto…':image?'Cambiar foto':'Añadir foto'}<input type="file" accept="image/jpeg,image/png,image/webp" disabled={attaching||busy} onChange={attach}/></label><small>La foto se reduce para ocupar menos espacio en el teléfono.</small>{attaching&&<p role="status">Preparando la foto. Espera un momento.</p>}{image&&<div className="photo-preview"><img src={image} alt="Evidencia adjunta"/><button type="button" disabled={busy||attaching} onClick={()=>{setImage('');onDirtyChange?.(true)}}>Quitar foto</button></div>}</div>}</>}
 {error&&<p className="form-error" role="alert"><AlertCircle size={20}/>{error}</p>}
 <div className="dialog-foot"><p className="save-note">{isReview||!steps?'Se guardará en este teléfono o equipo.':'Todavía no se ha guardado.'}</p><div className="form-buttons"><Button type="button" variant="secondary" disabled={busy||attaching} onClick={()=>step>0?(setStep(s=>s-1),setError('')):onCancel()}>{step>0?'Volver al paso anterior':'Salir sin guardar'}</Button><Button type="submit" aria-busy={busy||attaching} disabled={busy||attaching}>{attaching?'Preparando foto…':busy?'Guardando…':steps&&!isReview?'Continuar':submitLabel}</Button></div></div></form>
}

export function SectionTitle({title,subtitle,action}){return <div className="section-title"><div><h2>{title}</h2>{subtitle&&<p>{subtitle}</p>}</div>{action}</div>}
export function PageTitle({title,subtitle,children}){return <div className="page-title"><div><h1 tabIndex={-1}>{title}</h1>{subtitle&&<p>{subtitle}</p>}</div>{children&&<div className="page-actions">{children}</div>}</div>}
export function ResponsiveTable({children,...props}){
 const blocks=React.Children.toArray(children),head=blocks.find(x=>x.type==='thead');
 const text=node=>React.Children.toArray(node).map(x=>typeof x==='string'||typeof x==='number'?x:React.isValidElement(x)?text(x.props.children):'').join('');
 const headings=head?React.Children.toArray(React.Children.toArray(head.props.children)[0]?.props.children).map(h=>text(h.props.children)):[];
 return <table {...props} className="responsive-table" role="table">{blocks.map(block=>block.type==='tbody'?React.cloneElement(block,{},React.Children.map(block.props.children,row=>React.isValidElement(row)?React.cloneElement(row,{role:'row'},React.Children.map(row.props.children,(cell,i)=>React.isValidElement(cell)?React.cloneElement(cell,{'data-label':headings[i]||undefined,role:'cell'}):cell)):row)):block)}</table>;
}
export function Tabs({items,active,onChange}){return <div className="tabs" role="tablist">{items.map(x=><button key={x.value??x} role="tab" aria-selected={active===(x.value??x)} className={active===(x.value??x)?'active':''} onClick={()=>onChange(x.value??x)}>{x.label??x.value??x}{x.count!=null&&<span>{x.count}</span>}</button>)}</div>}

export function FarmMap({palms=[],demo=false,selected,onSelect,compact=false,points=[],label=true}){
 const [zoom,setZoom]=useState(1),[layer,setLayer]=useState('Todas');
 const valid=palms.filter(p=>Number.isFinite(p.lat)&&Number.isFinite(p.lng));
 const all=[...valid,...points.filter(p=>Number.isFinite(p.lat)&&Number.isFinite(p.lng))];
 const lats=all.map(p=>p.lat),lngs=all.map(p=>p.lng);
 const minLat=Math.min(...lats),maxLat=Math.max(...lats),minLng=Math.min(...lngs),maxLng=Math.max(...lngs);
 const position=p=>({x:70+(p.lng-minLng)/(maxLng-minLng||0.001)*(demo?380:650),y:90+(maxLat-p.lat)/(maxLat-minLat||0.001)*(demo?190:240)});
 return <div className={`farm-map ${compact?'compact':''}`}>
 {!compact&&<div className="map-toolbar"><div className="map-layer">{['Todas','Palma','Recorrido'].map(x=><button key={x} className={layer===x?'active':''} onClick={()=>setLayer(x)}>{x}</button>)}</div><span><MapPin size={14}/>{demo?'Plano de ejemplo':'Coordenadas registradas'}</span></div>}
 <svg viewBox="0 0 820 370" role="img" aria-label={demo?'Plano ilustrativo de la finca de ejemplo con palmas, potreros y plátano':'Plano de coordenadas locales de palmas y recorrido'}>
 <defs><pattern id="field-grid" width="26" height="26" patternUnits="userSpaceOnUse"><path d="M26 0H0V26" stroke="#dce4d8" strokeWidth=".65" fill="none"/></pattern><pattern id="banana-lines" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><path d="M0 0V12" stroke="#d3dca6" strokeWidth="2"/></pattern></defs>
 <rect width="820" height="370" fill="#edf1e6"/><rect width="820" height="370" fill="url(#field-grid)"/>
 <g transform={`translate(${410*(1-zoom)} ${185*(1-zoom)}) scale(${zoom})`}>
 {demo&&<>
 <path d="M45 47L482 41 492 307 46 322Z" fill="#dce8ce" stroke="#a7bd99" strokeWidth="1.5"/>
 <path d="M508 47L765 70 777 177 510 167Z" fill="#e5edcf" stroke="#b9c6a3" strokeWidth="1.5"/>
 <path d="M510 184L776 197 766 311 515 313Z" fill="#e9eacb" stroke="#babf93" strokeWidth="1.5"/>
 <path d="M510 184L776 197 766 311 515 313Z" fill="url(#banana-lines)"/>
 <path d="M499 31L504 335M25 338L790 329" stroke="#c8bba2" strokeWidth="10" fill="none"/><path d="M499 31L504 335M25 338L790 329" stroke="#fffef8" strokeWidth="4" strokeDasharray="6 5" fill="none"/>
 {label&&<><text x="60" y="66" fill="#436040" fontSize="14" fontWeight="700">Palmar norte</text><text x="588" y="112" fill="#5c6b46" fontSize="15" fontWeight="600">Potrero 1</text><text x="586" y="138" fill="#66744f" fontSize="11">Ganado bovino</text><text x="572" y="242" fill="#666b3e" fontSize="15" fontWeight="600">El Porvenir</text><text x="599" y="266" fill="#666b3e" fontSize="11">Plátano · 2,4 ha</text></>}
 </>}
 {layer!=='Recorrido'&&valid.map(p=>{const q=position(p),fill=p.workStatus==='verified'?'#37633f':p.visitStatus==='probable'?'#84a667':p.visitStatus==='ambiguous'?'#c99a48':'#d1daba';return <g key={p.id} onClick={()=>onSelect?.(p)} className={onSelect?'map-palm clickable':'map-palm'} role={onSelect?'button':undefined} aria-label={`${p.code} · ${p.workStatus==='verified'?'labor verificada':'sin verificar'}`} tabIndex={onSelect?0:undefined} onKeyDown={e=>{if(e.key==='Enter')onSelect?.(p)}}><title>{p.code}</title>{selected===p.id&&<circle cx={q.x} cy={q.y} r="13" fill="none" stroke="#123c30" strokeWidth="2"/>}<circle cx={q.x} cy={q.y} r="6.5" fill={demo?fill:'#477b55'} stroke={demo?'#f0f5e8':'#fff'} strokeWidth="2"/>{!compact&&zoom>1.5&&<text x={q.x+8} y={q.y+3} fontSize="8" fill="#123c30">{p.code}</text>}</g>})}
 {points.map((p,i)=>{const prev=points[i-1];if(!prev||p.segment!==prev.segment||p.monoMs-prev.monoMs>15000||p.monoMs<=prev.monoMs||p.accuracy>20||prev.accuracy>20||p.mock||prev.mock)return null;const a=position(prev),b=position(p);return <line key={p.id} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#285fb4" strokeWidth="2.5"/>})}
 {!all.length&&<text x="410" y="185" textAnchor="middle" fontSize="16" fill="#52694c">Añade coordenadas de palmas para ver el plano</text>}
 </g><g transform="translate(785 30)"><path d="M0 27V5M-5 11L0 3 5 11" stroke="#53624a" fill="none" strokeWidth="1.5"/><text x="0" y="0" fontSize="12" textAnchor="middle" fill="#53624a">N</text></g>
 </svg><div className="map-bottom"><div className="map-legend"><span><i className="legend-dot verified"/>Verificada</span><span><i className="legend-dot probable"/>Visita probable</span><span><i className="legend-dot pending"/>Sin visita</span></div><div className="map-controls"><IconButton label="Reducir zoom" onClick={()=>setZoom(z=>Math.max(1,z-.4))}><ZoomOut size={16}/></IconButton><IconButton label="Restablecer plano" onClick={()=>setZoom(1)}><LocateFixed size={16}/></IconButton><IconButton label="Ampliar zoom" onClick={()=>setZoom(z=>Math.min(2.6,z+.4))}><ZoomIn size={16}/></IconButton></div></div>
 </div>
}

export function WeightChart({weights=[]}){
 if(weights.length<2)return <p className="muted">Registra al menos dos pesajes para ver la evolución.</p>;
 const w=weights.toSorted((a,b)=>a.date.localeCompare(b.date)),min=Math.min(...w.map(x=>x.kg))-10,max=Math.max(...w.map(x=>x.kg))+10;
 const p=w.map((x,i)=>({x:40+i/(w.length-1)*450,y:150-(x.kg-min)/(max-min)*120,...x}));
 return <svg viewBox="0 0 530 190" className="weight-chart" role="img" aria-label="Evolución de peso en kilogramos">{[min,(min+max)/2,max].map(n=><g key={n}><line x1="40" x2="510" y1={150-(n-min)/(max-min)*120} y2={150-(n-min)/(max-min)*120} stroke="#e5ebe6"/><text x="0" y={155-(n-min)/(max-min)*120} fill="#63756b" fontSize="11">{Math.round(n)}</text></g>)}<polyline fill="none" stroke="#357b52" strokeWidth="2.5" points={p.map(x=>`${x.x},${x.y}`).join(' ')}/>{p.map((x,i)=><g key={x.id}><circle cx={x.x} cy={x.y} r="4" fill="#357b52"/><text x={x.x} y={x.y-10} textAnchor="middle" fill="#204b34" fontSize="12">{x.kg} kg</text>{(i===0||i===p.length-1)&&<text x={x.x} y="178" textAnchor="middle" fill="#63756b" fontSize="11">{new Date(x.date+'T12:00:00').toLocaleDateString('es-CO',{day:'numeric',month:'short'})}</text>}</g>)}</svg>
}
