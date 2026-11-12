export const SESSION_KEY='picpac.session.v1';
export const QUEUE_KEY='picpac.order-queue.v1';
export const stageNames={queued:'Ожидает сети',accepted:'Принят',moderation:'Модерация',production:'Производство',ready:'Готов',delivery:'Передан в доставку',completed:'Завершён'};
export function preflight(project,metadata,limits={warningDpi:150,recommendedDpi:300}){
  const ids=project.photoIds||[];const errors=[],warnings=[];
  if(!ids.length)errors.push({code:'NO_PHOTOS',text:'В проекте нет фотографий. Добавьте фото с устройства или из тестовой галереи.'});
  const emptyAreas=project.kind==='book'&&!project.draft?.autoFill?Math.max(0,project.pages/2-ids.length):0;
  if(emptyAreas)errors.push({code:'EMPTY_AREAS',text:`Пустых разворотов: ${emptyAreas}. Добавьте фотографии или нажмите «Заполнить автоматически».`});
  for(const id of ids){const m=metadata[id];if(!m){errors.push({code:'MISSING_FILE',id,text:'Фотография недоступна на устройстве. Замените или удалите её.'});continue;}if(!['image/jpeg','image/png'].includes(m.type)){errors.push({code:'FORMAT',id,text:`${m.name}: формат не поддерживается. Нужен JPEG или PNG.`});continue;}
    const cm=project.kind==='prints'?(project.size||'10 × 15 см').match(/\d+/g).map(Number):[20,20];
    const a=cm[0]/2.54,b=cm[1]/2.54;const dpi=Math.round(Math.max(Math.min(m.width/a,m.height/b),Math.min(m.height/a,m.width/b)));
    if(dpi<limits.warningDpi)warnings.push({code:'LOW_RESOLUTION',id,dpi,text:`${m.name}: ${m.width} × ${m.height} px, около ${dpi} dpi. Для чёткой печати рекомендуется ${limits.recommendedDpi} dpi; снимок может быть размытым или пиксельным. Замените фото либо подтвердите печать с этим качеством.`});
  }
  return {errors,warnings,emptyAreas,lowResolution:warnings.length>0};
}
export function reorder(ids,from,to){if(from<0||to<0||from>=ids.length||to>=ids.length)return ids;const next=[...ids];const [id]=next.splice(from,1);next.splice(to,0,id);return next;}
export function createOperation(payload,uuid=crypto.randomUUID()) {return {key:uuid,payload:{...payload,clientId:uuid},createdAt:new Date().toISOString(),error:null};}
export function enqueue(queue,op){return queue.some(x=>x.key===op.key)?queue:[...queue,op];}
export function mergeOrders(current,incoming){const map=new Map(current.map(o=>[o.clientId||o.id,o]));for(const o of incoming)map.set(o.clientId||o.id,o);return [...map.values()].sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)));}
export function pendingOrder(op){return {id:op.key,clientId:op.key,title:op.payload.title,items:op.payload.items,total:op.payload.expectedTotal,address:op.payload.address,recipient:op.payload.recipient,status:'queued',statusLabel:stageNames.queued,timeline:[],createdAt:op.createdAt,pending:true,messages:[]};}

