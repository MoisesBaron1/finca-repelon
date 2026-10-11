import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve,dirname} from 'node:path';

// Lista explícita: nunca recorre credenciales, claves o copias de usuarios.
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const files=['CLAUDE.md','README.md','PRODUCT.md','DESIGN.md','docs/CONTRATO.md','docs/ALCANCE.md','docs/VERIFICACION.md','docs/CONTINUAR-EN-CLAUDE.md','docs/PROMPT-PARA-CLAUDE.md','promo/README.md','promo/CLAUDE.md'];
const version=JSON.parse(readFileSync(resolve(root,'package.json'),'utf8')).version;
const intro=`# Finca Repelón · Contexto para continuar en Claude\n\nVersión de la app: ${version}. Repositorio privado: https://github.com/MoisesBaron1/finca-repelon.\n\nEste archivo reúne instrucciones y documentación; no contiene el código completo ni credenciales. Los resultados de pruebas que aparecen tienen sus propias fechas y deben repetirse cuando corresponda. Para modificar código usa el repositorio local con Claude Code, conecta GitHub si tu cuenta lo admite o adjunta los archivos afectados.\n\nSe regenera desde la raíz con \`npm run prepare:claude\`.\n`;
const sections=files.map(file=>`\n---\n\n## Documento: ${file}\n\n${readFileSync(resolve(root,file),'utf8').trim()}\n`);
const output=resolve(root,'docs/CONTEXTO-PARA-CLAUDE.md');
writeFileSync(output,intro+sections.join(''));
console.log(`Contexto preparado: docs/CONTEXTO-PARA-CLAUDE.md (${files.length} documentos)`);
