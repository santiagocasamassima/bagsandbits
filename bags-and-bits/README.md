# Bags & Bits — Carteras y accesorios

Sitio boutique adaptable a celular, tablet y escritorio. Incluye catálogo con búsqueda, categorías y orden por precio; detalle de producto y variantes; carrito persistente; subtotal; copia de pedido; enlace a Instagram y consulta de compra por WhatsApp.

## Estado de entrega

Proyecto listo para desplegar en Vercel. El nombre y el enlace de Instagram corresponden al perfil facilitado: https://www.instagram.com/bagsandbits_/

Instagram no permitió consultar su contenido durante la preparación: el diseño es una propuesta, no una reproducción verificada del perfil. Las ilustraciones SVG, nombres, colores, descripciones y precios de los productos son ejemplos. La moneda COP también es un valor de ejemplo; cambiar según el país de venta. Los pedidos por WhatsApp están deshabilitados mientras `demo` sea `true` o no exista un número válido.

No incluye pasarela de pago, panel de administración, base de datos ni control de stock. La compra se confirma manualmente por WhatsApp. El carrito guarda solo identificador, color y cantidad en el navegador. No se realiza un cobro ni se reserva mercadería.

## 1. Personalizar

Editar `public/config.json`:

- `brand`, `tagline` y `announcement`: identidad y textos.
- `currency` / `locale`: por ejemplo `ARS` / `es-AR`, `COP` / `es-CO` o la moneda correspondiente.
- `whatsapp`: número real con código de país, sin prefijo `00`, sin espacios; debe ser el número usado por WhatsApp. Nunca se incluyó un número inventado.
- `instagramUrl`: ya apunta al perfil indicado.
- `contactNote`: mensaje de atención.
- `products`: catálogo real. Mantener `id` único y estable para cada producto. `price` debe ser numérico y mayor que cero. `colors` debe contener al menos una variante.
- `demo`: cambiar a `false` solo después de reemplazar el catálogo por datos confirmados. Esto habilita WhatsApp si el contacto es válido.

Las categorías predeterminadas son `Carteras`, `Bandoleras` y `Accesorios`. Si se necesitan otras, cambiar los botones `data-category` en `public/index.html`.

Para usar fotos: copiarlas a `public/assets/` y escribir su ruta en el campo `image` de cada producto, por ejemplo `assets/tote-siena.webp`. Se recomiendan fotos de al menos 1000 × 1000 px, optimizadas y con composición consistente. Reemplazar también `public/assets/hero.svg` (o su ruta en HTML) por una fotografía de portada. Actualizar los textos alternativos en `index.html` y en la función `image()` de `app.js` para que describan fotografías reales.

Actualizar el título y la descripción de `public/index.html`, el favicon y los textos de la historia si corresponde. El nombre de marca visible y el título del navegador también se leen de la configuración. No agregar descuentos, políticas o promesas de entrega que la tienda no haya confirmado. Las respuestas sobre envíos y cambios son consultas generales y deben completarse con condiciones reales antes de vender.

## 2. Probar en tu computadora

Requiere Node.js 20 o posterior. Sin dependencias externas ni instalación de paquetes:

```bash
npm test
npm run build
```

Para abrir el sitio localmente, con Python 3 disponible:

```bash
npm run dev
```

Abrir `http://localhost:3000`. No abrir el HTML con doble clic: el catálogo se carga con `fetch` y requiere HTTP.

## 3. Subir a Vercel

1. Descomprimir el proyecto y subir su contenido a un repositorio GitHub, GitLab o Bitbucket.
2. En Vercel elegir **Add New → Project** e importar ese repositorio.
3. Elegir **Other** como framework. Si el proyecto está dentro de una subcarpeta, seleccionarla en **Root Directory**.
4. Usar **Build Command:** `npm run build`, **Output Directory:** `dist`. `vercel.json` ya define ambos valores. No hay variables de entorno ni secretos que configurar.
5. Publicar con **Deploy**. El sitio se sirve por HTTPS, necesario para copiar pedidos al portapapeles.

También se puede usar el CLI de Vercel desde la raíz del proyecto si ya se tiene instalado y autenticado:

```bash
vercel
vercel --prod
```

La publicación no fue realizada: se entrega el código listo para importar a la cuenta del usuario.

## Archivos

- `public/index.html`: estructura y textos de la página.
- `public/styles.css`: diseño y adaptación a pantallas pequeñas.
- `public/config.json`: marca, contacto y catálogo.
- `public/app.js`: interfaz, modales y carrito.
- `public/shop-core.mjs`: cálculo y validación de pedidos.
- `public/assets/`: ilustraciones propias, sin archivos externos.
- `scripts/build.mjs`: valida el catálogo y genera `dist/`.
- `tests/shop.test.mjs`: pruebas de carrito, búsqueda, totales y WhatsApp.
- `vercel.json`: configuración de despliegue.

## Verificación

Se ejecutaron las pruebas automatizadas y la generación de producción. No hubo un navegador de prueba disponible en este entorno; revisar visualmente en la vista previa de Vercel antes del lanzamiento comercial. Probar especialmente elección de color, agregado y eliminación, persistencia al recargar, categorías, búsqueda sin resultados y apertura del pedido con el contacto real.

## Privacidad

No hay analítica, rastreadores ni formularios que envíen datos a un servidor. El carrito se almacena en `localStorage`. Instagram y WhatsApp son servicios externos; WhatsApp recibe el texto del pedido cuando el visitante abre la consulta. Completar la información comercial y los avisos legales aplicables al país de venta antes de lanzar.
