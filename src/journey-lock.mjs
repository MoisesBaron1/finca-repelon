const name=mode=>`repelon-journey-${mode}`;

export async function recordingInAnotherPage(mode){
 if(!globalThis.navigator?.locks?.query)return null;
 const {held}=await navigator.locks.query();
 return held.some(lock=>lock.name===name(mode));
}

export async function acquireJourney(mode){
 if(!globalThis.navigator?.locks?.request)return ()=>{};
 return new Promise((resolve,reject)=>{
  navigator.locks.request(name(mode),{ifAvailable:true},async lock=>{
   if(!lock){reject(new Error('Hay una jornada abierta en otra pantalla. Vuelve a ella para continuar o finalizar.'));return;}
   await new Promise(release=>resolve(release));
  }).catch(reject);
 });
}
