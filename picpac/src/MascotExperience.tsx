import React,{useEffect,useRef,useState} from 'react';
import {getSession} from './api';
export const INTRO_KEY='picpac.intro.v1';
export function celebrate(title:string,body:string){window.dispatchEvent(new CustomEvent('picpac-celebrate',{detail:{title,body}}));}
export function Mascot({mood='welcome',className=''}:{mood?:'welcome'|'working'|'saved',className?:string}){
  return <div className={'picpac-mascot '+mood+' '+className} aria-hidden="true"><img className="mascot-left" src="/assets/1a55b.png" alt="" draggable={false}/><img className="mascot-right" src="/assets/96848.png" alt="" draggable={false}/></div>;
}
const steps=[
  {eyebrow:'Привет, я котик PicPac',title:'Давай сохраним ваши моменты',text:'За пару шагов соберём фотокнигу или подготовим фотографии к печати. Я буду рядом с понятными подсказками.',tag:'Ничего сложного · 4 коротких шага',color:'#fce8b8'},
  {eyebrow:'Сначала — ваша история',title:'Выберите, что создаём',text:'Фотокнига для целой истории или отдельные отпечатки. В каталоге можно подобрать тему, формат, страницы и количество фото.',tag:'Цена меняется вместе с настройками',color:'#e9d4f3'},
  {eyebrow:'Теперь добавим фотографии',title:'Ваши фото — в нужном порядке',text:'Добавьте снимки с телефона или попробуйте тестовую галерею. Меняйте порядок, подписи и макет — черновик сохраняется на устройстве.',tag:'Можно вернуться и продолжить позже',color:'#ffced0'},
  {eyebrow:'Проверим — и готово',title:'Красиво в книге, понятно в заказе',text:'Если снимок маленький или осталась пустая область, PicPac объяснит проблему. Потом — корзина, получение и номер тестового заказа.',tag:'В этой версии деньги не списываются',color:'#dce9d3'}
];
export default function MascotExperience({page}:{page:string}){
  const [visible,setVisible]=useState(false),[step,setStep]=useState(0);
  const [message,setMessage]=useState<any>(null);const box=useRef<HTMLDivElement>(null),touch=useRef<number|null>(null),toastTimer=useRef<any>(null);
  useEffect(()=>{function check(){if(getSession()&&!localStorage.getItem(INTRO_KEY)){setStep(0);setVisible(true);}}
    function replay(){setStep(0);setVisible(true);}function saved(e:Event){clearTimeout(toastTimer.current);setMessage((e as CustomEvent).detail);toastTimer.current=setTimeout(()=>setMessage(null),2800);}
    const timer=setTimeout(check,120);window.addEventListener('picpac-session',check);window.addEventListener('picpac-show-intro',replay);window.addEventListener('picpac-celebrate',saved);
    return()=>{clearTimeout(timer);clearTimeout(toastTimer.current);window.removeEventListener('picpac-session',check);window.removeEventListener('picpac-show-intro',replay);window.removeEventListener('picpac-celebrate',saved);};},[]);
  function finish(status='completed'){try{localStorage.setItem(INTRO_KEY,status);}catch{}setVisible(false);window.dispatchEvent(new Event('picpac-intro-finished'));}
  useEffect(()=>{if(!visible)return;const old=document.activeElement as HTMLElement;const timer=setTimeout(()=>box.current?.querySelector<HTMLButtonElement>('.tour-next')?.focus(),0);function key(e:KeyboardEvent){if(e.key==='Escape')finish('skipped');if(e.key==='ArrowRight')setStep(s=>Math.min(3,s+1));if(e.key==='ArrowLeft')setStep(s=>Math.max(0,s-1));if(e.key==='Tab'){const list=Array.from(box.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')||[]);if(e.shiftKey&&document.activeElement===list[0]){e.preventDefault();list.at(-1)?.focus();}else if(!e.shiftKey&&document.activeElement===list.at(-1)){e.preventDefault();list[0]?.focus();}}}document.addEventListener('keydown',key);return()=>{clearTimeout(timer);document.removeEventListener('keydown',key);old?.focus();};},[visible]);
  const current=steps[step];
  return <>
    {page==='profile'&&<button className="replay-intro" onClick={()=>{setStep(0);setVisible(true);}}>🐾 Как работает PicPac</button>}
    {message&&!visible&&<div className="mascot-notice" role="status"><Mascot mood="saved"/><div><strong>{message.title}</strong><span>{message.body}</span></div><button aria-label="Закрыть сообщение о сохранении" onClick={()=>setMessage(null)}>×</button></div>}
    {visible&&<div className="tour-shade"><section className="picpac-tour" ref={box} role="dialog" aria-modal="true" aria-label="Знакомство с PicPac" onPointerDown={e=>{touch.current=e.clientX;}} onPointerUp={e=>{if(touch.current!==null&&Math.abs(e.clientX-touch.current)>55)setStep(s=>Math.max(0,Math.min(3,s+(e.clientX<touch.current?-1:1)*-1)));touch.current=null;}}>
      <header><img src="/assets/1308e.png" alt="PicPac"/><button onClick={()=>finish('skipped')}>Пропустить</button></header>
      <div className="tour-illustration" style={{background:current.color}}><span className="tour-sparkle s1">✧</span><span className="tour-sparkle s2">✦</span><span className="tour-sparkle s3">♡</span><Mascot mood="welcome"/><span className="tour-step-pill">{step+1} / 4</span></div>
      <div className="tour-copy" key={step}><span className="tour-eyebrow">{current.eyebrow}</span><h2>{current.title}</h2><p>{current.text}</p><div className="tour-tip"><span>✓</span>{current.tag}</div></div>
      <div className="tour-dots" aria-label={'Шаг '+(step+1)+' из 4'}>{steps.map((_,i)=><button key={i} aria-label={'Шаг '+(i+1)} aria-current={step===i?'step':undefined} className={step===i?'active':''} onClick={()=>setStep(i)}/>)}</div>
      <footer><button className="tour-back" disabled={step===0} onClick={()=>setStep(s=>s-1)}>Назад</button><button className="primary tour-next" onClick={()=>step===3?finish():setStep(s=>s+1)}>{step===3?'Начать свою историю →':'Дальше →'}</button></footer>
    </section></div>}
  </>;
}
export function LoadingExperience({progress}:{progress:{done:number,total:number,phase?:string}}){
  const complete=progress.phase==='complete';const ratio=progress.total?progress.done/progress.total:0;const percentage=complete?100:progress.phase==='saving'?90:Math.round(ratio*90);
  return <section className={'loading-experience '+(complete?'is-complete':'')} aria-label="Подготовка фотографий"><img className="loading-logo" src="/assets/1308e.png" alt="PicPac"/><span className="loading-orbit orbit-one"/><span className="loading-orbit orbit-two"/><Mascot mood={complete?'saved':'working'}/>{complete&&<span className="saved-stamp">СОХРАНЕНО 🐾</span>}<h2>{complete?'Всё, ваши моменты со мной':progress.phase==='saving'?'Убираю фото в надёжное место':'Собираю ваши воспоминания'}</h2><p>{complete?'Фото сохранены на устройстве. Открываю редактор.':progress.phase==='saving'?'Записываю оригиналы на этом устройстве.':'Лапка вверх, лапка вниз — готовлю фото для вашей истории.'}</p><div className="paw-progress" role="progressbar" aria-label="Подготовка фото" aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100}><span style={{width:percentage+'%'}}/></div><div className="loading-count"><b>{progress.done} из {progress.total} фото</b><strong>{percentage}%</strong></div><small>{complete?'Мяу. Всё по порядку.':'Оставьте приложение открытым до завершения.'}</small></section>;
}

