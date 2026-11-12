import test from 'node:test';
import assert from 'node:assert/strict';
import {bookPrice,printPrice,totals,changeQuantity,loadState,initialState} from '../src/model.mjs';
test('sample cart and checkout match the design, in integer kopecks',()=>{const s={...initialState(),items:[{id:'book',price:7290,quantity:1},{id:'prints',price:165,quantity:1}]};assert.equal(totals(s.items).total,7455);assert.equal(totals(s.items,false,true).total,7955);});
test('promo discounts goods only, rounds once and leaves delivery intact',()=>{const s={...initialState(),items:[{id:'book',price:7290,quantity:1},{id:'prints',price:165,quantity:1}]};const t=totals(s.items,true,true);assert.deepEqual(t,{subtotal:7455,discount:1118,delivery:500,total:6837});assert.equal(totals([],true,true).total,0);});
test('quantity is bounded and does not mutate the previous cart',()=>{const s={...initialState(),items:[{id:'book',price:7290,quantity:1},{id:'prints',price:165,quantity:1}]};const t=changeQuantity(s.items,'book',-10);assert.equal(t[0].quantity,1);const u=changeQuantity(t,'book',200);assert.equal(u[0].quantity,99);assert.equal(s.items[0].quantity,1);});
test('price reflects spreads, tariff and print format',()=>{assert.equal(bookPrice('Classic',24),8190);assert.equal(bookPrice('Lite',20),4990);assert.equal(printPrice('20 × 30 см'),270);});
test('invalid saved data falls back to usable defaults',()=>{assert.equal(loadState({getItem:()=>'{bad json'}).items.length,0);assert.equal(loadState({getItem:()=>'{"items":null}'}).items.length,0);});

