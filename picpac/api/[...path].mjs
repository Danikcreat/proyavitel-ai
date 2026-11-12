import path from 'node:path';
import os from 'node:os';
import {createMockApi} from '../server/mock-api.mjs';
const api=createMockApi({catalogFile:path.join(process.cwd(),'public/mock/catalog.json'),dataDir:path.join(os.tmpdir(),'picpac-demo')});
export const config={api:{bodyParser:false}};
export default function handler(req,res){return api(req,res,new URL(req.url,'https://picpac.vercel.app'));}
