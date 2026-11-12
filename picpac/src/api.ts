import {SESSION_KEY,QUEUE_KEY,createOperation,enqueue} from './workflow.mjs';
export class ApiError extends Error{status:number;code:string;constructor(message:string,status:number,code:string){super(message);this.status=status;this.code=code;}}
export function getSession(){try{return JSON.parse(localStorage.getItem(SESSION_KEY)||'null');}catch{return null;}}
function saveSession(session:any){localStorage.setItem(SESSION_KEY,JSON.stringify(session));window.dispatchEvent(new Event('picpac-session'));return session;}
export async function request(url:string,options:RequestInit={}){const s=getSession();const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),10000);try{const r=await fetch(url,{...options,signal:controller.signal,headers:{'Content-Type':'application/json',...(s?.token?{Authorization:'Bearer '+s.token}:{}),...options.headers}});const data=await r.json();if(!r.ok)throw new ApiError(data.message||'Ошибка запроса',r.status,data.error);return data;}finally{clearTimeout(timer);}}
export async function guest(){const clientId=crypto.randomUUID();let s={clientId,mode:'guest',token:null,user:{mode:'guest',profile:{name:'',phone:'',email:''}}};try{s={...s,...await request('/api/auth/guest',{method:'POST',body:JSON.stringify({clientId})})};}catch(e){if(e instanceof ApiError)throw e;}return saveSession(s);}
export async function ensureSession(){let s=getSession();if(!s)s=await guest();if(!s.token){const data=await request('/api/auth/guest',{method:'POST',body:JSON.stringify({clientId:s.clientId})});s=saveSession({...s,...data});}return s;}
export async function login(email:string,password:string){const s=getSession();return saveSession({...s,...await request('/api/auth/login',{method:'POST',body:JSON.stringify({email,password})}),mode:'test'});}
export function clearSession(){localStorage.removeItem(SESSION_KEY);window.dispatchEvent(new Event('picpac-session'));}
export function readQueue(){try{return JSON.parse(localStorage.getItem(QUEUE_KEY)||'[]');}catch{return [];}}
export function saveQueue(queue:any[]){localStorage.setItem(QUEUE_KEY,JSON.stringify(queue));window.dispatchEvent(new Event('picpac-queue'));}
export function queueOrder(payload:any){const op=createOperation(payload);saveQueue(enqueue(readQueue(),op));return op;}
let inFlight:Promise<any>|null=null;
export function flushOrders(onOrder:(o:any)=>void){if(inFlight)return inFlight;inFlight=(async()=>{if(!navigator.onLine)return;for(const op of readQueue()){
  try{await ensureSession();const {order}=await request('/api/orders',{method:'POST',headers:{'Idempotency-Key':op.key},body:JSON.stringify(op.payload)});onOrder(order);saveQueue(readQueue().filter(x=>x.key!==op.key));}
  catch(e){const error=e as any;saveQueue(readQueue().map(x=>x.key===op.key?{...x,error:error instanceof ApiError?error.message:'Нет связи. Заказ сохранён, повторим с тем же ключом.'}:x));break;}
}})().finally(()=>{inFlight=null;});return inFlight;}

