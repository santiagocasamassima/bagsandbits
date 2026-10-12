import { cp, mkdir, rm, readFile } from 'node:fs/promises';
const config = JSON.parse(await readFile('public/config.json', 'utf8'));
if (!config.brand || !config.currency || !Array.isArray(config.products)) throw new Error('Configuración incompleta');
const ids = new Set();
for (const p of config.products) {
  if (ids.has(p.id) || !p.id || !p.name || !Number.isFinite(p.price) || p.price <= 0 || !Array.isArray(p.colors) || !p.colors.length) throw new Error('Producto inválido: ' + p.id);
  ids.add(p.id);
}
await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
await cp('public', 'dist', { recursive: true });
console.log('Sitio listo: dist/');
