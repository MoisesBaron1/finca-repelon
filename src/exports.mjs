export const exportNames={tasks:'tareas',palms:'palmas',animals:'ganado',weights:'pesajes',health:'salud-ganado',harvests:'cosechas',labors:'labores',movements:'inventario-movimientos',finances:'dinero',incidents:'problemas'};
export function exportRows(kind,state,rows=state[kind]||[]){
 const index=type=>new Map((state[type]||[]).map(row=>[row.id,row]));
 const people=index('people'),animals=index('animals'),plots=index('plots'),resources=index('resources');
 const formats={
  tasks:r=>({labor:r.name,actividad:r.module,zona:r.zone,responsable:people.get(r.personId)?.name||'Sin responsable',fecha:r.date,prioridad:r.priority,estado:r.status,revision:r.review?.reason||'',revisor:r.review?.by||'',observaciones:r.note||''}),
  palms:r=>({codigo:r.code,zona:r.zone,fila:r.row,latitud:r.lat,longitud:r.lng,precision_m:r.accuracy,coordenadas_validadas:r.validated?'Sí':'No',labor:r.workStatus==='verified'?'Verificada':'Pendiente',fecha_levantamiento:r.surveyDate||'',metodo:r.surveyMethod||''}),
  animals:r=>({codigo:r.code,nombre:r.name,sexo:r.sex,raza:r.breed||'',potrero:r.lot,nacimiento:r.birth||'',estado:r.status,observaciones:r.note||''}),
  weights:r=>({codigo_animal:animals.get(r.animalId)?.code||'',animal:animals.get(r.animalId)?.name||'Animal sin ficha',fecha:r.date,peso_kg:r.kg,metodo:r.method,tipo:r.method==='Báscula'?'Medido':'Estimado',equipo:r.equipment||'',observaciones:r.note||''}),
  health:r=>({animal:animals.get(r.animalId)?.name||'Animal sin ficha',codigo_animal:animals.get(r.animalId)?.code||'',fecha:r.date,tipo:r.type,observaciones:r.note,prioridad:r.priority,proximo_control:r.nextDate||'',responsable:r.professional||'',seguimiento:r.resolved?'Cerrado':'Pendiente'}),
  harvests:r=>({lote:plots.get(r.plotId)?.name||'Lote sin ficha',ciclo:r.cycle,fecha:r.date,cantidad:r.quantity,unidad:r.unit,destino:r.destination,observaciones:r.note||''}),
  labors:r=>({lote:plots.get(r.plotId)?.name||'Lote sin ficha',ciclo:r.cycle,fecha:r.date,labor:r.type,responsable:people.get(r.personId)?.name||r.actor||'',detalle:r.note}),
  movements:r=>({recurso:resources.get(r.resourceId)?.name||'Recurso sin ficha',fecha:r.date,movimiento:r.delta>0?'Entrada':'Salida',cantidad:Math.abs(r.delta),unidad:resources.get(r.resourceId)?.unit||'',motivo:r.note||''}),
  finances:r=>({fecha:r.date,concepto:r.concept,tipo:r.type,valor:r.amount,moneda:r.currency,actividad:r.module,observaciones:r.note||''}),
  incidents:r=>({problema:r.title,actividad:r.module,lugar:r.target,fecha:r.date,prioridad:r.priority,estado:r.status,detalle:r.note,resolucion:r.resolution||''})
 };
 return rows.map(formats[kind]||((r)=>r));
}
export const qualityLabel={invalid:'Inválido',zone:'Zona',simulated:'Simulado',old:'Antiguo',imprecise:'Impreciso',ambiguous:'Ambiguo',valid:'Visita probable',anomalous:'Anómalo'};
