export async function preparePhoto(file){
 if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw new Error('Elige una foto JPG, PNG o WebP.');
 if(file.size>15*1024*1024)throw new Error('Esta foto supera los 15 MB. Elige una más pequeña.');
 const source=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(new Error('No se pudo leer la foto. Vuelve a elegirla.'));reader.readAsDataURL(file);});
 const image=await new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error('No se pudo abrir esa foto. Elige otra imagen.'));img.src=source;});
 const scale=Math.min(1,1600/Math.max(image.naturalWidth,image.naturalHeight));
 if(!image.naturalWidth||!image.naturalHeight||image.naturalWidth*image.naturalHeight>40000000)throw new Error('La imagen es demasiado grande para este teléfono. Elige una foto de menor tamaño.');
 const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));
 const context=canvas.getContext('2d');if(!context)throw new Error('Este navegador no pudo preparar la foto. Intenta con otra imagen.');
 context.fillStyle='#ffffff';context.fillRect(0,0,canvas.width,canvas.height);context.drawImage(image,0,0,canvas.width,canvas.height);
 let output=canvas.toDataURL('image/jpeg',.82);
 if(output.length>900000)output=canvas.toDataURL('image/jpeg',.65);
 if(output.length>2*1024*1024)throw new Error('No se pudo reducir la foto lo suficiente. Elige una más sencilla.');
 return output;
}
