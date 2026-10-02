import { uid, today } from './domain.mjs';
export const kinds=['settings','tasks','palms','animals','weights','health','plots','harvests','labors','resources','movements','finances','incidents','sessions','points','people'];
export const emptyState = () => Object.fromEntries(kinds.map(k=>[k,[]]));
export function seed(mode,deviceId) {
 const date=mode==='demo'?'2026-10-02':today(),offset=n=>{const d=new Date(date+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10);};
 const farmId=mode==='demo'?'repelon-example-v1':uid();
 const data=emptyState();
 data.settings=[{id:'farm',name:mode==='demo'?'Finca Repelón':'Mi finca',location:'Repelón, Atlántico',area:mode==='demo'?24.5:0,farmId,pilotApproved:false}];
 data.people=mode==='demo'?[{id:'u1',name:'Carlos Mendoza',role:'Trabajador'},{id:'u2',name:'José Martínez',role:'Encargado'},{id:'u3',name:'María Torres',role:'Supervisora'}]:[{id:'u1',name:'Administrador',role:'Administrador'}];
 if(mode==='demo') {
  data.palms=Array.from({length:48},(_,i)=>({id:`p${i+1}`,code:`P-${String(i+1).padStart(3,'0')}`,zone:'Palmar norte',row:Math.floor(i/8)+1,lat:10.495+Math.floor(i/8)*0.00010,lng:-75.125+(i%8)*0.00010,accuracy:1,validated:false,visitStatus:i<31?'probable':i<35?'ambiguous':'none',workStatus:i<23?'verified':i<31?'reported':'pending',example:true}));
  data.tasks=[
   {id:'t1',name:'Limpieza de plateo · fila 4',module:'Palma',zone:'Palmar norte',personId:'u1',date,priority:'Alta',status:'En curso',palmIds:data.palms.slice(24,32).map(p=>p.id)},
   {id:'t2',name:'Pesaje del lote de levante',module:'Ganado',zone:'Potrero 2',personId:'u2',date,priority:'Media',status:'Pendiente'},
   {id:'t3',name:'Deshoje y revisión del cultivo',module:'Plátano',zone:'Lote El Porvenir',personId:'u3',date,priority:'Media',status:'Por revisar'},
   {id:'t4',name:'Revisar cerca del lindero sur',module:'General',zone:'Lindero sur',personId:'u1',date:offset(-1),priority:'Alta',status:'Pendiente'},
   {id:'t5',name:'Limpieza de bebederos',module:'Ganado',zone:'Potrero 1',personId:'u2',date,priority:'Baja',status:'Verificada',review:{by:'Administrador',date:date,reason:'Inspección en campo'}},
   {id:'t6',name:'Cosecha de racimos maduros',module:'Plátano',zone:'Lote La Esperanza',personId:'u3',date:offset(1),priority:'Media',status:'Pendiente'}
  ];
  data.animals=[
   {id:'a1',code:'BOV-001',name:'Lucero',sex:'Hembra',breed:'Brahman',lot:'Potrero 1',birth:'2022-03-14',status:'Activo'},
   {id:'a2',code:'BOV-002',name:'Canela',sex:'Hembra',breed:'Gyr × Brahman',lot:'Potrero 2',birth:'2023-05-10',status:'Activo'},
   {id:'a3',code:'BOV-003',name:'Relámpago',sex:'Macho',breed:'Brahman',lot:'Potrero 2',birth:'2024-01-20',status:'Activo'},
   {id:'a4',code:'BOV-004',name:'Estrella',sex:'Hembra',breed:'Brahman',lot:'Potrero 1',birth:'2022-08-02',status:'Activo'},
   {id:'a5',code:'BOV-005',name:'Moro',sex:'Macho',breed:'Cebú',lot:'Potrero 3',birth:'2024-04-12',status:'Activo'},
   {id:'a6',code:'BOV-006',name:'Luna',sex:'Hembra',breed:'Gyr',lot:'Potrero 1',birth:'2021-11-08',status:'Activo'}
  ];
  data.weights=data.animals.flatMap((a,i)=>[0,1,2].map((j)=>({id:`w${i}-${j}`,animalId:a.id,kg:320+i*23+j*12,date:offset(-60+j*30),method:'Báscula',note:'Pesaje de ejemplo'})));
  data.health=[{id:'h1',animalId:'a2',type:'Observación',date,priority:'Alta',note:'Menor consumo de alimento. Solicitar revisión.',nextDate:offset(1),resolved:false},{id:'h2',animalId:'a1',type:'Vacunación',date:offset(-21),priority:'Media',note:'Registro según indicación veterinaria.',nextDate:offset(7),resolved:false}];
  data.plots=[{id:'l1',name:'El Porvenir',area:2.4,variety:'Hartón',planted:offset(-260),plants:2400,stage:'Producción',cycle:1},{id:'l2',name:'La Esperanza',area:1.8,variety:'Hartón',planted:offset(-190),plants:1800,stage:'Floración',cycle:1}];
  data.harvests=[{id:'c1',plotId:'l1',date:offset(-10),quantity:420,unit:'kg',destination:'Venta local',note:'Cosecha de ejemplo',cycle:1},{id:'c2',plotId:'l1',date:offset(-3),quantity:36,unit:'racimos',destination:'Venta local',note:'Cosecha de ejemplo',cycle:1}];
  data.labors=[{id:'b1',plotId:'l1',date:offset(-2),type:'Deshoje',note:'Labor de ejemplo',cycle:1}];
  data.resources=[{id:'r1',name:'Fertilizante NPK',unit:'kg',minimum:100},{id:'r2',name:'Sal mineralizada',unit:'kg',minimum:40},{id:'r3',name:'Guantes de trabajo',unit:'pares',minimum:5},{id:'r4',name:'Combustible',unit:'L',minimum:20}];
  data.movements=[{id:'m1',resourceId:'r1',delta:75,date,note:'Saldo de ejemplo'},{id:'m2',resourceId:'r2',delta:120,date,note:'Saldo de ejemplo'},{id:'m3',resourceId:'r3',delta:12,date,note:'Saldo de ejemplo'},{id:'m4',resourceId:'r4',delta:35,date,note:'Saldo de ejemplo'}];
  data.finances=[{id:'f1',type:'Ingreso',amount:850000,currency:'COP',date:offset(-3),concept:'Venta de plátano',module:'Plátano'},{id:'f2',type:'Gasto',amount:245000,currency:'COP',date:offset(-2),concept:'Insumos para plateo',module:'Palma'},{id:'f3',type:'Gasto',amount:95000,currency:'COP',date:offset(-1),concept:'Sal mineralizada',module:'Ganado'}];
  data.incidents=[{id:'i1',title:'Revisar cerca del lindero sur',module:'General',target:'Lindero sur',priority:'Alta',date:offset(-1),status:'Abierta',note:'Dos postes requieren mantenimiento.'},{id:'i2',title:'Palma con hojas amarillas',module:'Palma',target:'P-034',priority:'Media',date,status:'Abierta',note:'Revisar en la próxima inspección. Enlace manual.'}];
 }
 return Object.entries(data).flatMap(([kind,rows])=>rows.map(payload=>({id:`${mode}-seed-${kind}-${payload.id}`,entityId:payload.id,kind,payload,version:1,deviceId:mode==='demo'?'example-inventory':deviceId,actor:'Administrador',time:mode==='demo'?'2026-10-02T13:00:00.000Z':new Date().toISOString(),farmId})));
}
