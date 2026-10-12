import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {normalizeCart,subtotal,selectProducts,whatsappUrl,orderText} from '../public/shop-core.mjs';
const config=JSON.parse(await readFile(new URL('../public/config.json',import.meta.url),'utf8'));
const p=config.products[0];
test('descarta datos corruptos y variantes que ya no existen',()=>{
  assert.deepEqual(normalizeCart([null,{id:'inexistente',qty:2,color:'X'},{id:p.id,qty:0,color:p.colors[0].name},{id:p.id,qty:1,color:'Inexistente'}],config.products),[]);
});
test('fusiona variantes y limita cantidades cargadas desde almacenamiento',()=>{
  const rows=normalizeCart([{id:p.id,color:p.colors[0].name,qty:15},{id:p.id,color:p.colors[0].name,qty:15}],config.products);
  assert.equal(rows.length,1);assert.equal(rows[0].qty,20);
});
test('subtotal usa precios actuales del catálogo, no valores guardados',()=>{
  assert.equal(subtotal([{id:p.id,color:p.colors[0].name,qty:2,price:1}],config.products),2*p.price);
});
test('filtra y ordena sin modificar el catálogo original',()=>{
  const ids=config.products.map(p=>p.id);const rows=selectProducts(config.products,'Accesorios','','price-asc');
  assert.ok(rows.every(p=>p.category==='Accesorios'));assert.ok(rows[0].price<=rows[1].price);assert.deepEqual(config.products.map(p=>p.id),ids);
  assert.equal(selectProducts(config.products,'Todas','SÍENA','featured')[0].id,p.id);
  assert.equal(selectProducts(config.products,'Todas','zzzz','featured').length,0);
});
test('WhatsApp requiere contacto válido y codifica el pedido',()=>{
  assert.equal(whatsappUrl('','hola'),null);assert.equal(whatsappUrl('no-es-numero','hola'),null);
  const url=new URL(whatsappUrl('+54 9 11 1234-5678','Hola & café\nPedido'));
  assert.equal(url.pathname,'/5491112345678');assert.equal(url.searchParams.get('text'),'Hola & café\nPedido');
});
test('pedido incluye cantidades, moneda, nota y advertencia de muestra',()=>{
  const text=orderText([{id:p.id,color:p.colors[0].name,qty:2}],config,'Para regalo');
  assert.ok(text.includes('× 2'));assert.ok(text.includes(config.brand));assert.ok(text.includes('COP'));assert.ok(text.includes('Para regalo'));assert.ok(text.includes('Catálogo de muestra'));
});
test('todas las imágenes del catálogo existen localmente',async()=>{
  for(const product of config.products) assert.ok((await readFile(new URL('../public/'+product.image,import.meta.url),'utf8')).includes('<svg'));
});
