import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { products, site } from './catalog-data.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const imageRoot = join(root, 'assets', 'images', 'catalog');

const write = (path, value) => {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, value, 'utf8');
};

const esc = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const imageFiles = readdirSync(imageRoot).filter((name) => name.endsWith('.webp'));
const images = new Map();
for (const id of new Set(products.flatMap((product) => product.imageIds))) {
  const padded = String(id).padStart(3, '0');
  const file = imageFiles.find((name) => name.endsWith(`-${padded}.webp`));
  if (!file) throw new Error(`Missing catalog image ${id}`);
  const [width, height] = execFileSync('identify', ['-format', '%w %h', join(imageRoot, file)], { encoding: 'utf8' }).trim().split(' ').map(Number);
  images.set(id, { src: `/assets/images/catalog/${file}`, width, height });
}

const icon = (name) => {
  const paths = {
    whatsapp: '<path d="M20.52 3.48A11.82 11.82 0 0 0 12.08 0C5.52 0 .18 5.34.18 11.9c0 2.1.55 4.14 1.6 5.94L.08 24l6.3-1.65a11.9 11.9 0 0 0 5.69 1.45h.01c6.56 0 11.9-5.34 11.9-11.9 0-3.18-1.23-6.17-3.46-8.42Zm-8.44 18.31h-.01a9.86 9.86 0 0 1-5.02-1.38l-.36-.21-3.74.98 1-3.64-.24-.37a9.86 9.86 0 1 1 8.37 4.62Zm5.41-7.39c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.76.96-.94 1.16-.17.2-.34.22-.64.07-.3-.15-1.25-.46-2.38-1.47a8.9 8.9 0 0 1-1.65-2.05c-.17-.3-.02-.45.13-.6.13-.13.3-.34.44-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.91-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z"/>',
    phone: '<path d="M6.62 10.79a15.46 15.46 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.61 21 3 13.39 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1.02l-2.2 2.2Z"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    close: '<path d="m18 6-12 12M6 6l12 12"/>',
    arrow: '<path d="m15 18-6-6 6-6"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    check: '<path d="m20 6-11 11-5-5"/>',
  };
  const fill = name === 'whatsapp' ? 'currentColor' : 'none';
  return `<svg viewBox="0 0 24 24" aria-hidden="true" fill="${fill}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths[name]}</svg>`;
};

const wa = (productName = '') => {
  const message = productName
    ? `السلام عليكم، أريد الاستفسار عن ${productName}. أرجو تزويدي بالتوفر والمواصفات وعرض التوريد أو التركيب.`
    : 'السلام عليكم، أريد الاستفسار عن السجاد والموكيت والمفروشات وخدمة التوريد والتركيب.';
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;
};

const header = (active = '') => `
  <div class="offer-bar">خصومات مذهلة على السجاد والموكيت!</div>
  <header class="site-header">
    <div class="header-layout">
      <a class="site-logo" href="/" aria-label="${site.name} - الرئيسية"><img src="/assets/images/original-logo.webp" width="110" height="110" alt="شعار ${site.name}"></a>
      <button class="menu-button" type="button" aria-expanded="false" aria-controls="main-nav" aria-label="فتح القائمة">${icon('menu')}</button>
      <nav id="main-nav" class="main-nav" aria-label="التنقل الرئيسي">
        <a ${active === 'home' ? 'aria-current="page"' : ''} href="/">الرئيسية</a>
        <a ${active === 'catalog' ? 'aria-current="page"' : ''} href="/sjad-alsjad/">تسوق</a>
        <a ${active === 'about' ? 'aria-current="page"' : ''} href="/mfrwshat/">عن الموقع</a>
        <a ${active === 'contact' ? 'aria-current="page"' : ''} href="/mwkyt/">تواصل</a>
      </nav>
      <a class="header-whatsapp" href="${wa()}" target="_blank" rel="noopener" aria-label="الاستفسار عبر واتساب">${icon('whatsapp')}</a>
    </div>
  </header>`;

const footer = () => `
  <footer class="site-footer">
    <div class="footer-layout">
      <div class="footer-brand"><img src="/assets/images/original-logo.webp" width="110" height="110" alt="شعار ${site.name}"><p>لأي استفسارات أو طلبات السجاد والموكيت والمفروشات.</p></div>
      <div><h2>روابط</h2><a href="/">الرئيسية</a><a href="/sjad-alsjad/">تسوق</a><a href="/mfrwshat/">عن الموقع</a><a href="/mwkyt/">تواصل</a></div>
      <div><h2>البريد</h2><a href="mailto:${site.email}">${site.email}</a><h2>الهاتف</h2><a dir="ltr" href="tel:${site.phone}">${site.phone}</a></div>
      <div><h2>الاستفسارات</h2><p>أرسل اسم المنتج وصورة الموقع والمساحة، وسيجيبك الفريق على واتساب.</p><a class="footer-button" href="${wa()}" target="_blank" rel="noopener">إرسال استفسار</a></div>
    </div>
    <div class="copyright">© ${new Date().getFullYear()} ${site.name}. جميع الحقوق محفوظة.</div>
  </footer>
  <a class="floating-whatsapp" href="${wa()}" target="_blank" rel="noopener" aria-label="تواصل عبر واتساب">${icon('whatsapp')}</a>`;

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'HomeAndConstructionBusiness',
  name: site.legalName,
  url: site.origin,
  telephone: site.phone,
  email: site.email,
  address: { '@type': 'PostalAddress', addressLocality: site.city, addressCountry: 'SA' },
  areaServed: { '@type': 'Country', name: 'Saudi Arabia' },
  contactPoint: { '@type': 'ContactPoint', telephone: site.phone, contactType: 'sales', availableLanguage: ['Arabic'] },
};

const head = ({ title, description, path = '/', keywords = [], image, schema = [] }) => {
  const canonical = `${site.origin}${path}`;
  const socialImage = `${site.origin}${image || images.get(2).src}`;
  return `<!doctype html>
<html lang="ar-SA" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  ${keywords.length ? `<meta name="keywords" content="${esc(keywords.join(', '))}">` : ''}
  <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">
  <meta name="theme-color" content="#2A2320">
  <link rel="canonical" href="${canonical}">
  <link rel="alternate" hreflang="ar-SA" href="${canonical}">
  <link rel="alternate" hreflang="x-default" href="${canonical}">
  <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/assets/css/site.css">
  <meta property="og:locale" content="ar_SA">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${site.name}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${socialImage}">
  <meta property="og:image:alt" content="${esc(title)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(description)}">
  <meta name="twitter:image" content="${socialImage}">
  ${[localBusinessSchema, ...schema].map((value) => `<script type="application/ld+json">${JSON.stringify(value).replaceAll('<', '\\u003c')}</script>`).join('\n  ')}
</head>`;
};

const shell = ({ title, description, path, keywords, image, schema, active, body, bodyClass = '' }) => `${head({ title, description, path, keywords, image, schema })}
<body class="${bodyClass}">
  <a class="skip-link" href="#content">انتقل إلى المحتوى</a>
  ${header(active)}
  <main id="content">${body}</main>
  ${footer()}
  <script src="/assets/js/site.js" defer></script>
</body>
</html>`;

const card = (product, index = 0) => {
  const cover = images.get(product.imageIds[0]);
  const search = [product.name, product.category, ...product.tags].join(' ');
  return `<article class="product-card" data-search="${esc(search)}" data-category="${esc(product.category)}">
    <a class="product-image" href="/products/${product.slug}/"><img src="${cover.src}" width="${cover.width}" height="${cover.height}" alt="${esc(product.imageAlt)}" loading="${index < 4 ? 'eager' : 'lazy'}" decoding="async"></a>
    <div class="product-card-content"><p class="product-category">${esc(product.category)}</p><h3><a href="/products/${product.slug}/">${esc(product.cardName)}</a></h3><div class="product-card-links"><a href="/products/${product.slug}/">عرض التفاصيل</a><a class="card-whatsapp" href="${wa(product.cardName)}" target="_blank" rel="noopener" aria-label="الاستفسار عن ${esc(product.cardName)}">${icon('whatsapp')}</a></div></div>
  </article>`;
};

const hero = images.get(76) || images.get(2);
const homeBody = `
  <section class="home-hero">
    <img class="home-hero-image" src="${hero.src}" width="${hero.width}" height="${hero.height}" alt="موكيت وأرضيات لمكاتب وشركات في السعودية" fetchpriority="high">
    <div class="home-hero-shade"></div>
    <div class="home-hero-content">
      <form class="hero-search" action="/sjad-alsjad/" role="search"><label class="sr-only" for="site-search">ابحث عن منتج</label><input id="site-search" name="q" type="search" placeholder="ابحث عن منتج..."><button type="submit" aria-label="بحث">${icon('search')}</button></form>
      <h1>تسوق الآن.. مفروشات موكيت أرضيات</h1>
      <p>أرقى أنواع السجاد في السعودية</p>
      <div class="hero-buttons"><a class="button button-light" href="/sjad-alsjad/">تسوق الآن</a><a class="button button-outline-light" href="/mfrwshat/">اكتشف المزيد</a></div>
    </div>
  </section>
  <section class="products-section">
    <div class="section-title"><p>اختيارات</p><h2>فئات</h2></div>
    <div class="product-grid">${products.map(card).join('')}</div>
  </section>`;

write(join(root, 'index.html'), shell({
  title: 'سجاد وموكيت وأرضيات في السعودية | مفروشات موكيت أرضيات',
  description: 'تسوق موكيت مربعات للمكاتب وفينيل بلجيكي وموكيت مساجد وسجاد وعشب صناعي في السعودية، مع صور واضحة واستفسار مباشر عن التوريد والتركيب عبر واتساب.',
  path: '/',
  keywords: ['موكيت السعودية', 'سجاد الرياض', 'موكيت مكاتب', 'فينيل بلجيكي', 'مفروشات'],
  image: hero.src,
  schema: [{ '@context': 'https://schema.org', '@type': 'WebSite', name: site.name, url: site.origin, inLanguage: 'ar-SA' }],
  active: 'home',
  body: homeBody,
  bodyClass: 'home-page',
}));

const collectionSchema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'تسوق منتجات السجاد والموكيت والأرضيات',
  url: `${site.origin}/sjad-alsjad/`,
  mainEntity: { '@type': 'ItemList', itemListElement: products.map((product, index) => ({ '@type': 'ListItem', position: index + 1, name: product.cardName, url: `${site.origin}/products/${product.slug}/` })) },
};
const catalogBody = `
  <section class="simple-page-head"><div><p>تسوق</p><h1>السجاد والموكيت والأرضيات</h1></div></section>
  <section class="catalog-section"><div class="catalog-tools"><form class="catalog-search" role="search"><label class="sr-only" for="catalog-search">ابحث في المنتجات</label><input id="catalog-search" type="search" placeholder="ابحث في المنتجات..."><span>${icon('search')}</span></form><div class="filter-row"><button class="active" data-filter="all">الكل</button>${[...new Set(products.map((product) => product.category))].map((category) => `<button data-filter="${esc(category)}">${esc(category)}</button>`).join('')}</div></div><div class="product-grid catalog-grid">${products.map(card).join('')}</div><p class="empty-results" hidden>لا توجد منتجات مطابقة لبحثك.</p></section>`;
write(join(root, 'sjad-alsjad', 'index.html'), shell({ title: 'تسوق موكيت وفينيل وسجاد وعشب صناعي في السعودية', description: 'تصفح كتالوج موكيت مربعات وفينيل بلجيكي وموكيت مساجد وسجاد منزلي وعشب صناعي بصور المنتجات وتفاصيلها، ثم استفسر عن المنتج مباشرة عبر واتساب.', path: '/sjad-alsjad/', keywords: ['تسوق موكيت', 'كتالوج سجاد', 'أرضيات السعودية', 'فينيل', 'عشب صناعي'], image: images.get(products[0].imageIds[0]).src, schema: [collectionSchema], active: 'catalog', body: catalogBody }));

const aboutBody = `
  <section class="simple-page-head"><div><p>عن الموقع</p><h1>مفروشات موكيت أرضيات</h1></div></section>
  <section class="content-section about-section"><div class="two-column"><div class="content-image"><img src="${images.get(37).src}" width="${images.get(37).width}" height="${images.get(37).height}" alt="تركيب موكيت مربعات في مكتب" fetchpriority="high"></div><div><p class="kicker">رؤيتنا</p><h2>أرضيات مناسبة لكل مساحة</h2><p>نوفر خيارات مختارة من موكيت المكاتب، الفينيل، موكيت المساجد، السجاد، موكيت الرول والعشب الصناعي للمنازل والشركات والمشروعات.</p><p>يعرض الموقع صور كل خامة واسمها ووصفها الصحيح، مع توضيح الاستخدامات والمواصفات المتاحة. ولأن التوفر ونطاق التركيب يختلفان من مشروع لآخر، يتم الاستفسار مباشرة عبر واتساب من دون أسعار أو سلة شراء.</p><a class="button button-brown" href="${wa()}" target="_blank" rel="noopener">تواصل معنا</a></div></div></section>`;
write(join(root, 'mfrwshat', 'index.html'), shell({ title: 'عن مفروشات موكيت أرضيات | توريد وتركيب في السعودية', description: 'تعرف على موقع مفروشات موكيت أرضيات وخيارات توريد وتركيب موكيت المكاتب والفينيل وموكيت المساجد والسجاد والعشب الصناعي للمنازل والمشروعات.', path: '/mfrwshat/', keywords: ['عن مفروشات موكيت أرضيات', 'توريد موكيت', 'تركيب أرضيات السعودية'], image: images.get(37).src, active: 'about', body: aboutBody }));

const contactBody = `
  <section class="simple-page-head"><div><p>تواصل</p><h1>اتصل بنا</h1></div></section>
  <section class="content-section contact-section"><div class="contact-layout"><div><p class="kicker">لأي استفسارات أو طلبات</p><h2>أرسل تفاصيل المنتج والمساحة</h2><p>يمكنك إرسال رابط المنتج أو صورته، مساحة الموقع، المدينة ونوع الاستخدام. سنراجع التفاصيل ونجيبك عن التوفر والمواصفة وخيارات التوريد أو التركيب.</p><div class="contact-list"><a href="${wa()}" target="_blank" rel="noopener">${icon('whatsapp')}<span><strong>واتساب</strong><small dir="ltr">${site.phone}</small></span></a><a href="tel:${site.phone}">${icon('phone')}<span><strong>الهاتف</strong><small dir="ltr">${site.phone}</small></span></a><a href="mailto:${site.email}"><span class="at">@</span><span><strong>البريد</strong><small>${site.email}</small></span></a></div></div><div class="contact-card"><h2>ابدأ استفسارك</h2><p>زر واتساب يفتح محادثة مباشرة مع رسالة جاهزة.</p><a class="button button-brown full" href="${wa()}" target="_blank" rel="noopener">فتح واتساب ${icon('whatsapp')}</a></div></div></section>`;
write(join(root, 'mwkyt', 'index.html'), shell({ title: 'تواصل مع مفروشات موكيت أرضيات في السعودية عبر واتساب', description: 'تواصل مع مفروشات موكيت أرضيات عبر واتساب أو الاتصال للاستفسار عن موكيت المكاتب والفينيل والسجاد وموكيت المساجد والعشب الصناعي والتوريد والتركيب.', path: '/mwkyt/', keywords: ['واتساب موكيت', 'تواصل مفروشات', 'تركيب موكيت السعودية'], image: hero.src, active: 'contact', body: contactBody }));

for (const product of products) {
  const cover = images.get(product.imageIds[0]);
  const path = `/products/${product.slug}/`;
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    category: product.category,
    image: product.imageIds.map((id) => `${site.origin}${images.get(id).src}`),
    brand: { '@type': 'Brand', name: product.slug.includes('leoline') ? 'Leoline' : site.name },
    url: `${site.origin}${path}`,
  };
  const breadcrumbSchema = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'الرئيسية', item: site.origin }, { '@type': 'ListItem', position: 2, name: 'تسوق', item: `${site.origin}/sjad-alsjad/` }, { '@type': 'ListItem', position: 3, name: product.cardName, item: `${site.origin}${path}` }] };
  const faqSchema = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: product.faq.map(([question, answer]) => ({ '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer } })) };
  const gallery = product.imageIds.map((id, index) => {
    const image = images.get(id);
    const alt = `${product.imageAlt} - صورة ${index + 1}`;
    return `<button class="gallery-item" type="button" data-lightbox="${image.src}" data-alt="${esc(alt)}" aria-label="تكبير الصورة ${index + 1}"><img src="${image.src}" width="${image.width}" height="${image.height}" alt="${esc(alt)}" loading="${index < 3 ? 'eager' : 'lazy'}" decoding="async"></button>`;
  }).join('');
  const related = products.filter((candidate) => candidate.slug !== product.slug).slice(0, 4);
  const body = `
    <nav class="breadcrumbs" aria-label="مسار الصفحة"><a href="/">الرئيسية</a><span>/</span><a href="/sjad-alsjad/">تسوق</a><span>/</span><span>${esc(product.category)}</span></nav>
    <section class="product-main"><div class="product-main-image"><img src="${cover.src}" width="${cover.width}" height="${cover.height}" alt="${esc(product.imageAlt)}" fetchpriority="high"></div><div class="product-main-copy"><p class="product-category">${esc(product.category)}</p><h1>${esc(product.name)}</h1><p class="product-lead">${esc(product.intro)}</p><div class="product-tags">${product.tags.map((tag) => `<span>${esc(tag)}</span>`).join('')}</div><a class="button button-whatsapp" href="${wa(product.cardName)}" target="_blank" rel="noopener">${icon('whatsapp')} الاستفسار عن المنتج</a><p class="inquiry-note">يتم تحديد التوفر والمواصفة ونطاق التوريد أو التركيب عند الاستفسار.</p></div></section>
    <section class="product-description"><div><p class="kicker">تفاصيل المنتج</p><h2>الوصف والمواصفات</h2>${product.paragraphs.map((paragraph) => `<p>${esc(paragraph)}</p>`).join('')}</div><aside><h2>المزايا</h2><ul>${product.features.map((feature) => `<li>${icon('check')} ${esc(feature)}</li>`).join('')}</ul><h2>الاستخدامات</h2><p>${product.applications.map(esc).join('، ')}</p></aside></section>
    <section class="gallery-section"><div class="section-title"><p>صور المنتج</p><h2>الكتالوج والتنفيذ</h2></div><div class="product-gallery">${gallery}</div></section>
    <section class="faq-section"><div class="section-title"><p>أسئلة شائعة</p><h2>معلومات قبل الطلب</h2></div><div class="faq-list">${product.faq.map(([question, answer], index) => `<details ${index === 0 ? 'open' : ''}><summary>${esc(question)}<span>+</span></summary><p>${esc(answer)}</p></details>`).join('')}</div></section>
    <section class="related-section"><div class="section-title"><p>اختيارات</p><h2>منتجات أخرى</h2></div><div class="product-grid">${related.map(card).join('')}</div></section>
    <dialog class="lightbox" aria-label="عرض الصورة المكبرة"><button type="button" class="lightbox-close" aria-label="إغلاق">${icon('close')}</button><img src="${cover.src}" width="${cover.width}" height="${cover.height}" alt="${esc(product.imageAlt)}"><p></p></dialog>`;
  write(join(root, 'products', product.slug, 'index.html'), shell({ title: product.title, description: product.description, path, keywords: product.tags, image: cover.src, schema: [productSchema, breadcrumbSchema, faqSchema], active: 'catalog', body, bodyClass: 'product-page' }));
}

const notFoundDescription = 'الصفحة المطلوبة غير موجودة أو تغيّر رابطها. يمكنك العودة إلى متجر مفروشات موكيت أرضيات وتصفح منتجات الموكيت والفينيل والسجاد ثم الاستفسار عبر واتساب.';
write(join(root, '404.html'), shell({ title: 'الصفحة غير موجودة | مفروشات موكيت أرضيات السعودية', description: notFoundDescription, path: '/404.html', image: hero.src, body: '<section class="not-found"><div><strong>404</strong><h1>الصفحة غير موجودة</h1><p>يمكنك العودة إلى المتجر وتصفح المنتجات المتاحة.</p><a class="button button-brown" href="/sjad-alsjad/">العودة إلى المتجر</a></div></section>' }));

const paths = ['/', '/sjad-alsjad/', '/mfrwshat/', '/mwkyt/', ...products.map((product) => `/products/${product.slug}/`)];
write(join(root, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths.map((path) => `  <url><loc>${site.origin}${path}</loc><lastmod>${new Date().toISOString().slice(0, 10)}</lastmod><changefreq>${path === '/' ? 'weekly' : 'monthly'}</changefreq><priority>${path === '/' ? '1.0' : path.includes('/products/') ? '0.8' : '0.7'}</priority></url>`).join('\n')}\n</urlset>\n`);
write(join(root, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${site.origin}/sitemap.xml\n`);
write(join(root, 'site.webmanifest'), JSON.stringify({ name: site.legalName, short_name: site.name, lang: 'ar-SA', dir: 'rtl', start_url: '/', display: 'standalone', background_color: '#F5EFEA', theme_color: '#2A2320', icons: [{ src: '/assets/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }] }, null, 2));

// Keep legacy product paths useful without changing the visible store structure.
const redirects = ['hand-soap', 'classic-cap', 'creative-course-session', 'face-serum', 'group-fitness-class', 'handmade-vase', 'individual-coaching-session', 'intro-language-tutoring-session', 'set-of-plates', 'sunglasses', 'wooden-chair', 'wool-sweater'];
write(join(root, 'vercel.json'), JSON.stringify({ trailingSlash: true, redirects: redirects.map((source) => ({ source: `/${source}/`, destination: '/sjad-alsjad/', permanent: true })), headers: [{ source: '/assets/(.*)', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] }] }, null, 2));

// Assert the generated pages do not accidentally reintroduce commerce controls.
for (const page of [join(root, 'index.html'), join(root, 'sjad-alsjad', 'index.html'), ...products.map((product) => join(root, 'products', product.slug, 'index.html'))]) {
  const html = readFileSync(page, 'utf8');
  if (/إضافة إلى السلة|add to cart|checkout|ر\.س|ريال/i.test(html)) throw new Error(`Commerce text found in ${page}`);
}

console.log(`Built the restored original layout with ${products.length} products.`);
