import {readFileSync,mkdirSync,writeFileSync,renameSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';

const scenes=JSON.parse(readFileSync('narracion.json','utf8'));
mkdirSync('assets/voz',{recursive:true});
const timing=[];
let start=0;
for(const scene of scenes){
  const file=`assets/voz/${scene.id}.wav`;
  console.log(`Narrando ${scene.id}…`);
  execFileSync('npx',['--yes','hyperframes@0.8.112','tts',scene.text,'--voice','ef_dora','--speed','0.95','--output',file],{stdio:'inherit',env:process.env});
  execFileSync('ffmpeg',['-v','error','-y','-i',file,'-af','atempo=0.84',file+'.slow.wav'],{stdio:'inherit'});
  renameSync(file+'.slow.wav',file);
  const probe=JSON.parse(execFileSync('ffprobe',['-v','quiet','-show_format','-of','json',file],{encoding:'utf8'}));
  const voiceDuration=Number(probe.format.duration);
  const duration=Math.round((voiceDuration+1.6)*1000)/1000;
  timing.push({...scene,file,start,duration,voiceStart:start+0.8,voiceDuration});
  start=Math.round((start+duration)*1000)/1000;
}
writeFileSync('timing.json',JSON.stringify({duration:start,scenes:timing},null,2)+'\n');
console.log(`Duración: ${start}s. Guion y tiempos: ${resolve('timing.json')}`);
