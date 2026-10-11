import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const repository='MoisesBaron1/finca-repelon';
const url=`https://github.com/${repository}.git`;
const run=(command,args)=>execFileSync(command,args,{cwd:root,encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
let info;
try{info=JSON.parse(run('gh',['repo','view',repository,'--json','nameWithOwner,isPrivate']));}
catch{
 console.error(`No se pudo abrir ${repository}. Comprueba la cuenta, el nombre y el acceso de la conexión GitHub. Si todavía no existe, créalo privado y vacío desde https://github.com/new?name=finca-repelon&visibility=private.`);
 process.exit(1);
}
if(info.nameWithOwner.toLowerCase()!==repository.toLowerCase()||!info.isPrivate)throw new Error('El destino debe ser el repositorio privado acordado.');
if(run('git',['status','--porcelain']))throw new Error('Guarda y revisa los cambios en un commit antes de publicar.');
if(run('git',['branch','--show-current'])!=='main')throw new Error('La entrega inicial debe publicarse desde la rama main.');
const names=run('git',['ls-files']).split('\n');
if(names.some(name=>/(^|\/)(\.env[^/]*|\.vercel)(\/|$)|\.(jks|keystore|password|finca)$/.test(name)))throw new Error('Hay archivos privados versionados; revisa la entrega.');
let remote;
try{remote=run('git',['remote','get-url','github']);}catch{}
if(remote&&remote!==url)throw new Error('El remoto github ya apunta a otro destino; revísalo antes de publicar.');
if(!remote)run('git',['remote','add','github',url]);
// Usa la autenticación normal de gh sin extraer tokens ni cambiar el remoto de Sites.
execFileSync('git',['-c','credential.helper=','-c','credential.https://github.com.helper=!gh auth git-credential','push','--set-upstream','github','main'],{cwd:root,stdio:'inherit'});
const local=run('git',['rev-parse','HEAD']);
const published=run('gh',['api',`repos/${repository}/commits/main`,'--jq','.sha']);
if(local!==published)throw new Error('No coincide el commit publicado con la entrega local.');
console.log(`Código publicado y verificado: https://github.com/${repository} (${local.slice(0,7)})`);
