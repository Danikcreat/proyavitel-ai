import http from 'node:http';
import {albumHandler} from './server/album-ai.mjs';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createMockApi} from './server/mock-api.mjs';
const root=path.dirname(fileURLToPath(import.meta.url));
const base=path.join(root,'dist');
const api=createMockApi({catalogFile:path.join(root,'public/mock/catalog.json'),dataDir:process.env.PICPAC_DATA_DIR||path.join(root,'.picpac-data')});
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.webmanifest':'application/manifest+json','.png':'image/png','.svg':'image/svg+xml','.ttf':'font/ttf'};
http.createServer(async(req,res)=>{try{const url=new URL(req.url,'http://localhost');if(url.pathname==='/health'){res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({app:'picpac',status:'ready',api:'track2-1'}));return;}if(url.pathname==='/api/album'){await albumHandler(req,res);return;}if(url.pathname.startsWith('/api/')){await api(req,res,url);return;}let name;try{name=decodeURIComponent(url.pathname);}catch{res.writeHead(400);res.end();return;}let file=path.resolve(base,'.'+name);if(!file.startsWith(base+path.sep)&&file!==base){res.writeHead(403);res.end();return;}if(file===base||fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(base,'index.html');if(!fs.existsSync(file)){res.writeHead(404);res.end('Not found');return;}res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});fs.createReadStream(file).pipe(res);}catch(e){res.writeHead(500);res.end('Mock server error');console.error(e.message);}}).listen(Number(process.env.PICPAC_PORT||5174),'127.0.0.1',()=>console.log('PicPac: http://127.0.0.1:'+(process.env.PICPAC_PORT||5174)));

