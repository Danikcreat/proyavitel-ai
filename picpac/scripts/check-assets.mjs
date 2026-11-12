import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'scripts/asset-manifest.json'),'utf8'));
const failures=[];
for(const item of manifest){
 const file=path.join(root,item.path);
 if(!fs.existsSync(file)){failures.push(item.path+': missing');continue;}
 const bytes=fs.readFileSync(file);
 const sha=crypto.createHash('sha1').update(Buffer.from(`blob ${bytes.length}\0`)).update(bytes).digest('hex');
 if(bytes.length!==item.size||sha!==item.sha)failures.push(item.path+': size or hash mismatch');
}
if(failures.length){console.error(failures.join('\n'));process.exit(1);}
console.log(`Verified ${manifest.length} static files: sizes and Git blob hashes match.`);
