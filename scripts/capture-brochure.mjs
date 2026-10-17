import {chromium} from 'playwright';
import {mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
const output=resolve('docs/folletos/imagenes');await mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{
 const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,locale:'es-CO'}),page=await context.newPage();
 await page.goto(process.env.APP_URL||'http://127.0.0.1:5173/');await page.getByRole('heading',{name:'¿Qué necesitas hacer?',exact:true}).waitFor();await page.evaluate(()=>document.fonts.ready);
 const dialog=()=>page.locator('dialog[open]').last();
 await page.getByRole('button',{name:'Anotar un dato',exact:false}).click();await page.getByRole('button',{name:'Anotar peso de ganado',exact:false}).click();
 await page.getByLabel('Animal',{exact:true}).selectOption('a1');await dialog().getByRole('button',{name:'Continuar',exact:true}).click();await page.getByLabel('Peso en kilogramos',{exact:true}).fill('402');await dialog().getByRole('button',{name:'Continuar',exact:true}).click();
 await dialog().getByRole('button',{name:'Guardar pesaje',exact:true}).screenshot({path:resolve(output,'guardar-pesaje.png')});
 await dialog().getByRole('button',{name:'Guardar pesaje',exact:true}).click();await dialog().getByRole('heading',{name:'Pesaje guardado',exact:true}).waitFor();
 await dialog().locator('.saved-result h3').screenshot({path:resolve(output,'confirmacion.png')});
 await dialog().getByRole('button',{name:'Volver al inicio',exact:true}).click();await page.getByRole('button',{name:'Datos de ejemplo',exact:true}).click();
 await dialog().getByRole('button',{name:'Usar mi finca',exact:true}).screenshot({path:resolve(output,'mi-finca.png')});
 await dialog().getByRole('button',{name:'Usar mi finca',exact:true}).click();
 await page.getByRole('button',{name:'Ayuda',exact:true}).click();await page.getByText('¿Cómo hago una copia de mis datos?',{exact:true}).click();await page.getByRole('button',{name:'Hacer una copia',exact:true}).click();
 await dialog().getByRole('button',{name:'Guardar copia protegida',exact:true}).screenshot({path:resolve(output,'guardar-copia.png')});
 console.log('PASS: cuatro recortes reales de la app 0.3.1, solo con datos de ejemplo; sin menús de sistema simulados.');
}finally{await browser.close()}
