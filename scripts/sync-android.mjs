import { cp, rm, mkdir } from 'node:fs/promises';
const dir='android/app/src/main/assets';
await rm(dir,{recursive:true,force:true});await mkdir(dir,{recursive:true});
for(const file of ['index.html','assets','favicon.svg','manifest.webmanifest'])await cp(`dist/${file}`,`${dir}/${file}`,{recursive:true});
console.log('Android assets synchronized; no external resources required.');
