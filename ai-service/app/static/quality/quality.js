const avatarSvg=(name,bg='#d9e5c7',shirt='#7f9b59',skin='#f4d7bf',hair='#5b5147')=>{
  const initial = name.charAt(0).toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
    <rect width="80" height="80" rx="40" fill="${bg}"/>
    <circle cx="40" cy="31" r="14" fill="${skin}"/>
    <path d="M26 29c1-10 8-16 16-16s15 6 16 16c-4-5-7-8-16-8s-12 3-16 8z" fill="${hair}"/>
    <path d="M17 80c2-17 12-25 23-25s21 8 23 25" fill="${shirt}"/>
    <text x="40" y="74" text-anchor="middle" font-size="10" font-family="Arial" fill="#ffffff" opacity="0.9">${initial}</text>
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};
const flagIcon = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 20V5m0 0c2-1 4-1 6 0s4 1 6 0v8c-2 1-4 1-6 0s-4-1-6 0"/></svg>`;

const stages=[
{id:'files',n:'01',milestone:'Подготовка',date:'08:00',title:'Подготовка файлов',state:'done',status:'Пройдено',description:'Допечатная проверка, файлы, цветовой профиль и техтребования',progress:100,checks:'12 из 12',orders:['FP-1042','FP-1048'],machine:'Prepress WS-02',stationState:'Исправен',stationHealth:'ok',stationNote:'Все контрольные параметры подтверждены',owner:'Руководитель допечатной подготовки',name:'Мария Коваленко',efficiency:96,details:'Проверка форматов, полей под обрез, цветового профиля, разрешения изображений и корректности макетов.',risk:'Отклонений не выявлено.',photo:avatarSvg('Мария','#e8eed7','#80985b','#f6dbc4','#544842')},
{id:'print',n:'02',milestone:'Печать',date:'09:20',title:'Печать',state:'progress',status:'В работе',description:'Тиражирование и контроль параметров печатного станка',progress:68,checks:'17 из 25',orders:['FP-1042','FP-1051'],machine:'Печатный станок №2',stationState:'Требует внимания',stationHealth:'attention',stationNote:'Плавающее отклонение по цветопередаче',owner:'Начальник печатного участка',name:'Алексей Петров',efficiency:87,details:'Сверка цветопередачи, приводки, однородности печати и состояния материала по ключевым листам.',risk:'Зафиксировано предупреждение по цветопередаче заказа FP-1042.',photo:avatarSvg('Алексей','#dfe7cf','#6e89b4','#f2d2b6','#463e38')},
{id:'quality',n:'03',milestone:'ОТК',date:'10:10',title:'Контроль качества',state:'issue',status:'Отклонение',description:'Проверка образцов, измерения и решение о допуске тиража',progress:44,checks:'8 из 18',orders:['FP-1042','FP-1048'],machine:'Пост QC-1',stationState:'Есть отклонение',stationHealth:'attention',stationNote:'Нужно решение по заказу FP-1042',owner:'Руководитель ОТК',name:'Ольга Соколова',efficiency:82,details:'Визуальные и инструментальные проверки по карте качества. Проблемные партии направляются на повторную оценку.',risk:'FP-1042: расхождение цвета с утверждённым образцом. Требуется решение.',photo:avatarSvg('Ольга','#ece8d6','#8c6fb0','#f5dac0','#483e3b')},
{id:'finish',n:'04',milestone:'Постобработка',date:'11:00',title:'Постобработка',state:'progress',status:'В работе',description:'Резка, ламинация, сборка и контроль финишных операций',progress:53,checks:'9 из 17',orders:['FP-1048','FP-1051'],machine:'Линия постобработки №1',stationState:'Исправен',stationHealth:'ok',stationNote:'Работает в штатном режиме',owner:'Мастер постпечатного участка',name:'Дмитрий Васильев',efficiency:91,details:'Контроль размеров, точности резки, качества покрытия, биговки и комплектности изделий.',risk:'Ожидание повторной проверки части тиража FP-1048.',photo:avatarSvg('Дмитрий','#e7ebd8','#5a8d8d','#efcfb7','#50463f')},
{id:'ship',n:'05',milestone:'Отгрузка',date:'12:20',title:'Упаковка и отгрузка',state:'waiting',status:'Ожидает',description:'Комплектность, маркировка и разрешение на отгрузку',progress:15,checks:'2 из 13',orders:['FP-1048','FP-1051'],machine:'Зона упаковки',stationState:'Ожидает этап',stationHealth:'ok',stationNote:'Запуск после допуска ОТК',owner:'Руководитель склада',name:'Екатерина Новик',efficiency:93,details:'Сверка комплектации, маркировки, упаковки и документации перед передачей заказчику.',risk:'FP-1048: потенциальный сдвиг срока из-за повторного контроля.',photo:avatarSvg('Екатерина','#e5ead6','#bb7d6d','#f4d7c0','#514741')}
];

const issues=[
  {name:'Несоответствие цветопередачи',sub:'FP-1042 · Печатный станок №2',severity:'Критическое',stage:'quality'},
  {name:'Повторная проверка резки',sub:'FP-1048 · Линия №1',severity:'Среднее',stage:'finish'},
  {name:'Ожидание допуска к отгрузке',sub:'FP-1048 · Упаковка',severity:'Среднее',stage:'ship'}
];

const jobs=[
  {id:'FP-1042',desc:'Полиграфический тираж · контроль цвета',status:'Риск качества',stage:'quality'},
  {id:'FP-1048',desc:'Изделия с постобработкой',status:'Повторная проверка',stage:'finish'},
  {id:'FP-1051',desc:'Тираж в производстве',status:'По плану',stage:'print'}
];

const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function renderTimeline(){
  $('timeline').innerHTML = stages.map(s=>`<div class="milestone"><span class="flag-badge">${flagIcon}</span><div class="milestone-text"><b>${esc(s.milestone)}</b><small>${esc(s.date)}</small></div></div>`).join('');
}

function renderStages(){
  const order=$('order-filter').value, status=$('status-filter').value;
  $('stages').innerHTML=stages.map((s,index)=>{
    const dim=(order!=='all'&&!s.orders.includes(order))||(status!=='all'&&s.state!==status);
    return `<button type="button" class="stage ${index%2===1?'alt':''} ${index===stages.length-1?'last':''} ${dim?'dim':''}" data-stage="${s.id}" ${dim?'tabindex="-1"':''}>
      <div class="stage-head">
        <div>
          <div class="stage-num">${s.n} / ЭТАП ПРОИЗВОДСТВА</div>
          <div class="stage-title">${esc(s.title)}</div>
        </div>
        <span class="pill ${s.state}">${esc(s.status)}</span>
      </div>
      <div class="machine-box">
        <div class="machine-line">
          <div>
            <span>Станок / участок</span>
            <b>${esc(s.machine)}</b>
          </div>
          <span class="${s.stationHealth==='ok'?'station-ok':'station-attn'}">${esc(s.stationState)}</span>
        </div>
        <p>${esc(s.stationNote)}</p>
      </div>
      <p>${esc(s.description)}</p>
      <div class="eff">
        <span class="foot-label">${esc(s.checks)} проверок</span>
        <div class="bar"><i style="width:${s.progress}%"></i></div>
        <div class="stage-meta"><span>${s.orders.length} заказа на этапе</span><strong>${s.progress}%</strong></div>
      </div>
      <div class="responsible">
        <img class="person-photo" src="${s.photo}" alt="${esc(s.name)}">
        <div class="person-text">
          <b>${esc(s.name)}</b>
          <small>${esc(s.owner)}</small>
        </div>
      </div>
    </button>`;
  }).join('');
  document.querySelectorAll('[data-stage]').forEach(el=>el.addEventListener('click',()=>openStage(el.dataset.stage)));
}

function renderPanels(){
  $('people-list').innerHTML=stages.map(s=>`<div class="line">
      <img class="person-photo" src="${s.photo}" alt="${esc(s.name)}">
      <div class="line-main">
        <b>${esc(s.name)}</b>
        <small>${esc(s.owner)}</small>
        <small>${esc(s.machine)}</small>
      </div>
      <div class="kpi-wrap">
        <div class="kpi-top"><span>Эффективность</span><span class="kpi-val">${s.efficiency}%</span></div>
        <div class="kpi-bar"><i style="width:${s.efficiency}%"></i></div>
      </div>
      <button class="mini-button" data-contact="${s.id}">Связаться</button>
    </div>`).join('');

  $('issue-list').innerHTML=issues.map(i=>`<div class="line"><span class="initial">!</span><div class="line-main"><b>${esc(i.name)}</b><small>${esc(i.sub)}</small></div><span class="severity ${i.severity==='Среднее'?'med':''}">${i.severity}</span><button class="mini-button" data-open="${i.stage}">→</button></div>`).join('');
  $('order-list').innerHTML=jobs.map(j=>`<div class="line"><span class="initial">▤</span><div class="line-main"><b>${j.id}</b><small>${esc(j.desc)}</small><small>${esc(j.status)}</small></div><button class="mini-button" data-open="${j.stage}">→</button></div>`).join('');
  document.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>openStage(b.dataset.open));
  document.querySelectorAll('[data-contact]').forEach(b=>b.onclick=()=>openStage(b.dataset.contact));
}

function openStage(id){
  const s=stages.find(x=>x.id===id); if(!s) return;
  $('drawer-title').textContent=s.title;
  $('drawer-body').innerHTML=`
    <div class="responsible" style="margin:14px 0 18px;">
      <img class="person-photo" src="${s.photo}" alt="${esc(s.name)}">
      <div class="person-text"><b>${esc(s.name)}</b><small>${esc(s.owner)}</small></div>
      <span class="pill ${s.state}" style="margin-left:auto;">${esc(s.status)}</span>
    </div>
    <div class="detail-box">
      <div class="detail-row"><span>Этап</span><b>${s.n} / 05</b></div>
      <div class="detail-row"><span>Прогресс</span><b>${s.progress}%</b></div>
      <div class="detail-row"><span>Проверки</span><b>${esc(s.checks)}</b></div>
      <div class="detail-row"><span>Оборудование</span><b>${esc(s.machine)}</b></div>
      <div class="detail-row"><span>Состояние станка</span><b>${esc(s.stationState)}</b></div>
      <div class="detail-row"><span>Эффективность участка</span><b>${s.efficiency}%</b></div>
    </div>
    <h3>Краткая информация</h3>
    <div class="detail-box"><p>${esc(s.details)}</p></div>
    <h3>Заказы на этапе</h3>
    <div class="detail-box">${s.orders.map(o=>`<div class="detail-row"><span>Заказ</span><b>${esc(o)}</b></div>`).join('')}</div>
    <h3>Отклонения / действия</h3>
    <div class="detail-box"><p>${esc(s.risk)}</p></div>
    <button class="action" data-action="Запрос информации подготовлен (демо)">Запросить уточнение</button>
    <button class="action secondary" data-action="Карточка обращения подготовлена (демо)">Связаться с руководителем</button>
    <button class="action" data-action="Проект поручения создан только в интерфейсе (демо)">Назначить действие</button>
    <p style="color:#858e85;font-size:11px;line-height:1.6">Демо: действия не отправляют сообщения и не изменяют производственные системы.</p>`;
  $('overlay').hidden=false;
  document.body.style.overflow='hidden';
  $('close').focus();
  document.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>notify(b.dataset.action));
}

function closeStage(){ $('overlay').hidden=true; document.body.style.overflow=''; }
let toastTimer;
function notify(s){ const t=$('toast'); t.textContent=s; t.hidden=false; clearTimeout(toastTimer); toastTimer=setTimeout(()=>t.hidden=true,3500); }

$('close').onclick=closeStage;
$('dismiss').onclick=closeStage;
document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&!$('overlay').hidden) closeStage(); });
$('order-filter').onchange=renderStages;
$('status-filter').onchange=renderStages;
renderTimeline();
renderStages();
renderPanels();
