import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createAlbumGenerator,validateInput,validatePlan} from '../server/album-ai.mjs';
const input={description:'Лето на море',pages:20,photoCount:2};
const plan={title:'Лето',spreads:Array.from({length:10},()=>({layout:'Одно фото',caption:'Воспоминания',background:'#f5eee4',photos:[1]}))};
test('missing credentials never call provider',async()=>{let calls=0;const generate=createAlbumGenerator({env:{},fetcher:()=>{calls++;}});await assert.rejects(generate(input),e=>e.status===503);assert.equal(calls,0);});
test('reject invalid inputs and invented photo indices',()=>{assert.throws(()=>validateInput({...input,pages:22}));assert.throws(()=>validateInput({...input,photoCount:0}));assert.throws(()=>validatePlan({...plan,spreads:[]},input));assert.throws(()=>validatePlan({...plan,spreads:plan.spreads.map(s=>({...s,photos:[3]}))},input));});
test('catalog validated, temporary failures retried, only whitelisted input sent',async()=>{const calls=[];let failures=0;const generate=createAlbumGenerator({env:{AIAI_API_KEY:'test-secret',AI_MODEL:'deepseek-test'},sleep:async()=>{},fetcher:async(url,options)=>{calls.push({url,options});if(url.endsWith('/models'))return Response.json({data:[{id:'deepseek-test'}]});if(failures++===0)return new Response('',{status:503});return Response.json({choices:[{finish_reason:'stop',message:{content:JSON.stringify(plan)}}]});}});assert.deepEqual(await generate({...input,photoData:'private-data',apiKey:'private-key'}),plan);await generate(input);assert.equal(calls.filter(c=>c.url.endsWith('/models')).length,1);const body=JSON.parse(calls[1].options.body);assert.equal(body.thinking.type,'disabled');assert(!JSON.stringify(body).includes('private-'));assert.equal(calls[1].options.redirect,'error');});
test('unavailable model rejected before completion',async()=>{let calls=0;const generate=createAlbumGenerator({env:{AIAI_API_KEY:'x',AI_MODEL:'missing'},fetcher:async()=>{calls++;return Response.json({data:[]});}});await assert.rejects(generate(input),e=>e.status===503);assert.equal(calls,1);});
test('truncated or malformed model output cannot be applied',async()=>{for(const choice of [{finish_reason:'length',message:{content:JSON.stringify(plan)}},{finish_reason:'stop',message:{content:'not json'}}]){const generate=createAlbumGenerator({env:{AIAI_API_KEY:'x',AI_MODEL:'test'},fetcher:async url=>Response.json(url.endsWith('/models')?{data:[{id:'test'}]}:{choices:[choice]})});await assert.rejects(generate(input),e=>e.status===502);}});

test('large provider catalog does not block a small valid album',async()=>{
 const catalog={data:[{id:'test',description:'x'.repeat(150000)}]};
 const generate=createAlbumGenerator({env:{AIAI_API_KEY:'test-key',AI_MODEL:'test'},fetcher:async url=>Response.json(url.endsWith('/models')?catalog:{choices:[{finish_reason:'stop',message:{content:JSON.stringify(plan)}}]})});
 assert.deepEqual(await generate(input),plan);
});
test('upstream response byte limit still rejects oversized bodies',async()=>{
 const generate=createAlbumGenerator({env:{AIAI_API_KEY:'test-key',AI_MODEL:'test'},fetcher:async()=>new Response('x'.repeat(4*1024*1024+1))});
 await assert.rejects(generate(input),e=>e.status===502);
});
