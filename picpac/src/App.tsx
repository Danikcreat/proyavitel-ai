import React, {useEffect,useRef,useState} from 'react';
import Home from './screens/86-2422';
import Create from './screens/86-2514';
import Templates from './screens/86-2619';
import Template from './screens/86-2706';
import LoadingA from './screens/86-2839';
import LoadingB from './screens/86-2865';
import Editor from './screens/86-2891';
import Prints from './screens/86-2955';
import Cart from './screens/86-3026';
import Checkout from './screens/86-3108';
import Pickup from './screens/86-3163';
import MapScreen from './screens/86-3211';
import Profile from './screens/86-3272';
import Orders from './screens/86-3358';
import Notifications from './screens/86-3447';
import Review from './screens/86-3510';
import Support from './screens/86-3554';
import {STORAGE_KEY,loadState,templates,points,bookPrice,printPrice,totals,money,changeQuantity,deliveryPrice,getProduct} from './model.mjs';
import {storePhotos,readPhotos,removePhotos} from './photos';
import Track2 from './Track2';
import CatalogBrowser from './CatalogBrowser';
import HomeFeed from './HomeFeed';
import OptionsDropdown from './OptionsDropdown';
import MascotExperience,{LoadingExperience,celebrate} from './MascotExperience';
import HelpTip from './HelpTip';
import AlbumAssistant from './AlbumAssistant';

const screens={home:Home,create:Create,templates:Templates,template:Template,loading:LoadingA,loading2:LoadingB,editor:Editor,prints:Prints,cart:Cart,checkout:Checkout,pickup:Pickup,map:MapScreen,profile:Profile,orders:Orders,notifications:Notifications,review:Review,support:Support};
type Route=keyof typeof screens;
function route():Route {const r=location.hash.slice(1);return r in screens?r as Route:'home';}
const asset=(name:string)=>'/assets/'+name;
const initialPhotoKeys=['86:2977','86:2981','86:2985'];

function Modal({title,children,close}:{title:string,children:React.ReactNode,close:()=>void}) {
  const ref=useRef<HTMLDivElement>(null);
  useEffect(()=>{const old=document.activeElement as HTMLElement;ref.current?.focus();function key(e:KeyboardEvent){if(e.key==='Escape')close();if(e.key==='Tab'){const list=Array.from(ref.current?.querySelectorAll<HTMLElement>('button,input,select,textarea,[tabindex="0"]')||[]);const first=list[0],last=list[list.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}}document.addEventListener('keydown',key);return()=>{document.removeEventListener('keydown',key);old?.focus();};},[]);
  return <div className="modal-shade" onClick={close}><div role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} className="modal" ref={ref} onClick={e=>e.stopPropagation()}><span className="handle"/><div className="modal-title"><h2>{title}</h2><button className="close" onClick={close} aria-label="Закрыть">×</button></div>{children}</div></div>;
}
function Choice({label,value,values,onChange}:{label:string,value:string,values:string[],onChange:(v:string)=>void}){return <label className="field">{label}<select aria-label={label} value={value} onChange={e=>onChange(e.target.value)}>{values.map(v=><option key={v}>{v}</option>)}</select></label>;}
export default function App(){
  const [state,setState]=useState<any>(()=>loadState(localStorage));
  const [page,setPage]=useState<Route>(route);
  const [modal,setModal]=useState('');
  const [notice,setNotice]=useState('');
  const [inlineMenu,setInlineMenu]=useState<any>(null);
  useEffect(()=>setInlineMenu(null),[page]);
  const [scale,setScale]=useState(1);
  const [filter,setFilter]=useState({query:'',theme:'Все',saved:false});
  const [addressQuery,setAddressQuery]=useState('');
  const [orderFilter,setOrderFilter]=useState('Все');
  const [orderQuery,setOrderQuery]=useState('');
  const [rating,setRating]=useState(4);
  const [reviewText,setReviewText]=useState('');
  const [supportText,setSupportText]=useState('');
  const [supportSubject,setSupportSubject]=useState('Вопрос по заказу №6403839');
  const [progress,setProgress]=useState({done:0,total:0,phase:'preparing'});
  const [saveStatus,setSaveStatus]=useState('saved');const savedSignature=useRef<string|null>(null);const savedTimer=useRef<any>(null);
  const [photos,setPhotos]=useState<Record<string,any>>({});
  const [selectedPhoto,setSelectedPhoto]=useState(0);
  const [zoomMap,setZoomMap]=useState(1);
  const [undo,setUndo]=useState<any[]>([]),[redo,setRedo]=useState<any[]>([]);
  const [promoInput,setPromoInput]=useState('');
  const [orderDetail,setOrderDetail]=useState<any>(null);
  const track=useRef<any>(null);
  const feed=useRef<any>(null);const feedScroll=useRef(0);
  const fileInput=useRef<HTMLInputElement>(null);
  const filePurpose=useRef('book');
  const saveFailed=useRef(false);
  const draftPointer=useRef<{x:number,y:number,ox:number,oy:number}|null>(null);
  const update=(patch:any)=>setState((s:any)=>({...s,...patch}));
  const toast=(s:string)=>setNotice(s);
  const go=(r:Route)=>{setModal('');if(location.hash.slice(1)===r)setPage(r);else location.hash=r;};
  const back=()=>{if(['home','profile','cart'].includes(page))go('home');else if(['pickup','map'].includes(page))go('checkout');else if(['editor','template'].includes(page))go('templates');else if(['review','support'].includes(page))go('notifications');else go('home');};
  const selected=templates.find(t=>t.id===state.template)||templates[1];
  const deliveryFee=deliveryPrice(state.deliveryId||'pickup');
  const sum=totals(state.items,state.promo,page==='checkout'?deliveryFee:false);
  const printIds=state.printPhotoIds||[];
  const activePhotos=page==='prints'?printIds:state.photoIds;
  const printCount=(state.printCopies||[]).reduce((s:number,n:number)=>s+n,0);
  const printCost=printCount*printPrice(state.printSize,state.paper,state.frame,state.printType);
  const edit=(patch:any)=>{if(state.draft.aiPlan&&['layout','text','background'].some(k=>k in patch)){const plan=structuredClone(state.draft.aiPlan);const spread=plan.spreads[state.draft.page-1];if(spread){if('layout'in patch){spread.layout=patch.layout;spread.photos=spread.photos.slice(0,patch.layout==='Одно фото'?1:patch.layout==='Коллаж'?4:3);}if('text'in patch)spread.caption=patch.text;if('background'in patch)spread.background=patch.background;}patch={...patch,aiPlan:plan};}setUndo(v=>[...v,state.draft].slice(-30));setRedo([]);update({draft:{...state.draft,...patch}});};
  useEffect(()=>{function change(){setPage(route());setModal('');}window.addEventListener('hashchange',change);return()=>window.removeEventListener('hashchange',change);},[]);
  useEffect(()=>{function resize(){setScale(Math.min(1,(innerWidth<500?innerWidth:innerWidth-48)/390));}resize();window.addEventListener('resize',resize);return()=>window.removeEventListener('resize',resize);},[]);
  useEffect(()=>{const signature=JSON.stringify([state.template,state.tariff,state.pages,state.format,state.photoIds,state.printPhotoIds,state.printCopies,state.printSize,state.paper,state.frame,state.printType,state.draft]);try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));saveFailed.current=false;setSaveStatus('saved');if(savedSignature.current!==null&&savedSignature.current!==signature){clearTimeout(savedTimer.current);if(['editor','prints'].includes(page))savedTimer.current=setTimeout(()=>celebrate('Сохранено, мяу','Черновик на этом устройстве. Можно выдохнуть.'),650);}savedSignature.current=signature;}catch{clearTimeout(savedTimer.current);setSaveStatus('error');if(!saveFailed.current){setNotice('Не удалось сохранить изменения на устройстве. Проверьте свободное место.');saveFailed.current=true;}}},[state]);
  useEffect(()=>()=>clearTimeout(savedTimer.current),[]);
  useEffect(()=>{if(!notice)return;const t=setTimeout(()=>setNotice(''),4500);return()=>clearTimeout(t);},[notice]);
  useEffect(()=>{let cancelled=false;let urls:string[]=[];readPhotos([...new Set<string>([...state.photoIds,...(state.printPhotoIds||[]),...(state.reviewPhotoIds||[])])]).then(rows=>{const map={};for(const r of rows.filter(Boolean)){const url=URL.createObjectURL(r.blob);urls.push(url);map[r.id]={...r,url};}if(!cancelled)setPhotos(map);}).catch(()=>toast('Не удалось открыть локальные фотографии.'));return()=>{cancelled=true;urls.forEach(URL.revokeObjectURL);};},[JSON.stringify(state.photoIds),JSON.stringify(state.printPhotoIds),JSON.stringify(state.reviewPhotoIds)]);

  function chooseFiles(purpose:string){filePurpose.current=purpose;fileInput.current?.click();}
  async function upload(e:React.ChangeEvent<HTMLInputElement>){const files=Array.from(e.target.files||[]);e.target.value='';if(!files.length)return;if(files.length>40){toast('Выберите не больше 40 фотографий за один раз.');return;}const purpose=filePurpose.current;setModal('');if((purpose==='book'||purpose==='book-append')){setProgress({done:0,total:files.length,phase:'preparing'});setPage('loading');}try{const records=await storePhotos(files,p=>setProgress(p));setProgress({done:files.length,total:files.length,phase:'complete'});const ids=records.map(r=>r.id);setState((s:any)=>purpose==='prints'?{...s,printPhotoIds:[...(s.printPhotoIds||[]),...ids],printCopies:[...((s.printPhotoIds||[]).length?s.printCopies:[]),...ids.map(()=>1)]}:purpose==='review'?{...s,reviewPhotoIds:[...(s.reviewPhotoIds||[]),...ids]}:purpose==='replace'?{...s,photoIds:[...s.photoIds.slice(0,selectedPhoto),ids[0],...s.photoIds.slice(selectedPhoto+1)]}:{...s,photoIds:purpose==='book-append'?[...s.photoIds,...ids]:ids});if((purpose==='book'||purpose==='book-append')){setTimeout(()=>go('editor'),750);}else toast('Фотографии сохранены на устройстве.');}catch(err){if((purpose==='book'||purpose==='book-append'))go('template');toast(err instanceof Error?err.message:'Не удалось добавить фотографии.');}}
  function addBook(){track.current?.checkProject('book',(preflight:any)=>{const item={id:'book',kind:'book',title:selected.title,template:selected.id,tariff:state.tariff,pages:state.pages,format:state.format,photoIds:[...state.photoIds],draft:{...state.draft,autoFill:preflight.autoFill??state.draft.autoFill},price:bookPrice(state.tariff,state.pages,state.format,state.template),quantity:1,preflight};update({items:[...state.items.filter((i:any)=>i.id!=='book'),item]});go('cart');});}
  function addPrints(){track.current?.checkProject('prints',(preflight:any)=>{const item={id:'prints',kind:'prints',title:'Фотографии',price:printCost,quantity:1,count:printCount,copies:[...state.printCopies],photoIds:[...(state.printPhotoIds||[])],size:state.printSize,paper:state.paper,frame:state.frame,printType:state.printType,preflight};update({items:[...state.items.filter((i:any)=>i.id!=='prints'),item]});go('cart');});}
  const bind:Record<string,{action:()=>void,label?:string}>={};
  const changes:Record<string,any>={};
  const action=(id:string,fn:()=>void,label?:string)=>{bind['86:'+id]={action:fn,label};};
  const text=(id:string,value:React.ReactNode)=>{changes['86:'+id]={children:value};};
  const hidden=(id:string)=>{changes['86:'+id]={style:{display:'none'}};};
  const styled=(id:string,style:any)=>{changes['86:'+id]={...changes['86:'+id],style};};
  const input=(id:string,label:string,value:string,onChange:(v:string)=>void,placeholder?:string)=>{changes['86:'+id]={children:<input className="inline-input" aria-label={label} value={value} placeholder={placeholder} onChange={e=>onChange(e.target.value)}/>};};
  hidden('2922');hidden('3277');text('2896',saveStatus==='error'?'Не удалось сохранить':'✓ Сохранено');text('2960',saveStatus==='error'?'Не сохранено':'✓ Сохранено');
  if(page==='orders')['3377','3379','3381','3383','3443'].forEach(hidden);
  if(page==='support')['3572','3576','3587','3593'].forEach(hidden);
  if(page==='notifications')['3456','3457','3468','3495','3500','3507'].forEach(hidden);
  function toggleSaved(id=state.template){update({saved:state.saved.includes(id)?state.saved.filter((x:string)=>x!==id):[...state.saved,id]});toast(state.saved.includes(id)?'Удалено из избранного':'Сохранено в избранное');}
  const qty=(id:string,delta:number)=>update({items:changeQuantity(state.items,id,delta)});
  // Screen-specific bindings keep generated presentational components free of application state.
  action('2464',()=>{update({template:'summer'});go('template');});action('2475',()=>{setPromoInput('PIC15');setModal('promo');});action('2472',()=>toggleSaved('summer'));
  ['2428','2435','2443','2450'].forEach((id,i)=>action(id,()=>feed.current?.category(['news','ideas','reviews','sales'][i])));
  action('2462',()=>setModal('post'));action('2483',()=>setModal('reviews'));
  action('2595',()=>go('templates'));action('2599',()=>go('prints'));action('2590',()=>go('home'));action('2609',()=>go('home'));
  action('2620',()=>go('home'));action('2624',()=>setFilter(f=>({...f,saved:!f.saved})));
  action('2630',()=>setModal('filters'));
  input('2629','Найти шаблон',filter.query,v=>setFilter(f=>({...f,query:v})),'Найти шаблон');styled('2629',{width:265,height:25,top:9});
  ['2646','2649','2652','2655','2658'].forEach(id=>action(id,()=>setModal('filters')));
  ['2662','2665','2673','2681','2689','2697'].forEach((id,i)=>action(id,()=>{update({template:templates[i].id});go('template');},templates[i].title));
  ['2669','2677','2685','2693','2701'].forEach((id,i)=>action(id,()=>toggleSaved(templates[i+1].id),'Сохранить '+templates[i+1].title));
  if(page==='templates') {
    const matches=templates.filter(t=>(!filter.saved||state.saved.includes(t.id))&&(filter.theme==='Все'||t.theme===filter.theme)&&t.title.toLowerCase().includes(filter.query.toLowerCase()));
    if(filter.query||filter.saved||filter.theme!=='Все'){
      ['2662','2665','2673','2681','2689','2697'].forEach(hidden);
      changes['86:2619']={append:<div className="filtered-grid">{matches.length?matches.map(t=><button key={t.id} onClick={()=>{update({template:t.id});go('template');}}><img src={asset(t.image)} alt=""/><b>{t.title}</b></button>):<div className="empty-state"><h3>Шаблоны не найдены</h3><p>Попробуйте другой запрос или сбросьте фильтры.</p><button onClick={()=>setFilter({query:'',theme:'Все',saved:false})}>Сбросить фильтры</button></div>}</div>};
    }
  }
  action('2803',()=>go('templates'));action('2809',()=>go('templates'));action('2837',()=>setModal('upload'));
  text('2834','Получение через '+getProduct('book').leadTime);text('2835','Ориентировочный срок из тестового каталога');text('2807',selected.title);text('2808','Шаблон фотокниги · '+state.tariff);text('2814',money(bookPrice(state.tariff,state.pages,state.format,state.template)));text('2812',state.tariff+' · '+state.format);text('2813',state.pages+' страниц · '+state.pages/2+' разворотов');text('2831',state.pages+' страниц в этом шаблоне');text('2838','Выбрать шаблон · '+money(bookPrice(state.tariff,state.pages,state.format,state.template)));
  if(state.template!=='summer')changes['86:2816']={children:<img className="photo-fill" src={asset(selected.image)} alt={selected.title}/>};
  action('2897',addBook);action('2910',()=>chooseFiles('replace'));action('2899',()=>{if(undo.length){setRedo(v=>[state.draft,...v]);update({draft:undo.at(-1)});setUndo(v=>v.slice(0,-1));}},'Отменить');
  action('2901',()=>{if(redo.length){setUndo(v=>[...v,state.draft]);update({draft:redo[0]});setRedo(v=>v.slice(1));}},'Повторить');
  action('2915',()=>edit({page:Math.max(1,state.draft.page-1)}),'Предыдущий разворот');action('2917',()=>edit({page:Math.min(state.pages/2,state.draft.page+1)}),'Следующий разворот');
  ['2919','2920','2921'].forEach((id,i)=>action(id,()=>edit({page:i+1}),'Разворот '+(i+1)));
  text('2895',selected.title);text('2914','Разворот '+state.draft.page+' из '+state.pages/2);text('2948',state.tariff+' · базовые 20 страниц / 10 разворотов');text('2949',money(bookPrice(state.tariff,20,state.format,state.template)));text('2950','Доп. развороты · '+Math.max(0,(state.pages-20)/2)+' шт.');text('2951','+ '+money(bookPrice(state.tariff,state.pages,state.format,state.template)-bookPrice(state.tariff,20,state.format,state.template)));text('2953',money(bookPrice(state.tariff,state.pages,state.format,state.template)));
  ['2923','2925'].forEach(id=>action(id,()=>track.current?.photos(),'Фото'));['2926','2928'].forEach(id=>action(id,()=>setModal('layout'),'Макет'));['2929','2930'].forEach(id=>action(id,()=>setModal('text'),'Текст'));['2931','2932'].forEach(id=>action(id,()=>setModal('background'),'Фон'));
  if(state.photoIds.length&&photos[state.photoIds[selectedPhoto%state.photoIds.length]])changes['86:2905']={children:<img className="photo-fill draggable-photo" alt="Выбранная фотография" src={photos[state.photoIds[selectedPhoto%state.photoIds.length]].url} style={{transform:`translate(${state.draft.offsetX}px,${state.draft.offsetY}px) scale(${state.draft.zoom})`}} onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);draftPointer.current={x:e.clientX,y:e.clientY,ox:state.draft.offsetX,oy:state.draft.offsetY};}} onPointerUp={()=>{draftPointer.current=null;}} onPointerMove={e=>{if(draftPointer.current)update({draft:{...state.draft,offsetX:Math.max(-70,Math.min(70,draftPointer.current.ox+(e.clientX-draftPointer.current.x)/scale)),offsetY:Math.max(-70,Math.min(70,draftPointer.current.oy+(e.clientY-draftPointer.current.y)/scale))}});}}/>};
  if(state.draft.text!=='Наше маленькое лето'||state.draft.background!=='#f5eee4')changes['86:2904']={append:<div className="editor-caption" style={{background:state.draft.background}}>{state.draft.text}</div>};
  if(state.draft.layout!=='Классический'){
    const ids=state.photoIds.filter((id:string)=>photos[id]);
    changes['86:2904']={children:<div className={'spread-layout '+(state.draft.layout==='Коллаж'?'collage':'single')} style={{background:state.draft.background}}>{(ids.length?ids:[null]).slice(0,state.draft.layout==='Коллаж'?4:1).map((id:string,i:number)=><img key={id||i} src={id?photos[id].url:asset('63b7d.png')} alt="Фото разворота"/>)}<span>{state.draft.text}</span></div>};hidden('2905');
  }
  action('2972',()=>update({printCopies:state.printCopies.map((n:number,i:number)=>i===selectedPhoto?Math.max(1,n-1):n)}),'Уменьшить число копий');action('2975',()=>update({printCopies:state.printCopies.map((n:number,i:number)=>i===selectedPhoto?Math.min(99,n+1):n)}),'Увеличить число копий');
  text('2974',state.printCopies[selectedPhoto]||1);action('2989',()=>chooseFiles('prints'));action('2995',addPrints);action('2967',()=>setModal('crop'));
  action('3011',()=>update({printType:'Фотохимическая'}));action('3014',()=>update({printType:'Цифровая'}));
  styled('3011',{background:state.printType==='Фотохимическая'?'#e9d4f3':'#fffdfc',borderColor:state.printType==='Фотохимическая'?'#ff9fa0':'#e0d6d1'});styled('3014',{background:state.printType==='Цифровая'?'#e9d4f3':'#fffdfc',borderColor:state.printType==='Цифровая'?'#ff9fa0':'#e0d6d1'});
  [{id:'3017',field:'printSize',title:'Размер фото',values:['10 × 15 см','15 × 20 см','20 × 30 см']},{id:'3020',field:'paper',title:'Бумага',values:['Матовая','Глянцевая']},{id:'3023',field:'frame',title:'Рамка',values:['Без рамки','Белая рамка']}].forEach(config=>action(config.id,()=>{setNotice('');setInlineMenu(inlineMenu?.id==='86:'+config.id?null:{...config,id:'86:'+config.id});},config.title));text('3018',state.printSize);text('3021',state.paper);text('3024',state.frame);
  text('2993',`${state.printCopies.length} фото · ${printCount} отпечатка`);text('2994',money(printCost));
  initialPhotoKeys.forEach((id,i)=>{action(id.split(':')[1],()=>setSelectedPhoto(i),'Выбрать фотографию '+(i+1));if(i>=state.printCopies.length)changes[id]={style:{display:'none'}};else styled(id.split(':')[1],{outline:i===selectedPhoto?'2px solid #ff9fa0':'none'});});
  ['2978','2982','2986'].forEach((id,i)=>{action(id,async()=>{if(printIds[i])await removePhotos([printIds[i]]);update({printCopies:state.printCopies.filter((_:any,j:number)=>i!==j),printPhotoIds:printIds.filter((_:any,j:number)=>i!==j)});setSelectedPhoto(0);},'Удалить фотографию '+(i+1));if(i>=state.printCopies.length)hidden(id);});
  if(printIds.length){changes['86:2961']={children:photos[printIds[selectedPhoto]]?<img className="photo-fill" src={photos[printIds[selectedPhoto]].url} alt="Кадр фотографии" style={{transform:`scale(${state.printZoom||1})`}}/>:null};initialPhotoKeys.forEach((id,i)=>{if(printIds[i]&&photos[printIds[i]])changes[id]={children:<img className="photo-fill" src={photos[printIds[i]].url} alt={photos[printIds[i]].name}/>,style:{outline:i===selectedPhoto?'2px solid #ff9fa0':'none'}};});}
  if(state.printCopies.length>3)changes['86:2955']={append:<button className="more-photos" onClick={()=>setModal('photos')}>Все фото ({state.printCopies.length}) →</button>};
  action('3033',()=>update({items:state.items.filter((i:any)=>i.id!=='book')}),'Удалить фотокнигу');action('3049',()=>update({items:state.items.filter((i:any)=>i.id!=='prints')}),'Удалить фотографии');
  action('3035',()=>go('editor'));action('3037',()=>go('editor'));action('3039',()=>qty('book',-1),'Меньше фотокниг');action('3042',()=>qty('book',1),'Больше фотокниг');action('3052',()=>qty('prints',-1),'Меньше наборов фото');action('3055',()=>qty('prints',1),'Больше наборов фото');
  const book=state.items.find((i:any)=>i.id==='book'),prints=state.items.find((i:any)=>i.id==='prints');
  if(!book)hidden('3028');else {text('3030',book.title);text('3032',money(book.price));text('3041',book.quantity);if(book.template!=='summer')changes['86:3029']={children:<img className="photo-fill" src={asset((templates.find(t=>t.id===book.template)||templates[1]).image)} alt={book.title}/>};}
  if(!prints)hidden('3044');else{text('3046','Фотографии');text('3047',`${prints.size} · ${prints.count} шт. · ${state.printType.toLowerCase()}`);text('3048',money(prints.price));text('3054',prints.quantity);}
  action('3057',()=>setModal('promo'));text('3060',state.promo?'PIC15 · скидка 15%':'Промокод');text('3065',money(sum.subtotal-sum.discount));text('3070',money(sum.total));
  input('3087','Название заказа',state.orderName,v=>update({orderName:v}),'Моё лето');action('3071',()=>state.items.length?track.current?.checkout():toast('Корзина пуста. Добавьте фотокнигу или фотографии.'));
  if(!state.items.length)changes['86:3026']={append:<div className="empty-cart"><h2>История начинается с одного кадра</h2><p>Выберите фото для книги или печати. Сумму покажем до подтверждения.</p><button onClick={()=>go('create')}>Создать первый заказ</button></div>};
  action('3130',()=>setModal('order-name'));action('3131',()=>setModal('order-name'));action('3138',()=>setModal('recipient'));action('3142',()=>track.current?.delivery());action('3160',()=>track.current?.preview());action('3161',()=>track.current?.preview());
  text('3130',state.orderName||'Без названия');text('3136',state.profile.name);text('3137',state.profile.phone);text('3143','Минск · '+points[state.point].address);text('3144','Тестовый способ получения · '+money(deliveryFee));text('3156',money(deliveryFee));text('3151','● Тестовая оплата · без списания');text('3143',state.deliveryId==='courier'?(state.deliveryAddress||'Укажите адрес курьера'):state.deliveryId==='studio'?'Самовывоз из тестовой студии':'Минск · '+points[state.point].address);text('3153',`Товары · ${state.items.length} позиции`);text('3154',money(sum.subtotal-sum.discount));text('3158',money(sum.total));text('3161','Перейти к оплате · '+money(sum.total));
  for(const [id,i]of [['3192',0],['3197',1],['3202',2]] as const){action(id,()=>update({point:i}));styled(id,{background:state.point===i?'#ecdcf4':'#fffcf9',display:points[i].address.toLowerCase().includes(addressQuery.toLowerCase().replace('минск','').trim())?'block':'none'});}
  input('3181','Найти пункт выдачи',addressQuery,setAddressQuery,'Минск, улица или адрес');input('3229','Найти пункт выдачи',addressQuery,setAddressQuery,'Минск, улица или адрес');
  styled('3181',{background:'#fffcf9',borderRadius:16});styled('3229',{background:'#fffcf9',borderRadius:16});
  action('3188',()=>go('map'),'На карте');action('3234',()=>go('pickup'),'Список');action('3207',()=>go('checkout'),'Выбрать этот пункт');action('3268',()=>go('checkout'),'Выбрать этот пункт');
  ['3251','3253','3255'].forEach((id,i)=>{action(id,()=>update({point:i}),'Пункт '+(i+1));styled(id,{background:state.point===i?'#232323':'#ecdcf4',color:state.point===i?'white':'#232323'});});
  text('3264','● '+points[state.point].address);text('3265',points[state.point].hours+' · '+points[state.point].distance+' км от вас');text('3210','Минск · '+points[state.point].address);action('3258',()=>setZoomMap(Math.min(1.5,zoomMap+.1)),'Увеличить карту');action('3259',()=>setZoomMap(Math.max(.8,zoomMap-.1)),'Уменьшить карту');styled('3237',{zoom:zoomMap});
  action('3274',()=>setModal('settings'));action('3348',()=>setModal('recipient'));action('3276',()=>go('orders'));action('3277',()=>{setOrderDetail({title:state.orderName||'Моё лето',status:'В печати',id:'6403839'});setModal('order');});action('3297',()=>setModal('designs'));action('3305',()=>go('support'));action('3311',()=>setModal('logout'));
  text('3346',state.profile.name||'Гость');text('3354',state.profile.phone);text('3357',state.profile.email);text('3303','1 проект');
  action('3377',()=>setOrderFilter('Все'));action('3379',()=>setOrderFilter('В работе'));action('3381',()=>setOrderFilter('Завершённые'));input('3446','Найти заказ',orderQuery,setOrderQuery,'Найти заказ');styled('3446',{width:260,height:25,top:9});
  ['3386','3416','3425','3435'].forEach((id,i)=>{const names=['Моё лето','Тёплые моменты','Наше путешествие','Семейный альбом'];const statuses=['В печати','Готово','Передан в доставку','Получен'];action(id,()=>{setOrderDetail({title:names[i],status:statuses[i],id:['6403839','6403805','6403712','6403520'][i]});setModal('order');});if((orderFilter==='В работе'&&i===3)||(orderFilter==='Завершённые'&&i!==3)||!names[i].toLowerCase().includes(orderQuery.toLowerCase()))hidden(id);});
  if(state.orders.length)changes['86:3383']={append:<div className="local-orders">{state.orders.map((o:any)=><button key={o.id} onClick={()=>{setOrderDetail(o);setModal('order');}}><b>{o.title}</b><span>№{o.id} · {o.status}</span><b>{money(o.total)}</b></button>)}</div>};
  action('3457',()=>go('orders'));action('3505',()=>go('review'));action('3508',()=>go('support'));action('3507',()=>go('support'));
  ['3474','3480'].forEach((id,i)=>{const key=i?'news':'orders';action(id,()=>update({settings:{...state.settings,[key]:!state.settings[key]}}),i?'Новости и акции':'Статусы заказов');styled(id,{background:state.settings[key]?'#ff9fa0':'#d6d1ce'});styled(i?'3481':'3475',{left:state.settings[key]?'24.63px':'4px'});});
  action('3452',()=>toast('Показаны все уведомления.'));action('3454',()=>go('orders'));
  ['3538','3539','3540','3541','3542'].forEach((id,i)=>{text(id,i<rating?'★':'☆');action(id,()=>setRating(i+1),'Оценка '+(i+1));});text('3536',rating+' из 5 · '+['','плохо','не очень','нормально','хорошо','отлично'][rating]);
  changes['86:3545']={children:<textarea className="inline-input" aria-label="Текст отзыва" value={reviewText} placeholder="Расскажите о качестве печати, упаковке и доставке — это поможет другим определиться с заказом." onChange={e=>setReviewText(e.target.value)}/>};hidden('3546');action('3548',()=>chooseFiles('review'));
  action('3550',()=>{if(reviewText.trim().length<10){toast('Напишите хотя бы 10 символов об опыте заказа.');return;}update({reviews:[...state.reviews,{id:crypto.randomUUID(),rating,text:reviewText.trim(),photos:state.reviewPhotoIds||[],createdAt:new Date().toISOString()}]});setReviewText('');setModal('review-sent');},'Отправить отзыв');
  input('3589','Тема обращения',supportSubject,setSupportSubject);hidden('3590');changes['86:3591']={children:<textarea className="inline-input" aria-label="Сообщение в поддержку" placeholder="Опишите, чем мы можем помочь…" value={supportText} onChange={e=>setSupportText(e.target.value)}/>};hidden('3592');
  ['3578','3581','3584'].forEach((id,i)=>action(id,()=>setSupportSubject(['Написать в поддержку','Проблема с заказом','Вопрос о печати и доставке'][i])));
  action('3593',()=>{if(supportText.trim().length<10){toast('Опишите вопрос подробнее — хотя бы 10 символов.');return;}update({messages:[...state.messages,{id:crypto.randomUUID(),subject:supportSubject,text:supportText.trim(),createdAt:new Date().toISOString()}]});setSupportText('');setModal('support-sent');},'Отправить сообщение');
  // Reconcile the generated visual tree with real controls and current domain values.
  function ui(element:React.ReactElement):React.ReactNode {
    function visit(node:React.ReactNode):React.ReactNode {
      if(!React.isValidElement(node))return node;
      const el=node as React.ReactElement<any>; const p=el.props; const id=p['data-node-id']; const name=p['data-name']||'';
      const change=changes[id]||{};
      let a=bind[id];
      if(!a){if(name==='Назад')a={action:back};else if(name==='Аватар Анны')a={action:()=>go('profile'),label:'Профиль'};else if(name==='bell')a={action:()=>go('notifications'),label:'Уведомления'};else if(name==='Создать')a={action:()=>go('create')};else if(name==='home')a={action:()=>go('home'),label:'Главная'};}
      // Unnamed cart artwork is kept intact; its enclosing link receives the interaction.
      if(el.type==='a'&&!a&&React.Children.toArray(p.children).some((c:any)=>c?.props?.children?.props?.src?.includes?.('a3091')||c?.props?.src?.includes?.('a3091')))a={action:()=>go('cart'),label:'Корзина'};
      const extra:any={style:{...p.style,...change.style}};
      if(['86:3017','86:3020','86:3023'].includes(id)){extra['aria-haspopup']='listbox';extra['aria-expanded']=inlineMenu?.id===id;}
      if(a){extra.role='button';extra.tabIndex=0;extra['aria-label']=a.label||name||undefined;extra.onClick=(e:React.MouseEvent)=>{e.preventDefault();e.stopPropagation();a.action();};extra.onKeyDown=(e:React.KeyboardEvent)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();a.action();}};extra.className=(p.className||'')+' interactive';}
      if(id==='86:2619'&&page==='templates'){
        const header=new Set(['86:2620','86:2622','86:2623','86:2632']);
        const kept=React.Children.toArray(p.children).filter((c:any)=>header.has(c?.props?.['data-node-id']));
        return React.cloneElement(el,extra,<>{kept.map(visit)}<CatalogBrowser templates={templates} state={state} update={update} filter={filter} setFilter={setFilter} onOpen={(t:any)=>{update({template:t.id,pages:t.chosenPages});go('template');}} onSave={toggleSaved}/></>);
      }
      if(id==='86:2422'&&page==='home'){
        const originals=React.Children.toArray(p.children) as React.ReactElement<any>[];
        const node=(n:string)=>originals.find(c=>c?.props?.['data-node-id']===n);
        const headers=['86:2423','86:2424','86:2425','86:2485'].map(node).filter(Boolean);
        const navigation=['86:2497','86:2498','86:2499'].map(node).filter(Boolean);
        return React.cloneElement(el,extra,<>{headers.map(visit)}<HomeFeed ref={feed} categories={visit(node('86:2427'))} hero={visit(node('86:2459'))} promo={visit(node('86:2475'))} review={visit(node('86:2479'))} templates={templates} state={state} initialScroll={feedScroll.current} onScroll={(top:number)=>{feedScroll.current=top;}} onOpen={(t:any)=>{if(!t){go('editor');return;}update({template:t.id,pages:Math.min(t.maxPages||60,Math.max(state.pages,t.minPages||20))});go('template');}} onPrints={()=>go('prints')} onSave={toggleSaved}/>{navigation.map(visit)}</>);
      }
      let children=change.children!==undefined?change.children:React.Children.map(p.children,visit);
      if(change.append)children=<>{children}{change.append}</>;
      if(page.startsWith('loading')&&typeof children==='string'){if(/8 из 12/.test(children))children=progress.done+' из '+progress.total+' фото';if(children.trim()==='67%')children=Math.round(progress.total?progress.done/progress.total*100:0)+'%';}
      if(el.type==='img'&&p.src){extra.draggable=false;extra.loading='eager';}
      if(['input','img','br','hr'].includes(el.type as string))return React.cloneElement(el,extra);
      return React.cloneElement(el,extra,children);
    }
    return visit(element);
  }
  if(state.photoIds.length){
    ['2919','2920','2921'].forEach(hidden);
    const current=state.photoIds[(state.draft.page-1)%state.photoIds.length];
    const aiSpread=state.draft.aiPlan?.spreads?.[state.draft.page-1];
    const upcoming=aiSpread?aiSpread.photos.map((n:number)=>state.photoIds[n-1]).filter((id:string)=>photos[id]):[0,1,2,3].map(n=>state.photoIds[(state.draft.page-1+n)%state.photoIds.length]).filter(id=>photos[id]);
    changes['86:2904']={children:<div className={'actual-spread '+(state.draft.layout==='Одно фото'?'one':state.draft.layout==='Коллаж'?'collage':'classic')} style={{background:state.draft.background}}>{upcoming.slice(0,state.draft.layout==='Одно фото'?1:state.draft.layout==='Коллаж'?4:3).map((id:string,i:number)=><img key={i} src={photos[id]?.url} alt={'Фото '+(i+1)+' разворота'}/>)}<span>{state.draft.text}</span></div>};
    hidden('2905');
  }
  const aiSpread=state.draft.aiPlan?.spreads?.[state.draft.page-1];
  if(aiSpread&&state.photoIds.length){
    const ids=aiSpread.photos.map((n:number)=>state.photoIds[n-1]).filter((id:string)=>photos[id]);
    changes['86:2904']={children:<div className={'actual-spread '+(aiSpread.layout==='Одно фото'?'one':aiSpread.layout==='Коллаж'?'collage':'classic')} style={{background:aiSpread.background}}>{ids.map((id:string,i:number)=><img key={i} src={photos[id].url} alt={'Фото '+(i+1)+' разворота'}/>)}<span>{aiSpread.caption}</span></div>};
    text('2895',state.draft.aiPlan.title);
  }
  const Screen=screens[page];
  const close=()=>setModal('');
  return <><div className="desktop-brand"><img src={asset('1308e.png')} alt="PicPac"/><p>Моменты, которые рядом.</p><span>Фотокниги и фотопечать</span></div><main className="device-shell" style={{width:390*scale,height:844*scale}}><div className="device" style={{transform:`scale(${scale})`}} data-screen={page}>
    {['loading','loading2'].includes(page)?<LoadingExperience progress={progress}/>:<Screen ui={ui}/>}
    <Track2 ref={track} state={state} setState={setState} page={page} go={go} photos={photos} closeOriginal={()=>{setModal('');setNotice('');}} chooseFiles={chooseFiles} importFiles={async(files:File[],purpose:string)=>{filePurpose.current=purpose;await upload({target:{files,value:''}} as any);}}/>

    {['home','create','cart','profile'].includes(page)&&<button className="cart-hit" aria-label="Корзина" onClick={()=>go('cart')}/>}
    {page==='editor'&&state.photoIds.length>0&&<div className="project-filmstrip">{state.photoIds.slice(0,state.pages/2).map((id:string,i:number)=><button key={id} aria-label={'Разворот '+(i+1)} className={state.draft.page===i+1?'selected':''} onClick={()=>edit({page:i+1})}><img src={photos[id]?.url} alt=""/><small>{i+1}</small></button>)}</div>}
    {page==='editor'&&<div className="editor-tools"><button aria-label="Фото" onClick={()=>track.current?.photos()}><img src={asset('40788.svg')} alt=""/><span>Фото</span></button><button aria-label="Макет" onClick={()=>setModal('layout')}><img src={asset('0973d.svg')} alt=""/><span>Макет</span></button><button aria-label="Текст" onClick={()=>setModal('text')}>T<span>Текст</span></button><button aria-label="Фон" onClick={()=>setModal('background')}>▧<span>Фон</span></button></div>}
    {false&&page==='profile'&&!state.loggedIn&&<div className="signed-out"><h2>Ваши моменты сохранены</h2><p>Вы вышли из локального профиля.</p><button className="primary" onClick={()=>update({loggedIn:true})}>Вернуться в локальный профиль</button></div>}
    {inlineMenu&&page==='prints'&&<OptionsDropdown config={inlineMenu} value={state[inlineMenu.field]} onSelect={(v:string)=>update({[inlineMenu.field]:v})} close={()=>setInlineMenu(null)}/>}
    {page==='editor'&&<div className="editor-save-help"><HelpTip align="end" label="Где хранится черновик?" text="На этом устройстве, в браузере. Можно закрыть вкладку и продолжить позже. Очистка данных сайта удалит локальные фото и черновики."/></div>}
    <MascotExperience page={page}/>
    {notice&&<div className="toast" role="status" onClick={()=>setNotice('')}>{notice}</div>}
    <input type="file" accept="image/jpeg,image/png" multiple ref={fileInput} onChange={upload} className="file-picker" aria-label="Загрузить фотографии"/>
    {modal&&<Modal title={{upload:'Добавим ваши фотографии',filters:'Подберите фотокнигу',promo:'Промокод',recipient:'Получатель',settings:'Настройки',designs:'Мои дизайны',layout:'Макет фотокниги',text:'Текст на странице',background:'Фон страницы',crop:'Кадрирование',photos:'Ваши фотографии','print-options':'Настройки печати',payment:'Оформление локального заказа',order:'Заказ №'+orderDetail?.id,'order-created':'Заказ сохранён','order-name':'Название заказа','review-sent':'Спасибо за отзыв!','support-sent':'Обращение сохранено',logout:'Выйти из профиля?',ideas:'Идеи для вашей книги',reviews:'Отзывы PicPac',post:'Новый шаблон'}[modal]||'PicPac'} close={close}>
      {modal==='upload'&&<><p>Добавьте любимые кадры — порядок можно поменять позже.</p><p className="quiet-hint">JPEG/PNG · до 12 МБ на фото · до 40 за раз. Оригиналы сохраняются на этом устройстве.</p><button className="primary" onClick={()=>chooseFiles('book')}>Выбрать фотографии</button><button className="secondary" onClick={()=>{setModal('');track.current?.gallery();}}>Выбрать из тестовой галереи</button><button className="secondary" onClick={()=>go('editor')}>Посмотреть редактор</button></>}
      {modal==='filters'&&<><Choice label="Тариф" value={state.tariff} values={['Classic','Lite','Premium']} onChange={v=>update({tariff:v})}/><Choice label="Формат" value={state.format} values={['20 × 20 см','15 × 15 см','20 × 30 см']} onChange={v=>update({format:v})}/><Choice label="Тема" value={filter.theme} values={['Все','Путешествия','Свадьба','Семья','Природа']} onChange={v=>setFilter(f=>({...f,theme:v}))}/><Choice label="Количество страниц" value={String(state.pages)} values={['20','24','30','40','60']} onChange={v=>update({pages:+v})}/><button className="primary" onClick={close}>Показать шаблоны</button><button className="secondary" onClick={()=>{setFilter({query:'',theme:'Все',saved:false});close();}}>Сбросить фильтры</button></>}
      {modal==='promo'&&<form onSubmit={e=>{e.preventDefault();if(promoInput.trim().toUpperCase()!=='PIC15'){toast('Промокод не найден. Для первого заказа используйте PIC15.');return;}update({promo:true});close();toast('Скидка 15% применена.');}}><p>−15% на первый заказ с кодом PIC15.</p><label className="field">Промокод<input value={promoInput} onChange={e=>setPromoInput(e.target.value)} autoCapitalize="characters"/></label><button className="primary">Применить</button>{state.promo&&<button type="button" className="secondary" onClick={()=>{update({promo:false});close();}}>Убрать промокод</button>}</form>}
      {modal==='recipient'&&<form onSubmit={e=>{e.preventDefault();const f=new FormData(e.currentTarget);update({profile:{name:f.get('name'),phone:f.get('phone'),email:f.get('email')}});close();toast('Данные сохранены.');}}><label className="field">Имя<input name="name" defaultValue={state.profile.name} required minLength={2} maxLength={80}/></label><label className="field">Телефон<input name="phone" type="tel" defaultValue={state.profile.phone} required pattern="[+0-9() -]{9,25}"/></label><label className="field">Электронная почта<input type="email" name="email" defaultValue={state.profile.email} required/></label><button className="primary">Сохранить</button></form>}
      {modal==='order-name'&&<><label className="field">Видно только вам<input value={state.orderName} onChange={e=>update({orderName:e.target.value})} maxLength={80}/></label><button className="primary" onClick={close}>Сохранить</button></>}
      {modal==='print-options'&&<><Choice label="Размер фотографии" value={state.printSize} values={['10 × 15 см','15 × 20 см','20 × 30 см']} onChange={v=>update({printSize:v})}/><Choice label="Бумага" value={state.paper} values={['Матовая','Глянцевая']} onChange={v=>update({paper:v})}/><Choice label="Рамка" value={state.frame} values={['Без рамки','Белая рамка']} onChange={v=>update({frame:v})}/><p>Стоимость одного отпечатка: {money(printPrice(state.printSize,state.paper,state.frame,state.printType))}</p><button className="primary" onClick={close}>Готово</button></>}
      {modal==='layout'&&<><AlbumAssistant pages={state.pages} photoIds={state.photoIds} onApply={plan=>{edit({aiPlan:plan,page:1,autoFill:true});setModal('');}}/><Choice label="Расположение фотографий" value={state.draft.layout} values={['Классический','Одно фото','Коллаж']} onChange={v=>edit({layout:v})}/><Choice label="Количество страниц" value={String(state.pages)} values={['20','24','30','40','60']} onChange={v=>update({pages:+v})}/><p>{money(bookPrice(state.tariff,state.pages,state.format,state.template))} за экземпляр</p><button className="primary" onClick={close}>Применить</button></>}
      {modal==='text'&&<><label className="field">Подпись<textarea aria-label="Подпись" value={state.draft.text} maxLength={100} onChange={e=>edit({text:e.target.value})}/></label><button className="primary" onClick={close}>Готово</button></>}
      {modal==='background'&&<><p>Выберите оттенок бумаги</p><div className="swatches">{['#f5eee4','#e9d4f3','#fce8b8','#ffced0','#d9e4d3','#fff'].map(c=><button key={c} aria-label={'Цвет '+c} style={{background:c,outline:state.draft.background===c?'3px solid #232323':'none'}} onClick={()=>edit({background:c})}/>)}</div><button className="primary" onClick={close}>Применить</button></>}
      {modal==='crop'&&<><p>Масштабируйте фотографию перед печатью.</p><input aria-label="Масштаб фотографии" type="range" min="1" max="2" step="0.05" value={state.printZoom||1} onChange={e=>update({printZoom:+e.target.value})}/><button className="primary" onClick={close}>Применить кадрирование</button></>}
      {modal==='photos'&&<><div className="photo-gallery">{printIds.map((id:string,i:number)=><button key={id} onClick={()=>{setSelectedPhoto(i);close();}}><img src={photos[id]?.url} alt={photos[id]?.name||'Фото'}/><span>{state.printCopies[i]} шт.</span></button>)}</div><button className="primary" onClick={()=>chooseFiles('prints')}>Добавить фотографии</button></>}
      {modal==='designs'&&<><button className="design-row" onClick={()=>go('editor')}><img src={asset(selected.image)} alt=""/><div><b>{selected.title}</b><p>{state.pages} страниц · сохранено на устройстве</p></div><span>→</span></button><button className="primary" onClick={()=>go('templates')}>Создать новую фотокнигу</button></>}
      {modal==='settings'&&<><p>Локальное рабочее пространство PicPac. Ваши фотографии хранятся в браузере на этом устройстве.</p><button className="secondary" onClick={()=>{setModal('');track.current?.profile();}}>Изменить профиль</button><button className="secondary" onClick={()=>track.current?.login()}>Тестовый вход / сменить режим</button><button className="secondary" onClick={()=>track.current?.privacy()}>Удалить фото и тестовые данные</button><button className="secondary" onClick={()=>go('notifications')}>Настройки уведомлений</button><button className="secondary" onClick={()=>{const blob=new Blob([JSON.stringify({...state,photoIds:[],printPhotoIds:[],reviewPhotoIds:[]},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='picpac-workspace.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}}>Скачать данные заказов</button></>}
      {modal==='logout'&&<><p>Вы выйдете из локального профиля. Сохранённые проекты останутся на этом устройстве.</p><button className="primary" onClick={()=>{setModal('');track.current?.logout();}}>Выйти</button><button className="secondary" onClick={close}>Остаться</button></>}
      {modal==='review-sent'&&<><p>Отзыв сохранён локально. После подключения сервера он сможет отправляться на модерацию.</p><button className="primary" onClick={()=>go('notifications')}>Готово</button></>}
      {modal==='support-sent'&&<><p>Обращение сохранено на этом устройстве. Доставка в службу поддержки станет доступна после подключения сервера.</p><button className="primary" onClick={()=>go('profile')}>В профиль</button></>}
      {modal==='ideas'&&<><p>Лето у моря, семейный праздник или маленькие радости года — соберите историю, к которой захочется вернуться.</p><div className="idea-grid">{templates.slice(1).map(t=><button key={t.id} onClick={()=>{update({template:t.id});go('template');}}><img src={asset(t.image)} alt=""/><b>{t.title}</b></button>)}</div></>}
      {modal==='reviews'&&<><p><b>Анна · ★★★★★</b><br/>Такие воспоминания хочется листать.</p>{state.reviews.map((r:any)=><p key={r.id}><b>{'★'.repeat(r.rating)}</b><br/>{r.text}<small>Сохранён на устройстве</small></p>)}<button className="primary" onClick={()=>go('review')}>Оставить отзыв</button></>}
      {modal==='post'&&<><p>Новый шаблон «Лето внутри»: сохраните любимое путешествие в одной книге.</p><button className="primary" onClick={()=>go('template')}>Посмотреть шаблон</button></>}
    </Modal>}
  </div></main><div className="desktop-caption">PicPac <span>•</span> Ваши фотографии остаются на устройстве</div></>;
}

