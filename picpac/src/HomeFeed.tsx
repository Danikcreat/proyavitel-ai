import React,{forwardRef,useImperativeHandle,useLayoutEffect,useRef} from 'react';
import {bookPrice,money,getProduct} from './model.mjs';
export default forwardRef(function HomeFeed({categories,hero,promo,review,templates,state,onOpen,onPrints,onSave,onScroll,initialScroll}:any,ref){
  const scroll=useRef<HTMLDivElement>(null);
  useLayoutEffect(()=>{if(scroll.current)scroll.current.scrollTop=initialScroll||0;},[]);
  useImperativeHandle(ref,()=>({category:(name:string)=>{const el=scroll.current;if(!el)return;const target=el.querySelector<HTMLElement>('[data-feed-category="'+name+'"]');el.scrollTo({top:name==='news'?0:target?.offsetTop||0,behavior:'smooth'});}}));
  const quiet=templates.find((t:any)=>t.id==='quiet')||templates[1];const family=templates.find((t:any)=>t.id==='moments')||templates[1];
  return <div className="home-content"><div className="home-category-bar">{categories}</div><div className="home-feed" ref={scroll} onScroll={e=>onScroll(e.currentTarget.scrollTop)} aria-label="Лента PicPac" tabIndex={0}>
    <div className="feed-original" data-feed-category="news">{hero}</div>
    <div className="feed-original" data-feed-category="sales">{promo}</div>
    <div className="feed-original feed-review" data-feed-category="reviews">{review}</div>
    <article className="feed-card" data-feed-category="ideas"><header><img src="/assets/1308e.png" alt="PicPac"/><b>Идея для вашей книги</b><span>✧</span></header><div className="feed-image"><img src={'/assets/'+quiet.image} alt={quiet.title}/><button className={state.saved.includes(quiet.id)?'saved':''} aria-label="Сохранить идею Тихие дни" onClick={()=>onSave(quiet.id)}><img src="/assets/9b7c2.svg" alt=""/></button></div><div className="feed-copy"><h3>Красота в маленьких моментах</h3><p>Прогулка, цветы на столе, солнечное утро. Соберите обычные дни, которые хочется помнить.</p><button className="primary" onClick={()=>onOpen(quiet)}>Открыть «{quiet.title}» →</button></div></article>
    <article className="feed-tip"><span>Полезно знать</span><h3>Как выбрать фото для печати?</h3><p>Берите оригиналы с телефона: снимки из мессенджеров часто сжаты. Перед заказом PicPac проверит разрешение и предупредит, если качество может пострадать.</p><button onClick={onPrints}>Подготовить фотографии →</button></article>
    {state.photoIds.length>0&&<article className="feed-draft"><span>Ваш черновик сохранён</span><h3>Продолжим вашу историю?</h3><p>{state.photoIds.length} фото уже в проекте. Порядок и настройки сохранены на устройстве.</p><button className="primary" onClick={()=>onOpen(null)}>Вернуться к редактору →</button></article>}
    <article className="feed-card"><header><img src="/assets/1308e.png" alt="PicPac"/><b>Вдохновение</b><span>♡</span></header><div className="feed-image"><img src={'/assets/'+family.image} alt={family.title}/></div><div className="feed-copy"><h3>Люди, с которыми хорошо</h3><p>Соберите встречи и улыбки в одну фотокнигу. {money(bookPrice('Classic',20,'20 × 20 см',family.id))} за базовый вариант.</p><button className="primary" onClick={()=>onOpen(family)}>Посмотреть шаблон →</button></div></article>
    <article className="feed-print"><h3>Пусть любимые фото будут рядом</h3><p>Фотопечать · {getProduct('prints')?.leadTime}. Выберите размер, бумагу и фотографии — стоимость пересчитается сразу.</p><button className="primary" onClick={onPrints}>К фотопечати →</button></article>
    <p className="feed-end">Вы посмотрели все публикации <span>♡</span></p>
  </div></div>;
});

