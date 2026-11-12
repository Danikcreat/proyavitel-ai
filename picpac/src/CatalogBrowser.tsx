import React,{useEffect,useRef,useState} from 'react';
import {bookPrice,money} from './model.mjs';
import HelpTip from './HelpTip';
type Props={templates:any[],state:any,update:(p:any)=>void,filter:any,setFilter:(f:any)=>void,onOpen:(t:any)=>void,onSave:(id:string)=>void};
const photoOptions=[null,10,20,30,50,100];
export default function CatalogBrowser({templates,state,update,filter,setFilter,onOpen,onSave}:Props){
  const [opened,setOpened]=useState<string|null>(null);
  const [position,setPosition]=useState({left:12,top:94});
  const [pages,setPages]=useState<number|null>(filter.pages??null),[photoCount,setPhotoCount]=useState<number|null>(filter.photoCount??null);
  const [price,setPrice]=useState(filter.price||'Любая'),[sort,setSort]=useState(filter.sort||'Популярные');
  const root=useRef<HTMLElement>(null),rail=useRef<HTMLDivElement>(null),menu=useRef<HTMLDivElement>(null);
  const trigger=useRef<HTMLButtonElement|null>(null);
  const drag=useRef<any>(null),suppressClick=useRef(false);
  useEffect(()=>{setFilter((f:any)=>({...f,pages,photoCount,price,sort}));},[pages,photoCount,price,sort]);
  const themes=['Все',...new Set<string>(templates.map(t=>t.theme))];
  const filters=[
    {key:'tariff',title:'Тариф',label:state.tariff==='Classic'?'Тариф':state.tariff,value:state.tariff,options:['Classic','Lite','Premium'],select:(v:any)=>update({tariff:v})},
    {key:'format',title:'Формат',label:state.format==='20 × 20 см'?'Формат':state.format,value:state.format,options:['20 × 20 см','15 × 15 см','20 × 30 см'],select:(v:any)=>update({format:v})},
    {key:'theme',title:'Тема',label:filter.theme==='Все'?'Тема':filter.theme,value:filter.theme,options:themes,select:(v:any)=>setFilter((f:any)=>({...f,theme:v}))},
    {key:'pages',title:'Количество страниц',label:pages?`${pages} страниц`:'Количество страниц',value:pages?String(pages):'Любое',options:['Любое','20','24','30','40','60'],select:(v:any)=>{setPages(v==='Любое'?null:+v);update({pages:v==='Любое'?20:+v});}},
    {key:'photos',title:'Количество фото',label:photoCount?`${photoCount} фото`:'Количество фото',value:photoCount?String(photoCount):'Любое',options:photoOptions.map(n=>n===null?'Любое':String(n)),select:(v:any)=>setPhotoCount(v==='Любое'?null:+v)},
    {key:'price',title:'Цена',label:price==='Любая'?'Цена':price,value:price,options:['Любая','До 70 BYN','70–100 BYN','От 100 BYN'],select:setPrice},
    {key:'sort',title:'Сортировка',label:sort==='Популярные'?'Сортировка':sort,value:sort,options:['Популярные','Сначала новые','Цена по возрастанию','Цена по убыванию','По названию'],select:setSort}
  ];
  const current=filters.find(f=>f.key===opened);
  const hasFilters=Boolean(pages||photoCount||price!=='Любая'||filter.theme!=='Все'||filter.saved||filter.query||state.tariff!=='Classic'||state.format!=='20 × 20 см'||sort!=='Популярные');
  function reset(){setPages(null);setPhotoCount(null);setPrice('Любая');setSort('Популярные');setFilter({query:'',theme:'Все',saved:false});update({tariff:'Classic',format:'20 × 20 см',pages:20});setOpened(null);}
  function toggle(key:string,button:HTMLButtonElement){if(opened===key){setOpened(null);return;}const a=button.getBoundingClientRect(),b=root.current!.getBoundingClientRect(),scale=b.width/390;trigger.current=button;setPosition({left:Math.min(134,Math.max(12,(a.left-b.left)/scale)),top:(a.bottom-b.top)/scale+8});setOpened(key);}
  useEffect(()=>{if(!opened)return;const timer=setTimeout(()=>{const options=menu.current?.querySelectorAll<HTMLButtonElement>('[role=option]');const selected=menu.current?.querySelector<HTMLButtonElement>('[aria-selected=true]');(selected||options?.[0])?.focus();},0);function close(e:PointerEvent){if(!(e.target as Element).closest('[data-filter],.catalog-popover'))setOpened(null);}function key(e:KeyboardEvent){if(e.key==='Escape'){setOpened(null);trigger.current?.focus();}if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)&&menu.current?.contains(e.target as Node)){e.preventDefault();const options=Array.from(menu.current.querySelectorAll<HTMLButtonElement>('[role=option]'));let index=options.indexOf(document.activeElement as HTMLButtonElement);index=e.key==='Home'?0:e.key==='End'?options.length-1:(index+(e.key==='ArrowDown'?1:-1)+options.length)%options.length;options[index]?.focus();}}document.addEventListener('pointerdown',close);document.addEventListener('keydown',key);return()=>{clearTimeout(timer);document.removeEventListener('pointerdown',close);document.removeEventListener('keydown',key);};},[opened]);
  useEffect(()=>{const el=rail.current;if(!el)return;const wheel=(e:WheelEvent)=>{if(Math.abs(e.deltaY)<=Math.abs(e.deltaX))return;const before=el.scrollLeft;el.scrollLeft+=e.deltaY;if(el.scrollLeft!==before){e.preventDefault();setOpened(null);}};el.addEventListener('wheel',wheel,{passive:false});return()=>el.removeEventListener('wheel',wheel);},[]);
  let matches=templates.filter(t=>{
    if(filter.saved&&!state.saved.includes(t.id))return false;
    if(filter.theme!=='Все'&&t.theme!==filter.theme)return false;
    if(!t.title.toLowerCase().includes(filter.query.toLowerCase()))return false;
    if(pages&&(pages<(t.minPages||20)||pages>(t.maxPages||60)))return false;
    if(photoCount&&(photoCount<(t.minPhotos||1)||photoCount>(t.maxPhotos||200)))return false;
    const cost=bookPrice(state.tariff,pages||Math.min(t.maxPages||60,Math.max(state.pages,t.minPages||20)),state.format,t.id);
    return price==='До 70 BYN'?cost<=7000:price==='70–100 BYN'?cost>=7000&&cost<=10000:price==='От 100 BYN'?cost>=10000:true;
  });
  const chosenPages=(t:any)=>pages||Math.min(t.maxPages||60,Math.max(state.pages,t.minPages||20));
  const cost=(t:any)=>bookPrice(state.tariff,chosenPages(t),state.format,t.id);
  matches=[...matches].sort((a,b)=>sort==='Цена по возрастанию'?cost(a)-cost(b):sort==='Цена по убыванию'?cost(b)-cost(a):sort==='По названию'?a.title.localeCompare(b.title,'ru'):sort==='Сначала новые'?(b.newness||0)-(a.newness||0):(b.popularity||0)-(a.popularity||0));
  return <section className="catalog-browser" ref={root}>
    <div className="catalog-search"><img src="/assets/a1aec.svg" alt=""/><input aria-label="Найти шаблон" placeholder="Найти шаблон" value={filter.query} onChange={e=>setFilter((f:any)=>({...f,query:e.target.value}))}/><button data-filter="sort" data-node-id="86:2630" aria-label="Открыть сортировку" aria-expanded={opened==='sort'} onClick={e=>toggle('sort',e.currentTarget)}><img src="/assets/8f450.svg" alt=""/></button></div>
    <div className="filter-rail" ref={rail} aria-label="Фильтры каталога — прокрутка влево и вправо" tabIndex={0} onKeyDown={e=>{if(e.target!==e.currentTarget)return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();e.currentTarget.scrollBy({left:e.key==='ArrowRight'?160:-160,behavior:'smooth'});}}} onTouchMove={()=>setOpened(null)} onPointerDown={e=>{suppressClick.current=false;if(e.pointerType==='mouse')drag.current={x:e.clientX,scroll:e.currentTarget.scrollLeft,moved:false};}} onPointerMove={e=>{if(!drag.current)return;const dx=e.clientX-drag.current.x;if(Math.abs(dx)>6){drag.current.moved=true;e.currentTarget.setPointerCapture(e.pointerId);setOpened(null);e.currentTarget.scrollLeft=drag.current.scroll-dx/(root.current!.getBoundingClientRect().width/390);}}} onPointerUp={e=>{if(drag.current?.moved){suppressClick.current=true;if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);}drag.current=null;}} onPointerCancel={()=>{drag.current=null;}} onClickCapture={e=>{if(suppressClick.current){e.preventDefault();e.stopPropagation();suppressClick.current=false;}}}>
      {filters.map(f=><button key={f.key} data-filter={f.key} aria-label={f.title} aria-haspopup="listbox" aria-expanded={opened===f.key} className={'filter-chip '+(opened===f.key?'open ':'')+((f.label!==f.title)?'selected':'')} onClick={e=>toggle(f.key,e.currentTarget)}>{f.label}<span className="filter-chevron"/></button>)}
    </div>
    <div className="catalog-results"><div className="catalog-result-label"><HelpTip label="Как подобрать шаблон?" text="Начните с темы и количества фото. Страницы можно добавить в редакторе, а стоимость вы увидите до заказа."/><span>{matches.length} {matches.length===1?'шаблон':matches.length<5?'шаблона':'шаблонов'}</span></div>{hasFilters&&<button onClick={reset}>Сбросить</button>}</div>
    <div className="catalog-cards">{matches.length?matches.map(t=><article className={'catalog-card '+(t.id==='auto'?'automatic':'')} key={t.id}><button data-node-id={{auto:'86:2662',summer:'86:2665',love:'86:2673',moments:'86:2681',year:'86:2689',quiet:'86:2697'}[t.id]} className="template-open" aria-label={t.title} onClick={()=>onOpen({...t,chosenPages:chosenPages(t)})}><img src={'/assets/'+t.image} alt={'Фотокнига «'+t.title+'»'}/><h3>{t.title}</h3><b>{money(cost(t))}</b><small>{t.minPhotos||1}–{t.maxPhotos||200} фото · {t.minPages||20}–{t.maxPages||60} стр.</small></button>{t.id!=='auto'&&<button className={'catalog-save '+(state.saved.includes(t.id)?'saved':'')} aria-label={(state.saved.includes(t.id)?'Убрать из избранного: ':'Сохранить: ')+t.title} aria-pressed={state.saved.includes(t.id)} onClick={()=>onSave(t.id)}><img src="/assets/43900.svg" alt=""/></button>}</article>):<div className="empty-state"><h3>Ничего не нашлось</h3><p>Попробуйте убрать один из фильтров или изменить запрос.</p><button onClick={reset}>Сбросить фильтры</button></div>}</div>
    {current&&<><button className="dropdown-dismiss" tabIndex={-1} aria-label="Закрыть список" onClick={()=>setOpened(null)}/><div className="catalog-popover" style={position} ref={menu} role="listbox" aria-label={current.title}><div className="popover-title">{current.title}</div><p className="popover-help">{({tariff:"Выберите вариант книги — цена карточек пересчитается сразу.",format:"Это размер готовой книги в сантиметрах.",theme:"Подберите настроение своей истории.",pages:"Количество страниц можно изменить и после выбора шаблона.",photos:"Это вместимость шаблона. Сами фото добавите на следующем шаге.",price:"Цена книги без доставки, с выбранными тарифом и форматом.",sort:"Удобный порядок карточек — остальные фильтры сохранятся."} as any)[current.key]}</p>{current.options.map(value=><button key={value} role="option" aria-selected={current.value===value} onClick={()=>{current.select(value);setOpened(null);trigger.current?.focus();}}><span>{value}</span>{current.value===value&&<span aria-hidden="true">✓</span>}</button>)}</div></>}
  </section>;
}

