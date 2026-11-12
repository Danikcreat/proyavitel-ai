export const STORAGE_KEY = 'picpac.workspace.v1';
import fixture from '../public/mock/catalog.json' with {type:'json'};
let catalog=fixture;
export const templates=[...fixture.templates];
export const points=[...fixture.points];
export function configureCatalog(value){if(!value?.templates?.length||!value?.pricing?.book||!value?.pricing?.prints)throw Error('Каталог недоступен');catalog=value;templates.splice(0,templates.length,...value.templates);points.splice(0,points.length,...value.points);return value;}
export function bookPrice(tariff='Classic',pages=20,format='20 × 20 см',templateId='summer'){const p=catalog.pricing.book;return p.tariffs[tariff]+(p.formats[format]||0)+(catalog.templates.find(t=>t.id===templateId)?.extraPrice||0)+Math.max(0,(pages-p.basePages)/2)*p.extraSpread;}
export function printPrice(size='10 × 15 см',paper='Матовая',frame='Без рамки',type='Фотохимическая'){const p=catalog.pricing.prints;return p.sizes[size]+p.papers[paper]+p.frames[frame]+p.types[type];}
export function getProduct(id){return catalog.products.find(p=>p.id===id);}
export function deliveryPrice(id='pickup'){return catalog.deliveryMethods.find(d=>d.id===id)?.fee??0;}
export function totals(items,promo=false,delivery=false){const subtotal=items.reduce((s,i)=>s+i.price*i.quantity,0);const discount=promo?Math.round(subtotal*(catalog.pricing.promos.PIC15||0)/100):0;const fee=typeof delivery==='number'?delivery:(delivery?500:0);return {subtotal,discount,delivery:items.length?fee:0,total:subtotal-discount+(items.length?fee:0)};}
export function money(cents) { return (cents/100).toLocaleString('ru-RU',{minimumFractionDigits:2,maximumFractionDigits:2})+' BYN'; }
export function changeQuantity(items,id,delta) { return items.map(i=>i.id===id?{...i,quantity:Math.min(99,Math.max(1,i.quantity+delta))}:i); }
export function initialState() { return { profile:{name:'Анна',phone:'+375 29 000-00-00',email:'anna@example.com'}, items:[],orderName:'Моё лето',promo:false,point:0,template:'summer',tariff:'Classic',pages:20,format:'20 × 20 см',photoIds:[],printCopies:[1,1,1],printSize:'10 × 15 см',paper:'Матовая',frame:'Без рамки',printType:'Фотохимическая',draft:{page:2,text:'Наше маленькое лето',background:'#f5eee4',layout:'Классический',zoom:1,offsetX:0,offsetY:0},orders:[],reviews:[],messages:[],settings:{orders:true,news:false},saved:[],loggedIn:false,deliveryId:'pickup',apiOrders:[],supportOrderId:null,trackVersion:2}; }
export function loadState(storage) { try {const data=JSON.parse(storage.getItem(STORAGE_KEY)||'null'); if(data&&Array.isArray(data.items))return {...initialState(),...data,draft:{...initialState().draft,...data.draft}};}catch{}return initialState(); }

