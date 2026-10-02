import React,{useState,useEffect} from 'react';
import {House,ClipboardList,Leaf,Beef,Sprout,Package,ChartNoAxesCombined,Settings2,Menu,CheckCircle2,WifiOff,ShieldCheck,MapPin,TriangleAlert,HelpCircle,ArrowLeft,Square,ChevronRight} from 'lucide-react';
import {FarmProvider,useFarm} from './farm.jsx';
import {Button,Dialog} from './components.jsx';
import Forms from './Forms.jsx';
import {Overview,Tasks,Palms,Cattle,Banana,Resources,Reports,Settings} from './pages.jsx';
import {isNative} from './storage.mjs';

const navigation=[{id:'overview',name:'Inicio',icon:House},{id:'tasks',name:'Tareas',icon:ClipboardList},{id:'palms',name:'Palmas y jornadas',icon:Leaf},{id:'cattle',name:'Ganado',icon:Beef},{id:'banana',name:'Plátano',icon:Sprout},{id:'resources',name:'Herramientas y dinero',icon:Package},{id:'reports',name:'Informes',icon:ChartNoAxesCombined}];
export default function App(){return <FarmProvider><Shell/></FarmProvider>}
function Shell(){
 const {page,navigate,state,farm,ready,fatal,mode,setDialog,toast,setToast,online,activeSession}=useFarm();
 const [mobileNav,setMobileNav]=useState(false),title=navigation.find(n=>n.id===page)?.name||'Datos y ajustes';
 useEffect(()=>{setMobileNav(false);if(ready){window.scrollTo({top:0,behavior:'instant'});document.querySelector('main h1')?.focus({preventScroll:true});}},[page,ready]);
 useEffect(()=>{
  const context=document.modelContext;if(!context?.registerTool||!ready)return;
  const controller=new AbortController();
  for(const tool of [{name:'consultar_finca',title:'Consultar registros de la finca',description:'Consulta totales actuales y tareas pendientes del espacio de trabajo visible.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:async()=>({finca:farm.name,modo:mode,tareasPendientes:state.tasks.filter(t=>t.status!=='Verificada').map(t=>({id:t.id,nombre:t.name,fecha:t.date,estado:t.status})),palmas:state.palms.length,animales:state.animals.length,lotes:state.plots.length})},{name:'abrir_registro_tarea',title:'Abrir formulario de tarea',description:'Abre el formulario de nueva tarea. Todavía no guarda ningún registro.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:false},execute:async input=>{if(input&&Object.keys(input).length)throw new Error('No se aceptan parámetros.');setDialog({type:'task'});return{formulario:'Nueva tarea',guardado:false}}}])try{Promise.resolve(context.registerTool(tool,{signal:controller.signal})).catch(()=>{});}catch{}
  return()=>controller.abort();
 },[ready,state.tasks.length,mode]);
 if(fatal)return <div className="startup-error"><TriangleAlert size={32}/><h1>No se pudieron abrir tus datos</h1><p>{fatal}</p><Button onClick={()=>location.reload()}>Volver a intentar</Button></div>;
 if(!ready)return <div className="startup"><div className="brand-mark"><Leaf size={28}/></div><h1>Finca Repelón</h1><p>Abriendo tus anotaciones…</p></div>;
 const Current=({overview:Overview,tasks:Tasks,palms:Palms,cattle:Cattle,banana:Banana,resources:Resources,reports:Reports,settings:Settings})[page]||Overview;
 function go(next){navigate(next);setMobileNav(false);}
 function navigationButtons(){return <>{navigation.map(n=><button key={n.id} aria-label={n.name} className={`nav-item ${page===n.id?'active':''}`} onClick={()=>go(n.id)} aria-current={page===n.id?'page':undefined}><n.icon size={24}/><span>{n.name}</span><ChevronRight size={19}/></button>)}<button className={`nav-item ${page==='settings'?'active':''}`} onClick={()=>go('settings')}><Settings2 size={24}/><span>Datos y ajustes</span><ChevronRight size={19}/></button></>}
 return <div className="app-shell easy-shell">
 <a className="skip-link" href="#main-content">Ir al contenido</a>
 <aside className="sidebar">
 <button className="brand" onClick={()=>go('overview')} aria-label="Finca Repelón · ir al inicio"><span className="brand-mark"><Leaf size={27}/></span><strong>Finca Repelón</strong></button>
 <p className="sidebar-farm"><MapPin size={19}/>{farm.name}</p>
 <nav aria-label="Navegación principal">{navigationButtons()}</nav>
 <div className="sidebar-bottom"><Button variant="secondary" icon={HelpCircle} onClick={()=>setDialog({type:'help'})}>Ayuda para usar la app</Button><button className="copy-link" onClick={()=>setDialog({type:'backup'})}><ShieldCheck size={24}/><span>Hacer una copia<small>Para conservar tus datos</small></span></button></div>
 </aside>
 <div className="main-shell"><header className="topbar"><div className="topbar-left">{page==='overview'?<span className="current-location"><House size={24}/>Inicio</span>:<Button variant="secondary" icon={ArrowLeft} onClick={()=>go('overview')}>Volver al inicio</Button>}<span className="current-page">{page!=='overview'&&title}</span></div><div className="topbar-right"><button className={`example-tag ${mode==='real'?'real':''}`} onClick={()=>setDialog({type:'mode'})}>{mode==='demo'?'Datos de ejemplo':'Mi finca'}<ChevronRight size={19}/></button><Button variant="secondary" icon={HelpCircle} className="desktop-help" onClick={()=>setDialog({type:'help'})}>Ayuda</Button></div></header>
 {!online&&<div className="network-banner" role="status"><WifiOff size={23}/>Sin internet. Puedes seguir anotando: los datos se guardan aquí.</div>}
 {activeSession&&<div className="ongoing-journey"><span className="live-dot"/><div><strong>Tu jornada está en marcha</strong><span>{activeSession.workerName} · {activeSession.zone}</span></div><Button variant="secondary" icon={Square} onClick={()=>setDialog({type:'finishSession'})}>Finalizar jornada</Button></div>}
 <main id="main-content" tabIndex={-1}><Current/><footer className="main-footer"><span><ShieldCheck size={18}/>Tus datos se guardan en este {isNative()?'teléfono':'equipo'}.</span><span>Gratis · sin suscripción</span></footer></main></div>
 <nav className="mobile-bottom-nav" aria-label="Accesos rápidos"><button aria-label="Inicio" aria-current={page==='overview'?'page':undefined} onClick={()=>go('overview')}><House size={25}/><span>Inicio</span></button><button aria-label="Tareas" aria-current={page==='tasks'?'page':undefined} onClick={()=>go('tasks')}><ClipboardList size={25}/><span>Tareas</span></button><button onClick={()=>setMobileNav(true)}><Menu size={25}/><span>Más opciones</span></button><button onClick={()=>setDialog({type:'help'})}><HelpCircle size={25}/><span>Ayuda</span></button></nav>
 {mobileNav&&<Dialog title="Más opciones de la finca" onClose={()=>setMobileNav(false)}><nav className="mobile-all-options" aria-label="Navegación principal">{navigationButtons()}<button className="nav-item" onClick={()=>{setMobileNav(false);setDialog({type:'backup'})}}><ShieldCheck size={24}/><span>Hacer una copia</span><ChevronRight size={19}/></button></nav></Dialog>}
 <Forms/>{toast&&<div className={`toast ${toast.type}`} role={toast.type==='error'?'alert':'status'}>{toast.type==='error'?<TriangleAlert size={24}/>:<CheckCircle2 size={24}/>}<span>{toast.message}</span><button className="toast-dismiss" onClick={()=>setToast(null)}>Entendido</button></div>}
 </div>;
}
