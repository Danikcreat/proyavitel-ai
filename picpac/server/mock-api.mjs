import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const digest=s=>crypto.createHash('sha256').update(s).digest('hex');
const now=()=>new Date().toISOString();
const stages=['accepted','moderation','production','ready','delivery','completed'];
export const stageNames={accepted:'Принят',moderation:'Модерация',production:'Производство',ready:'Готов',delivery:'Передан в доставку',completed:'Завершён'};
function fail(code,message,status=400){throw Object.assign(new Error(message),{status,code});}
function send(res,status,data){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(data));}
async function body(req){let size=0;const chunks=[];for await(const c of req){size+=c.length;if(size>1048576)fail('BODY_LIMIT','Запрос больше 1 МБ.',413);chunks.push(c);}try{return JSON.parse(Buffer.concat(chunks).toString()||'{}');}catch{fail('BAD_JSON','Некорректный JSON.');}}
export function calculateQuote(items,catalog,promoCode='',deliveryId='pickup'){
  if(!Array.isArray(items)||!items.length||items.length>100)fail('EMPTY_CART','Добавьте товары в корзину.');
  const normalized=items.map(item=>{
    const quantity=Number(item.quantity);if(!Number.isInteger(quantity)||quantity<1||quantity>99)fail('QUANTITY','Количество должно быть от 1 до 99.');
    let price;
    if(item.kind==='book'){
      const p=catalog.pricing.book;
      if(!catalog.templates.some(t=>t.id===item.template)||!(item.tariff in p.tariffs)||!(item.format in p.formats)||![20,24,30,40,60].includes(item.pages))fail('OPTIONS','Проверьте параметры фотокниги.');
      price=p.tariffs[item.tariff]+p.formats[item.format]+(catalog.templates.find(t=>t.id===item.template)?.extraPrice||0)+(item.pages-p.basePages)/2*p.extraSpread;
    }else if(item.kind==='prints'){
      const p=catalog.pricing.prints;
      if(!(item.size in p.sizes)||!(item.paper in p.papers)||!(item.frame in p.frames)||!(item.printType in p.types))fail('OPTIONS','Проверьте параметры печати.');
      if(!Array.isArray(item.copies)||!item.copies.length||item.copies.some(n=>!Number.isInteger(n)||n<1||n>99))fail('COPIES','Проверьте число отпечатков.');
      price=item.copies.reduce((a,b)=>a+b,0)*(p.sizes[item.size]+p.papers[item.paper]+p.frames[item.frame]+p.types[item.printType]);
    }else fail('PRODUCT','Неизвестный продукт.');
    return {...item,quantity,price};
  });
  const method=catalog.deliveryMethods.find(d=>d.id===deliveryId);if(!method)fail('DELIVERY','Выберите способ получения.');
  const subtotal=normalized.reduce((s,i)=>s+i.price*i.quantity,0);
  const promo=promoCode.trim().toUpperCase();if(promo&&!(promo in catalog.pricing.promos))fail('PROMO','Промокод не найден.');
  const discount=Math.round(subtotal*(catalog.pricing.promos[promo]||0)/100);
  return {items:normalized,subtotal,discount,delivery:method.fee,total:subtotal-discount+method.fee,currency:catalog.currency};
}
export function createMockApi({catalogFile,dataDir,localCrm=false,allowLan=false}){
  fs.mkdirSync(dataDir,{recursive:true});const file=path.join(dataDir,'state.json');
  let db=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):{users:[],sessions:[],orders:[],messages:[],counter:6404000};
  const save=()=>{const tmp=file+'.tmp';fs.writeFileSync(tmp,JSON.stringify(db,null,2));fs.renameSync(tmp,file);};
  const catalog=()=>JSON.parse(fs.readFileSync(catalogFile,'utf8'));
  function session(user){const token=crypto.randomBytes(32).toString('base64url');db.sessions.push({hash:digest(token),userId:user.id});save();return {token,user:{id:user.id,mode:user.mode,profile:user.profile}};}
  function userFor(req){const token=(req.headers.authorization||'').replace(/^Bearer /,'');const s=db.sessions.find(s=>s.hash===digest(token));const u=s&&db.users.find(u=>u.id===s.userId);if(!u)fail('AUTH','Войдите или продолжите как гость.',401);return u;}
  const owned=(user,id)=>{const o=db.orders.find(o=>o.id===id&&o.userId===user.id);if(!o)fail('NOT_FOUND','Заказ не найден.',404);return o;};
  const expose=o=>({...o,messages:db.messages.filter(m=>m.orderId===o.id&&m.userId===o.userId)});
  return async(req,res,url)=>{
    try{
      const p=url.pathname;
      const address=(req.socket?.remoteAddress||'').replace(/^::ffff:/,'');
      const loopback=['127.0.0.1','::1'].includes(address);
      const lan=/^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(address);
      const permitted=loopback||(allowLan&&lan);
      if(req.headers.origin&&p.startsWith('/api/crm/')&&req.headers.origin!==`http://${req.headers.host}`&&req.headers.origin!==`https://${req.headers.host}`)fail('ORIGIN','Запрос с другого сайта отклонён.',403);
      if(p.startsWith('/api/crm/')){
        if(!localCrm||!permitted)fail('NOT_FOUND','Маршрут недоступен.',404);
        if(p==='/api/crm/orders'&&req.method==='GET'){send(res,200,{orders:db.orders.map(expose).reverse()});return;}
        const photo=p.match(/^\/api\/crm\/photos\/([a-f0-9-]+)\/([a-f0-9-]+)$/i);
        if(photo){const image=path.join(dataDir,'photos',photo[1],photo[2]);if(!fs.existsSync(image))fail('NOT_FOUND','Фото не найдено.',404);const b=fs.readFileSync(image);res.writeHead(200,{'Content-Type':b[0]===137?'image/png':'image/jpeg','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(b);return;}
        const status=p.match(/^\/api\/crm\/orders\/(\d+)\/status$/);
        if(status&&req.method==='POST'){const b=await body(req);if(!stages.includes(b.status))fail('STATUS','Неизвестный статус.');const o=db.orders.find(o=>o.id===status[1]);if(!o)fail('NOT_FOUND','Заказ не найден.',404);if(o.status!==b.status){o.status=b.status;o.statusLabel=stageNames[b.status];o.timeline.push({status:b.status,label:o.statusLabel,at:now()});save();}send(res,200,{order:expose(o)});return;}
        fail('NOT_FOUND','Маршрут не найден.',404);
      }
      if(req.method==='GET'&&p==='/api/catalog'){send(res,200,catalog());return;}
      if(req.method==='POST'&&p==='/api/auth/guest'){
        const b=await body(req);if(!/^[\w-]{8,100}$/.test(b.clientId||''))fail('CLIENT_ID','Неверный идентификатор гостя.');
        let u=db.users.find(u=>u.clientId===b.clientId);if(!u){u={id:crypto.randomUUID(),clientId:b.clientId,mode:'guest',profile:{name:'',phone:'',email:''}};db.users.push(u);}send(res,200,session(u));return;
      }
      if(req.method==='POST'&&p==='/api/auth/login'){
        const b=await body(req);if(b.email!=='demo@picpac.test'||b.password!=='PicPac2026!')fail('CREDENTIALS','Тестовый вход: demo@picpac.test / PicPac2026!',401);
        let u=db.users.find(u=>u.mode==='test');if(!u){u={id:crypto.randomUUID(),mode:'test',profile:{name:'Анна',phone:'+375 29 000-00-00',email:'demo@picpac.test'}};db.users.push(u);}
        const oldHash=digest((req.headers.authorization||'').replace(/^Bearer /,''));const oldSession=db.sessions.find(s=>s.hash===oldHash);const old=db.users.find(x=>x.id===oldSession?.userId&&x.mode==='guest');
        if(old){if(localCrm){const src=path.join(dataDir,'photos',old.id),dst=path.join(dataDir,'photos',u.id);if(fs.existsSync(src)){fs.mkdirSync(dst,{recursive:true});for(const name of fs.readdirSync(src))fs.copyFileSync(path.join(src,name),path.join(dst,name));fs.rmSync(src,{recursive:true,force:true});}}db.orders.forEach(o=>{if(o.userId===old.id)o.userId=u.id;});db.messages.forEach(m=>{if(m.userId===old.id)m.userId=u.id;});db.sessions=db.sessions.filter(s=>s.userId!==old.id);db.users=db.users.filter(x=>x.id!==old.id);}
        send(res,200,session(u));return;
      }
      const u=userFor(req);
      const photoUpload=p.match(/^\/api\/photos\/([a-f0-9-]{36})$/i);
      if(photoUpload&&req.method==='PUT'){
        if(!localCrm||!permitted)fail('NOT_FOUND','Маршрут недоступен.',404);
        const chunks=[];let size=0;for await(const c of req){size+=c.length;if(size>12*1024*1024)fail('SIZE','Фото больше 12 МБ.',413);chunks.push(c);}
        const b=Buffer.concat(chunks);const png=b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));const jpeg=b[0]===255&&b[1]===216&&b[2]===255;
        if(!png&&!jpeg)fail('FORMAT','Нужен JPEG или PNG.');
        const dir=path.join(dataDir,'photos',u.id);fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,photoUpload[1]),b);send(res,200,{stored:true});return;
      }
      if(req.method==='DELETE'&&p==='/api/account'){
        if(localCrm)fs.rmSync(path.join(dataDir,'photos',u.id),{recursive:true,force:true});db.orders=db.orders.filter(o=>o.userId!==u.id);db.messages=db.messages.filter(m=>m.userId!==u.id);db.sessions=db.sessions.filter(s=>s.userId!==u.id);db.users=db.users.filter(x=>x.id!==u.id);save();send(res,200,{deleted:true});return;
      }
      if(req.method==='POST'&&p==='/api/auth/logout'){const hash=digest((req.headers.authorization||'').replace(/^Bearer /,''));db.sessions=db.sessions.filter(s=>s.hash!==hash);save();send(res,200,{loggedOut:true});return;}
      if(req.method==='GET'&&p==='/api/orders'){send(res,200,{orders:db.orders.filter(o=>o.userId===u.id).map(expose).reverse()});return;}
      if(req.method==='POST'&&p==='/api/orders'){
        const b=await body(req);const key=req.headers['idempotency-key'];if(typeof key!=='string'||!/^[\w-]{8,100}$/.test(key))fail('IDEMPOTENCY_KEY','Нужен постоянный ключ операции.');
        const hash=digest(JSON.stringify(b));const old=db.orders.find(o=>o.userId===u.id&&o.idempotencyKey===key);
        if(old){if(old.requestHash!==hash)fail('KEY_CONFLICT','Этот ключ уже использован для другого заказа.',409);send(res,200,{order:expose(old),duplicate:true});return;}
        if(!b.recipient?.name?.trim()||!/^\+?[0-9() -]{9,25}$/.test(b.recipient.phone||''))fail('RECIPIENT','Укажите имя и телефон получателя.');
        for(const item of b.items||[]){if(!item.photoIds?.length||!item.preflight?.reviewed||item.preflight.emptyAreas>0)fail('PREFLIGHT','Проверьте фотографии и пустые области проекта.');if(item.preflight.lowResolution&&!item.preflight.acceptedLowResolution)fail('QUALITY','Подтвердите предупреждение о разрешении фотографий.');}
        if(localCrm){for(const item of b.items||[])for(const id of item.photoIds||[]){if(!/^[a-f0-9-]{36}$/i.test(id)||!fs.existsSync(path.join(dataDir,'photos',u.id,id)))fail('PHOTO_MISSING','Не все фотографии переданы. Повторите отправку.');}}
        const quote=calculateQuote(b.items,catalog(),b.promoCode,b.deliveryId);
        if(b.expectedTotal!==quote.total)fail('PRICE_CHANGED','Цена изменилась. Обновите каталог и подтвердите сумму.',409);
        const date=now();const order={id:String(++db.counter),clientId:b.clientId,idempotencyKey:key,requestHash:hash,userId:u.id,title:b.title||'Новый заказ',...quote,address:b.address||'',recipient:b.recipient,deliveryId:b.deliveryId,status:'accepted',statusLabel:stageNames.accepted,timeline:[{status:'accepted',label:stageNames.accepted,at:date}],createdAt:date,source:'picpac',originalRequest:b,payment:{mode:'test',charged:0}};
        db.orders.push(order);u.profile=b.recipient;save();send(res,201,{order:expose(order),duplicate:false});return;
      }
      const orderMatch=p.match(/^\/api\/orders\/([\w-]+)(\/advance)?$/);
      if(orderMatch){const o=owned(u,orderMatch[1]);if(req.method==='GET'&&!orderMatch[2]){send(res,200,{order:expose(o)});return;}if(req.method==='POST'&&orderMatch[2]){const allowed=o.deliveryId==='studio'?stages.filter(s=>s!=='delivery'):stages;const next=allowed[Math.min(allowed.indexOf(o.status)+1,allowed.length-1)];if(next!==o.status){o.status=next;o.statusLabel=stageNames[next];o.timeline.push({status:next,label:stageNames[next],at:now()});save();}send(res,200,{order:expose(o)});return;}}
      if(req.method==='POST'&&p==='/api/support'){
        const b=await body(req);if((b.text||'').trim().length<10)fail('MESSAGE','Опишите вопрос хотя бы в 10 символах.');if(b.orderId)owned(u,b.orderId);
        const old=db.messages.find(m=>m.userId===u.id&&m.clientId===b.clientId);if(old){send(res,200,{message:old,duplicate:true});return;}
        const message={id:crypto.randomUUID(),clientId:b.clientId,userId:u.id,orderId:b.orderId||null,subject:b.subject||'Вопрос',text:b.text.trim(),createdAt:now(),status:'Принято mock-поддержкой'};db.messages.push(message);save();send(res,201,{message});return;
      }
      if(req.method==='GET'&&p==='/api/support'){send(res,200,{messages:db.messages.filter(m=>m.userId===u.id)});return;}
      send(res,404,{error:'NOT_FOUND',message:'Метод mock API не найден.'});
    }catch(error){send(res,error.status||500,{error:error.code||'SERVER_ERROR',message:error.status?error.message:'Ошибка сохранения на mock-сервере.'});}
  };
}

