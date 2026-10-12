import { normalizeCart, subtotal, selectProducts, whatsappUrl, orderText } from './shop-core.mjs';
const $ = selector => document.querySelector(selector);
const el = (tag, className, text) => { const node=document.createElement(tag); if(className) node.className=className; if(text!==undefined) node.textContent=text; return node; };
let config, cart=[], category='Todas', selectedColor, toastTimer;
const STORAGE='bagsandbits-cart-v1';
function notify(message) { (document.querySelector('dialog[open]') || document.body).append($('#toast')); $('#toast').textContent=message; $('#toast').classList.add('visible'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),2800); }
function money(n) { return new Intl.NumberFormat(config.locale,{style:'currency',currency:config.currency,maximumFractionDigits:0}).format(n); }
function image(p) { const img=el('img'); img.src=p.image; img.alt=`Ilustración de ${p.name}`; img.loading='lazy'; return img; }
function persist() { try {localStorage.setItem(STORAGE,JSON.stringify(cart));} catch {notify('Tu navegador no permite guardar la bolsa. Sigue disponible durante esta visita.');} renderCart(); }
function add(p,color) { const existing=cart.find(row=>row.id===p.id && row.color===color); if(existing?.qty>=20) return notify('Máximo 20 unidades por variante. Consultá cantidades mayores.'); if(existing) existing.qty++; else cart.push({id:p.id,color,qty:1}); persist(); notify(`${p.name} agregada a tu bolsa`); }
function openDialog(id) { const dialog=$('#'+id); if(!dialog.open) dialog.showModal(); }
function renderProducts() {
  const products=selectProducts(config.products,category,$('#search').value,$('#sort').value);
  $('#products').replaceChildren(); $('#result-count').textContent=`${products.length} ${products.length===1?'producto':'productos'}`; $('#empty').hidden=!!products.length;
  products.forEach(p=>{
    const card=el('article','product-card'), cover=el('button','product-image'); cover.setAttribute('aria-label',`Ver ${p.name}`); cover.append(image(p));
    if(p.badge) cover.append(el('span','badge',p.badge)); cover.append(el('span','view-product','↗')); cover.onclick=()=>showProduct(p);
    const info=el('div','product-info'), nameWrap=el('div'); nameWrap.append(el('p','product-category',p.category)); const name=el('button','product-name',p.name); name.onclick=()=>showProduct(p); nameWrap.append(name); info.append(nameWrap,el('p','price',money(p.price)));
    const bottom=el('div','card-bottom'), dots=el('div','dots'); dots.setAttribute('aria-label','Colores disponibles: '+p.colors.map(c=>c.name).join(', '));
    p.colors.forEach(c=>{const dot=el('span','dot');dot.style.background=c.hex;dot.title=c.name;dots.append(dot);});
    const quick=el('button','card-add','Elegir color +');quick.setAttribute('aria-label',`Elegir color de ${p.name}`);quick.onclick=()=>showProduct(p);bottom.append(dots,quick);card.append(cover,info,bottom);$('#products').append(card);
  });
}
function showProduct(p) {
  selectedColor=p.colors[0].name;
  const grid=el('div','product-detail-grid'), picture=el('div','detail-image');picture.append(image(p));
  const copy=el('div','detail-copy');copy.append(el('p','eyebrow',p.category.toUpperCase())); const title=el('h2','',p.name);title.id='product-title';copy.append(title,el('p','detail-price',money(p.price)),el('p','description',p.description));
  const ul=el('ul');p.details.forEach(d=>ul.append(el('li','',d)));copy.append(ul,el('p','product-category','Elegí un color'));
  const choices=el('div','color-choices');
  p.colors.forEach((c,i)=>{const b=el('button',i===0?'selected':'');b.setAttribute('aria-pressed',String(i===0));const dot=el('span','dot');dot.style.background=c.hex;b.append(dot,el('span','',c.name));b.onclick=()=>{selectedColor=c.name;choices.querySelectorAll('button').forEach(btn=>{btn.classList.remove('selected');btn.setAttribute('aria-pressed','false');});b.classList.add('selected');b.setAttribute('aria-pressed','true');};choices.append(b);});
  const addButton=el('button','button dark','Agregar a mi bolsa +');addButton.onclick=()=>add(p,selectedColor);copy.append(choices,addButton);grid.append(picture,copy);$('#product-detail').replaceChildren(grid);openDialog('product-dialog');
}
function renderCart() {
  $('#cart-count').textContent=String(cart.reduce((s,r)=>s+r.qty,0));$('#open-cart').setAttribute('aria-label',`Abrir carrito, ${$('#cart-count').textContent} productos`);
  $('#cart-items').replaceChildren();
  if(!cart.length) {const empty=el('div','empty-cart');empty.append(el('p','','Tu bolsa está esperando tus favoritos.'));const b=el('button','text-link','Explorar la colección ↗');b.onclick=()=>{$('#cart-dialog').close();$('#coleccion').scrollIntoView();};empty.append(b);$('#cart-items').append(empty);}
  cart.forEach((row,i)=>{const p=config.products.find(p=>p.id===row.id), item=el('article','cart-item'), info=el('div');info.append(el('h3','',p.name),el('p','',row.color));const qty=el('div','qty');
    const minus=el('button','','−');minus.setAttribute('aria-label',`Reducir cantidad de ${p.name}, ${row.color}`);minus.onclick=()=>{if(row.qty===1) cart.splice(i,1);else row.qty--;persist();};
    const plus=el('button','','+');plus.setAttribute('aria-label',`Aumentar cantidad de ${p.name}, ${row.color}`);plus.disabled=row.qty>=20;plus.onclick=()=>{row.qty++;persist();};qty.append(minus,el('span','',String(row.qty)),plus);info.append(qty);
    const end=el('div','item-end');end.append(el('p','',money(row.qty*p.price)));const remove=el('button','remove','Quitar');remove.setAttribute('aria-label',`Quitar ${p.name}, ${row.color}`);remove.onclick=()=>{cart.splice(i,1);persist();};end.append(remove);item.append(image(p),info,end);$('#cart-items').append(item);
  });
  $('#cart-total').textContent=money(subtotal(cart,config.products));
  const available=!!whatsappUrl(config.whatsapp,'');$('#checkout').disabled=!cart.length || !available || config.demo;
  $('#copy-order').disabled=!cart.length;
  $('#checkout-help').textContent=config.demo?'Catálogo de muestra: los pedidos por WhatsApp se habilitarán con el catálogo real.':available?config.contactNote:'El contacto por WhatsApp todavía no está habilitado. Podés copiar tu selección o consultar por Instagram.';
}
async function init() {
  const response=await fetch('config.json');if(!response.ok) throw new Error('No se pudo cargar el catálogo');config=await response.json();
  document.title=`${config.brand} — ${config.tagline}`;document.querySelectorAll('[data-brand]').forEach(n=>n.textContent=config.brand);document.querySelectorAll('[data-tagline]').forEach(n=>n.textContent=config.tagline.toUpperCase());$('#announcement').textContent=config.announcement;$('#year').textContent=new Date().getFullYear();$('#demo-note').hidden=!config.demo;
  if(config.instagramUrl && /^https:\/\/(www\.)?instagram\.com\//.test(config.instagramUrl)){ $('#instagram').href=config.instagramUrl;$('#instagram').hidden=false;}
  try{cart=normalizeCart(JSON.parse(localStorage.getItem(STORAGE)||'[]'),config.products);}catch{cart=[];}
  $('#filters').onclick=e=>{const btn=e.target.closest('button[data-category]');if(!btn)return;category=btn.dataset.category;$('#filters').querySelectorAll('button').forEach(b=>{b.classList.toggle('active',b===btn);b.setAttribute('aria-pressed',String(b===btn));});renderProducts();};
  $('#search').oninput=renderProducts;$('#sort').onchange=renderProducts;$('#open-cart').onclick=()=>openDialog('cart-dialog');
  document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>$('#'+b.dataset.close).close());
  document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target!==d)return;const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}));
  $('#checkout').onclick=()=>{if(!cart.length || config.demo)return;const url=whatsappUrl(config.whatsapp,orderText(cart,config,$('#order-note').value));if(url)window.open(url,'_blank','noopener,noreferrer');};
  $('#copy-order').onclick=async()=>{const text=orderText(cart,config,$('#order-note').value);try{await navigator.clipboard.writeText(text);notify('Pedido copiado.');}catch{const field=$('#order-note');field.value=text;field.focus();field.select();notify('Seleccionamos el pedido para que lo copies manualmente.');}};
  window.addEventListener('storage',e=>{if(e.key===STORAGE){try{cart=normalizeCart(JSON.parse(e.newValue||'[]'),config.products);renderCart();}catch{}}});renderProducts();renderCart();
}
init().catch(error=>{console.error(error);$('#result-count').textContent='No pudimos cargar la colección. Recargá la página para volver a intentar.';$('#open-cart').disabled=true;});
