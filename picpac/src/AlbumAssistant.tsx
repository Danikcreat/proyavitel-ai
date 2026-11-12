import React,{useEffect,useRef,useState} from 'react';
export default function AlbumAssistant({pages,photoIds,onApply}:{pages:number,photoIds:string[],onApply:(plan:any)=>void}){
  const [description,setDescription]=useState('');
  const [busy,setBusy]=useState(false),[error,setError]=useState('');
  const [plan,setPlan]=useState<any>(null);
  const pending=useRef<AbortController|null>(null);
  useEffect(()=>()=>pending.current?.abort(),[]);
  useEffect(()=>{pending.current?.abort();setPlan(null);setBusy(false);},[pages,JSON.stringify(photoIds)]);
  async function generate(e:React.FormEvent){
    e.preventDefault();if(busy)return;
    const controller=new AbortController();pending.current=controller;
    setBusy(true);setError('');setPlan(null);
    const timer=setTimeout(()=>controller.abort(),55000);
    try{
      const response=await fetch('/api/album',{method:'POST',headers:{'Content-Type':'application/json'},signal:controller.signal,
        body:JSON.stringify({description,pages,photoCount:photoIds.length})});
      const result=await response.json();
      if(!response.ok)throw Error(result.message||'Не удалось подготовить альбом.');
      if(!controller.signal.aborted)setPlan(result.plan);
    }catch(e){if(!controller.signal.aborted)setError(e instanceof Error?e.message:'Нет связи с сервером.');else if(pending.current===controller)setError('Генерация отменена или заняла слишком много времени.');}
    finally{clearTimeout(timer);if(pending.current===controller){setBusy(false);pending.current=null;}}
  }
  return <section aria-label="Помощник по альбому"><h3>Собрать альбом с ИИ</h3>
    <p>Опишите тему и желаемый порядок снимков. ИИ предложит название, подписи и макеты для {pages/2} разворотов.</p>
    <p className="quiet-hint">Провайдеру передадим только ваше описание и количество фото. Изображения и имена файлов останутся на устройстве; ИИ не видит содержимое снимков.</p>
    {!photoIds.length&&<p>Сначала добавьте фотографии.</p>}
    <form onSubmit={generate}><label className="field">О чём ваш альбом?<textarea value={description} minLength={5} maxLength={2000} required disabled={busy} onChange={e=>{setDescription(e.target.value);setPlan(null);}} placeholder="Лето у моря. Сначала дорога, затем пляж, в конце закат. Короткие тёплые подписи."/></label>
    <button className="primary" disabled={busy||!photoIds.length||description.trim().length<5}>{busy?'Готовим план альбома…':'Предложить план'}</button></form>
    {busy&&<button className="secondary" onClick={()=>pending.current?.abort()}>Отменить</button>}
    {busy&&<p role="status">Это может занять до минуты.</p>}{error&&<p role="alert" className="validation-error">{error}</p>}
    {plan&&<><h3>{plan.title}</h3><p>Проверьте подписи и порядок перед применением. Текущий черновик заменится; изменение можно отменить в редакторе.</p><ol>{plan.spreads.map((s:any,i:number)=><li key={i}><b>Разворот {i+1} · {s.layout}</b><p>{s.caption||'Без подписи'} · Фото {s.photos.join(', ')}</p></li>)}</ol><button className="primary" onClick={()=>onApply(plan)}>Применить к альбому</button></>}
  </section>;
}
