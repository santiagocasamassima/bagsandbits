export function normalizeCart(value, products) {
  if (!Array.isArray(value)) return [];
  const merged = new Map();
  for (const row of value) {
    if (!row || typeof row !== 'object') continue;
    const product = products.find(p => p.id === row.id);
    if (!product || !product.colors.some(c => c.name === row.color) || !Number.isInteger(row.qty) || row.qty < 1) continue;
    const key = JSON.stringify([row.id, row.color]);
    const existing = merged.get(key);
    merged.set(key, {id: row.id, color: row.color, qty: Math.min(20, row.qty + (existing?.qty || 0))});
  }
  return [...merged.values()];
}
export function subtotal(cart, products) {
  return cart.reduce((sum, row) => sum + (products.find(p => p.id === row.id)?.price || 0) * row.qty, 0);
}
export function selectProducts(products, category, query, sort) {
  const fold = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const needle = fold(query.trim());
  const selected = products.filter(p => (category === 'Todas' || p.category === category) && fold(p.name + ' ' + p.category + ' ' + p.description).includes(needle));
  if (sort === 'price-asc') selected.sort((a,b) => a.price - b.price);
  if (sort === 'price-desc') selected.sort((a,b) => b.price - a.price);
  if (sort === 'name') selected.sort((a,b) => a.name.localeCompare(b.name, 'es'));
  return selected;
}
export function whatsappUrl(number, message) {
  const digits = String(number).replace(/[\s()+-]/g, '');
  if (!/^[1-9]\d{7,14}$/.test(digits)) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
export function orderText(cart, config, note = '') {
  const money = n => new Intl.NumberFormat(config.locale, {style:'currency',currency:config.currency,maximumFractionDigits:0}).format(n);
  const lines = cart.map(row => {
    const p = config.products.find(p => p.id === row.id);
    return `• ${p.name} — ${row.color} × ${row.qty}: ${money(p.price * row.qty)}`;
  });
  return [`Hola ${config.brand}, quisiera consultar por este pedido:`, '', ...lines, '', `Subtotal: ${money(subtotal(cart, config.products))} (${config.currency})`, 'Disponibilidad, pago y entrega a confirmar.', ...(config.demo ? ['Catálogo de muestra: productos y precios no confirmados.'] : []), ...(note.trim() ? ['', `Nota: ${note.trim().slice(0,400)}`] : [])].join('\n');
}
