// Android 8 can run an updated WebView without newer Array and UUID methods.
// Keep the fallback limited to the methods used by this app.
'use strict';

function defineMissing(target,name,value){
 if(typeof target[name]!=='function')Object.defineProperty(target,name,{value,writable:true,configurable:true,enumerable:false});
}
function lengthOf(value){
 return Math.min(Math.max(Math.trunc(value.length)||0,0),Number.MAX_SAFE_INTEGER);
}
defineMissing(Array.prototype,'toSorted',function toSorted(compareFn){
 return Array.from({length:lengthOf(this)},(_,index)=>this[index]).sort(compareFn);
});
defineMissing(Array.prototype,'toReversed',function toReversed(){
 const length=lengthOf(this);
 return Array.from({length},(_,index)=>this[length-1-index]);
});
defineMissing(Array.prototype,'at',function at(index){
 const length=lengthOf(this),relative=Math.trunc(index)||0,position=relative<0?length+relative:relative;
 return position<0||position>=length?undefined:this[position];
});

const secureCrypto=globalThis.crypto;
if(secureCrypto&&typeof secureCrypto.getRandomValues==='function'){
 defineMissing(secureCrypto,'randomUUID',function randomUUID(){
  const bytes=secureCrypto.getRandomValues(new Uint8Array(16));
  bytes[6]=(bytes[6]&0x0f)|0x40;
  bytes[8]=(bytes[8]&0x3f)|0x80;
  const hex=Array.from(bytes,byte=>byte.toString(16).padStart(2,'0')).join('');
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
 });
}
