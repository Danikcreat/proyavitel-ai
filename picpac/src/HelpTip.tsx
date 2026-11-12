import React,{useEffect,useId,useRef,useState} from 'react';
export default function HelpTip({label,text,align='start'}:{label:string,text:string,align?:'start'|'end'}){
  const [open,setOpen]=useState(false);const root=useRef<HTMLSpanElement>(null),id=useId();
  useEffect(()=>{if(!open)return;const outside=(e:PointerEvent)=>{if(!root.current?.contains(e.target as Node))setOpen(false);};const key=(e:KeyboardEvent)=>{if(e.key==='Escape')setOpen(false);};document.addEventListener('pointerdown',outside);document.addEventListener('keydown',key);return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',key);};},[open]);
  return <span className={'help-tip '+align} ref={root}><button className="help-trigger" aria-label={label} aria-expanded={open} aria-describedby={open?id:undefined} onClick={()=>setOpen(v=>!v)}>?</button>{open&&<span id={id} className="help-bubble" role="tooltip"><b>{label}</b><span>{text}</span></span>}</span>;
}

