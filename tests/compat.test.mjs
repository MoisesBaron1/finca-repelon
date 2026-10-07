import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {webcrypto} from 'node:crypto';

const source=await readFile(new URL('../src/compat.mjs',import.meta.url),'utf8').catch(error=>{if(error.code==='ENOENT')return '';throw error;});
function oldRuntime(crypto=webcrypto){
 const runtime=vm.createContext({crypto});
 vm.runInContext("for(const name of ['toSorted','toReversed','at'])delete Array.prototype[name];",runtime);
 return runtime;
}
const install=runtime=>vm.runInContext(source,runtime);
const evaluate=(runtime,expression)=>vm.runInContext(expression,runtime);

test('missing toSorted orders a copy without changing the original',()=>{
 const runtime=oldRuntime();install(runtime);
 assert.equal(evaluate(runtime,"typeof Array.prototype.toSorted"),'function');
 assert.equal(evaluate(runtime,"JSON.stringify((()=>{const original=[3,1,2];return [original.toSorted((a,b)=>a-b),original]})())"),'[[1,2,3],[3,1,2]]');
 assert.equal(evaluate(runtime,"JSON.stringify(['b','a','c'].toSorted())"),'["a","b","c"]');
});

test('missing toReversed reverses a copy and reads sparse arrays as undefined',()=>{
 const runtime=oldRuntime();install(runtime);
 assert.equal(evaluate(runtime,"typeof Array.prototype.toReversed"),'function');
 assert.equal(evaluate(runtime,"JSON.stringify((()=>{const original=[1,2,3];return [original.toReversed(),original]})())"),'[[3,2,1],[1,2,3]]');
 assert.equal(evaluate(runtime,"0 in Array(2).toSorted() && 1 in Array(2).toReversed()"),true);
 assert.equal(evaluate(runtime,"JSON.stringify(Array.prototype.toReversed.call({0:'a',2:'c',length:3}))"),'["c",null,"a"]');
});

test('missing at handles negative indices, fractions and out of range indices',()=>{
 const runtime=oldRuntime();install(runtime);
 assert.equal(evaluate(runtime,"typeof Array.prototype.at"),'function');
 assert.equal(evaluate(runtime,"[4,5,6].at(-1)"),6);
 assert.equal(evaluate(runtime,"[4,5,6].at(-2)"),5);
 assert.equal(evaluate(runtime,"[4,5,6].at(-1.8)"),6);
 assert.equal(evaluate(runtime,"[4,5,6].at('1')"),5);
 assert.equal(evaluate(runtime,"[4,5,6].at(NaN)"),4);
 for(const index of ['-4','3','Infinity','-Infinity'])assert.equal(evaluate(runtime,`[4,5,6].at(${index})`),undefined);
 assert.equal(evaluate(runtime,"Array.prototype.at.call({0:'a',1:'b',length:2},-1)"),'b');
});

test('polyfills preserve native implementations and stay non enumerable',()=>{
 const runtime=oldRuntime();
 evaluate(runtime,"Array.prototype.toSorted=function nativeSort(){};globalThis.before=Array.prototype.toSorted;");
 install(runtime);
 assert.equal(evaluate(runtime,"before===Array.prototype.toSorted"),true);
 assert.equal(evaluate(runtime,"Object.getOwnPropertyDescriptor(Array.prototype,'toReversed')?.enumerable"),false);
 assert.equal(evaluate(runtime,"Object.getOwnPropertyDescriptor(Array.prototype,'at')?.enumerable"),false);
});

test('missing randomUUID uses secure random bytes with UUID v4 version and variant',()=>{
 let calls=0;
 const crypto={getRandomValues:bytes=>{calls++;bytes.fill(255);return bytes;}};
 const runtime=oldRuntime(crypto);evaluate(runtime,"Math.random=()=>{throw new Error('Insecure randomness used')};");install(runtime);
 assert.equal(typeof crypto.randomUUID,'function');
 assert.equal(crypto.randomUUID(),'ffffffff-ffff-4fff-bfff-ffffffffffff');
 assert.equal(calls,1);
 assert.equal(Object.getOwnPropertyDescriptor(crypto,'randomUUID').enumerable,false);
});

test('fallback generates distinct UUIDs from the actual cryptographic random source',()=>{
 const crypto={getRandomValues:bytes=>webcrypto.getRandomValues(bytes)};
 const runtime=oldRuntime(crypto);install(runtime);
 assert.equal(typeof crypto.randomUUID,'function');
 const ids=Array.from({length:128},()=>crypto.randomUUID());
 assert.equal(new Set(ids).size,128);
 for(const id of ids)assert.match(id,/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
});

test('UUID shim preserves a native UUID method and never substitutes insecure entropy',()=>{
 const native=()=> 'native-uuid';
 const crypto={randomUUID:native,getRandomValues:bytes=>bytes};
 install(oldRuntime(crypto));assert.equal(crypto.randomUUID,native);
 const absent={};install(oldRuntime(absent));assert.equal(absent.randomUUID,undefined);
});
