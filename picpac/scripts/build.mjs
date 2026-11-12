import fs from 'node:fs';
import path from 'node:path';
import childProcess from 'node:child_process';
import {syncBuiltinESMExports} from 'node:module';
import {fileURLToPath} from 'node:url';
import ts from 'typescript';
process.chdir(path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'));
await import('./check-assets.mjs');
// Vite's optional Windows network-drive probe must not block a local build
// when the host prevents spawning cmd.exe.
const originalExec=childProcess.exec;
childProcess.exec=function(...args){try{return originalExec.apply(this,args);}catch(error){if(args[0]!=='net use')throw error;const callback=args.at(-1);if(typeof callback==='function')queueMicrotask(()=>callback(error,'',''));return undefined;}};
syncBuiltinESMExports();
const config=ts.readConfigFile('tsconfig.json',ts.sys.readFile);
const parsed=ts.parseJsonConfigFileContent(config.config,ts.sys,process.cwd());
const program=ts.createProgram(parsed.fileNames,parsed.options);
const errors=ts.getPreEmitDiagnostics(program);
if(errors.length){console.error(ts.formatDiagnosticsWithColorAndContext(errors,{getCanonicalFileName:f=>f,getCurrentDirectory:()=>process.cwd(),getNewLine:()=> '\n'}));process.exit(1);}
const {build}=await import('vite');
await build();
const files=[];
function list(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())list(p);else files.push('/'+path.relative('dist',p).replaceAll('\\','/'));}}
list('dist');
const version='picpac-'+Date.now();
fs.writeFileSync('dist/sw.js',`const CACHE=${JSON.stringify(version)};const FILES=${JSON.stringify(files)};self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('picpac-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));self.addEventListener('fetch',event=>{if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;event.respondWith(fetch(event.request).catch(()=>caches.match(event.request).then(r=>r||(event.request.mode==='navigate'?caches.match('/index.html'):Response.error()))));});`);
let worker=fs.readFileSync('dist/sw.js','utf8');
worker=worker.replace("if(event.request.method!=='GET'", "if(new URL(event.request.url).pathname.startsWith('/api/'))return;if(event.request.method!=='GET'");
fs.writeFileSync('dist/sw.js',worker);

