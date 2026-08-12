import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { products, site } from './catalog-data.mjs';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = resolve(repoRoot, '..', 'media-unique');
const imageRoot = join(repoRoot, 'assets', 'images', 'catalog');

const write = (path, content) => {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, 'utf8');
};

const cleanTargets = [
  join(repoRoot, 'assets', 'images', 'catalog'),
  join(repoRoot, 'products'),
  join(repoRoot, 'sjad-alsjad'),
  join(repoRoot, 'mfrwshat'),
  join(repoRoot, 'mwkyt'),
];
for (const target of cleanTargets) {
  rmSync(target, { recursive: true, force: true });
}
mkdirSync(imageRoot, { recursive: true });

const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const imagePrefix = (id) => {
  if ((id >= 1 && id <= 14) || (id >= 35 && id <= 51) || (id >= 76 && id <= 78)) return 'office-carpet-tiles-50x50';
  if (id >= 15 && id <= 23) return 'artificial-grass';
  if ((id >= 24 && id <= 34) || (id >= 123 && id <= 131)) return 'belgian-leoline-vinyl';
  if (id >= 52 && id <= 100) return 'mosque-prayer-carpet';
  if ([133, 134, 136, 137, 139, 143, 144, 149].includes(id)) return 'antibacterial-facility-vinyl';
  if ([121, 124, 132, 135, 138, 140, 141].includes(id)) return 'wall-to-wall-carpet-roll';
  return 'modern-home-rug';
};

const selectedIds = [...new Set(products.flatMap((product) => product.imageIds))].sort((a, b) => a - b);
const sourceFiles = readdirSync(sourceRoot).filter((name) => name.endsWith('.jpg'));
const images = new Map();

for (const id of selectedIds) {
  const padded = String(id).padStart(3, '0');
  const sourceName = sourceFiles.find((name) => name.startsWith(`${padded}-`));
  if (!sourceName) throw new Error(`Missing source image ${id}`);
  // Two early blobs were published empty and cached immutably by the CDN.
  // Their versioned filenames keep rebuilt media from resolving to that cache.
  const cacheSafeSuffix = [39, 146].includes(id) ? '-fixed' : '';
  const outputName = `${imagePrefix(id)}${cacheSafeSuffix}-${padded}.webp`;
  const source = join(sourceRoot, sourceName);
  const output = join(imageRoot, outputName);
  execFileSync('convert', [source, '-auto-orient', '-strip', '-resize', '1400x1400>', '-quality', '82', output]);
  const [width, height] = execFileSync('identify', ['-format', '%w %h', output], { encoding: 'utf8' }).trim().split(' ').map(Number);
  images.set(id, { src: `/assets/images/catalog/${outputName}`, width, height });
}

const icon = (name) => {
  const paths = {
    whatsapp: '<path d="M20.52 3.48A11.82 11.82 0 0 0 12.08 0C5.52 0 .18 5.34.18 11.9c0 2.1.55 4.14 1.6 5.94L.08 24l6.3-1.65a11.9 11.9 0 0 0 5.69 1.45h.01c6.56 0 11.9-5.34 11.9-11.9 0-3.18-1.23-6.17-3.46-8.42Zm-8.44 18.31h-.01a9.86 9.86 0 0 1-5.02-1.38l-.36-.21-3.74.98 1-3.64-.24-.37a9.86 9.86 0 1 1 8.37 4.62Zm5.41-7.39c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.76.96-.94 1.16-.17.2-.34.22-.64.07-.3-.15-1.25-.46-2.38-1.47a8.9 8.9 0 0 1-1.65-2.05c-.17-.3-.02-.45.13-.6.13-.13.3-.34.44-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.91-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z"/>',
    phone: '<path d="M6.62 10.79a15.46 15.46 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.61 21 3 13.39 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1.02l-2.2 2.2Z"/>',
    arrow: '<path d="m15 18-6-6 6-6"/><path d="M9 12h12"/>',
    check: '<path d="m20 6-11 11-5-5"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    ruler: '<path d="M4 18 18 4l2 2L6 20l-2-2Z"/><path d="m14 8 2 2M11 11l2 2M8 14l2 2"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    close: '<path d="m18 6-12 12M6 6l12 12"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  };
  const fill = name === 'whatsapp' ? 'currentColor' : 'none';
  return `<svg viewBox="0 0 24 24" aria-hidden="true" fill="${fill}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths[name]}</svg>`;
};

const waLink = (productName = '') => {
  const message = productName
    ? `السلام عليكم، أريد الاستفسار عن ${productName}. أرجو تزويدي بالتوفر والمواصفات وعرض التوريد أو التركيب.`
    : 'السلام عليكم، أريد الاستفسار عن منتجات موكيت للأرضيات وخدمة التوريد والتركيب.';
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;
};

const header = (active = '') => `
  <div class="topbar"><div class="container topbar-inner"><span>توريد وتركيب أرضيات في الرياض</span><a href="tel:${site.phone}">${site.phone.replace('+966', '0')}</a></div></div>
  <header class="site-header">
    <div class="container header-inner">
      <a class="brand" href="/" aria-label="${site.name} - الرئيسية">
        <span class="brand-mark" aria-hidden="true"><i></i><i></i><i></i></span>
        <span><strong>موكيت</strong><small>للأرضيات والمفروشات</small></span>
      </a>
      <button class="menu-button" type="button" aria-expanded="false" aria-controls="main-nav" aria-label="فتح القائمة">${icon('menu')}</button>
      <nav id="main-nav" class="main-nav" aria-label="التنقل الرئيسي">
        <a ${active === 'home' ? 'aria-current="page"' : ''} href="/">الرئيسية</a>
        <a ${active === 'catalog' ? 'aria-current="page"' : ''} href="/sjad-alsjad/">المنتجات</a>
        <a ${active === 'about' ? 'aria-current="page"' : ''} href="/mfrwshat/">من نحن</a>
        <a ${active === 'contact' ? 'aria-current="page"' : ''} href="/mwkyt/">اتصل بنا</a>
        <a class="nav-cta" href="${waLink()}" target="_blank" rel="noopener">${icon('whatsapp')} استفسار واتساب</a>
      </nav>
    </div>
  </header>`;

const footer = () => `
  <footer class="site-footer">
    <div class="container footer-grid">
      <div>
        <a class="brand brand-footer" href="/"><span class="brand-mark"><i></i><i></i><i></i></span><span><strong>موكيت</strong><small>للأرضيات والمفروشات</small></span></a>
        <p>حلول أرضيات مختارة للمكاتب والمنازل والمساجد والمرافق، مع استفسار مباشر عن التوفر والتوريد والتركيب.</p>
      </div>
      <div><h2>روابط سريعة</h2><a href="/sjad-alsjad/">جميع المنتجات</a><a href="/mfrwshat/">عن المؤسسة</a><a href="/mwkyt/">وسائل التواصل</a><a href="/sitemap.xml">خريطة الموقع</a></div>
      <div><h2>أهم الأقسام</h2><a href="/products/carpet-tiles-50x50-offices/">موكيت مربعات</a><a href="/products/belgian-leoline-vinyl-wood/">فينيل بلجيكي</a><a href="/products/mosque-carpet-prayer-lines/">موكيت مساجد</a><a href="/products/artificial-grass-gardens-playgrounds/">عشب صناعي</a></div>
      <div><h2>تواصل معنا</h2><a dir="ltr" href="tel:${site.phone}">${site.phone}</a><a href="mailto:${site.email}">${site.email}</a><span>${site.city}، ${site.country}</span></div>
    </div>
    <div class="container copyright"><span>© ${new Date().getFullYear()} ${site.legalName}. جميع الحقوق محفوظة.</span><span>لا تُعرض أسعار ثابتة؛ يُجهز العرض حسب الصنف والمساحة.</span></div>
  </footer>
  <div class="floating-actions" aria-label="تواصل سريع">
    <a class="float-call" href="tel:${site.phone}" aria-label="اتصل بنا">${icon('phone')}</a>
    <a class="float-whatsapp" href="${waLink()}" target="_blank" rel="noopener" aria-label="استفسر عبر واتساب">${icon('whatsapp')}<span>استفسر الآن</span></a>
  </div>`;

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
  const socialImage = image ? `${site.origin}${image}` : `${site.origin}${images.get(2).src}`;
  const schemas = [localBusinessSchema, ...schema];
  return `<!doctype html>
<html lang="ar-SA" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  ${keywords.length ? `<meta name="keywords" content="${escapeHtml(keywords.join(', '))}">` : ''}
  <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">
  <meta name="theme-color" content="#0f172a">
  <link rel="canonical" href="${canonical}">
  <link rel="alternate" hreflang="ar-SA" href="${canonical}">
  <link rel="alternate" hreflang="x-default" href="${canonical}">
  <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@400;500;600;700;800&family=Noto+Sans+Arabic:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/assets/css/site.css">
  <meta property="og:locale" content="ar_SA">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${site.name}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${socialImage}">
  <meta property="og:image:alt" content="${escapeHtml(title)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${socialImage}">
  ${schemas.map((item) => `<script type="application/ld+json">${JSON.stringify(item).replaceAll('<', '\\u003c')}</script>`).join('\n  ')}
</head>`;
};

const productCard = (product, index = 0) => {
  const cover = images.get(product.imageIds[0]);
  return `<article class="product-card reveal">
    <a class="product-image" href="/products/${product.slug}/" aria-label="${escapeHtml(product.cardName)}">
      <img src="${cover.src}" width="${cover.width}" height="${cover.height}" alt="${escapeHtml(product.imageAlt)}" loading="${index < 3 ? 'eager' : 'lazy'}" decoding="async">
      <span>${escapeHtml(product.category)}</span>
    </a>
    <div class="product-card-body">
      <h3><a href="/products/${product.slug}/">${escapeHtml(product.cardName)}</a></h3>
      <p>${escapeHtml(product.intro)}</p>
      <div class="card-actions"><a class="text-link" href="/products/${product.slug}/">شاهد التفاصيل ${icon('arrow')}</a><a class="icon-whatsapp" href="${waLink(product.cardName)}" target="_blank" rel="noopener" aria-label="استفسر عن ${escapeHtml(product.cardName)}">${icon('whatsapp')}</a></div>
    </div>
  </article>`;
};

const pageShell = ({ title, description, path, keywords, image, schema, active, body, bodyClass = '' }) => `${head({ title, description, path, keywords, image, schema })}
<body class="${bodyClass}">
  <a class="skip-link" href="#content">انتقل إلى المحتوى</a>
  ${header(active)}
  <main id="content">${body}</main>
  ${footer()}
  <script src="/assets/js/site.js" defer></script>
</body>
</html>`;

const homeSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: site.name,
  url: site.origin,
  inLanguage: 'ar-SA',
};

const heroImage = images.get(2);
const homeBody = `
  <section class="home-hero">
    <img class="hero-bg" src="${heroImage.src}" width="${heroImage.width}" height="${heroImage.height}" alt="موكيت مربعات مركب في مكتب بالرياض" fetchpriority="high">
    <div class="hero-overlay"></div>
    <div class="container hero-content">
      <span class="eyebrow light">حلول أرضيات للمشروعات والمنازل</span>
      <h1>موكيت وأرضيات مختارة<br><em>للمساحة التي تعمل وتعيش فيها</em></h1>
      <p>موكيت مربعات للمكاتب، فينيل بلجيكي، موكيت مساجد، سجاد وعشب صناعي — بصور المنتجات الفعلية واستفسار مباشر عن التوفر والتركيب.</p>
      <div class="hero-actions"><a class="button button-whatsapp" href="${waLink()}" target="_blank" rel="noopener">${icon('whatsapp')} استفسر عبر واتساب</a><a class="button button-ghost" href="/sjad-alsjad/">تصفح الكتالوج ${icon('arrow')}</a></div>
      <ul class="hero-points"><li>${icon('check')} صور عينات حقيقية</li><li>${icon('check')} اختيار حسب الاستخدام</li><li>${icon('check')} خدمة الرياض والمشروعات</li></ul>
    </div>
  </section>

  <section class="trust-strip"><div class="container trust-grid"><div>${icon('grid')}<span><strong>كتالوج منظم</strong><small>كل خامة في صفحتها الصحيحة</small></span></div><div>${icon('ruler')}<span><strong>عرض حسب المشروع</strong><small>المساحة والخامة والتركيب</small></span></div><div>${icon('shield')}<span><strong>مواصفة واضحة</strong><small>تأكيد الصنف قبل التوريد</small></span></div></div></section>

  <section class="section section-products">
    <div class="container">
      <div class="section-heading"><div><span class="eyebrow">تشكيلة الأرضيات</span><h2>اختر الحل الأقرب لمشروعك</h2></div><p>استبدلنا المنتجات العشوائية بكتالوج مصنف من الصور المرفقة، مع وصف مخصص لكل نوع ومن دون أسعار أو سلة شراء.</p></div>
      <div class="product-grid">${products.map(productCard).join('')}</div>
      <div class="center"><a class="button button-dark" href="/sjad-alsjad/">عرض جميع المنتجات ${icon('arrow')}</a></div>
    </div>
  </section>

  <section class="section project-band">
    <div class="container project-grid">
      <div><span class="eyebrow light">قبل طلب العرض</span><h2>أرسل 3 معلومات لنبدأ بدقة</h2><p>صورة الأرضية الحالية، أبعاد المساحة، والمدينة. وإذا اخترت تصميمًا من الموقع أرسل رقم الصورة أو رابط الصفحة.</p><a class="button button-whatsapp" href="${waLink()}" target="_blank" rel="noopener">${icon('whatsapp')} إرسال تفاصيل المشروع</a></div>
      <ol><li><span>01</span><div><strong>حدد المنتج</strong><small>أرسل رابط الصفحة أو صورة التصميم</small></div></li><li><span>02</span><div><strong>شارك المقاسات</strong><small>الطول والعرض أو مخطط المشروع</small></div></li><li><span>03</span><div><strong>استلم الترشيح</strong><small>تأكيد العينة والمواصفة ونطاق العمل</small></div></li></ol>
    </div>
  </section>

  <section class="section">
    <div class="container editorial-grid">
      <div class="editorial-image"><img src="${images.get(37).src}" width="${images.get(37).width}" height="${images.get(37).height}" alt="تركيب موكيت مربعات هندسي في مكتب" loading="lazy"></div>
      <div><span class="eyebrow">اختيار مهني</span><h2>الأرضية الصحيحة تبدأ من الاستخدام، لا من اللون فقط</h2><p>مساحة مكتبية مزدحمة تختلف عن غرفة منزلية، والمصلى يحتاج توزيع صفوف دقيقًا، والفينيل للمرافق يحتاج مواصفة موثقة. لذلك بنينا كل صفحة حول الاستخدام الفعلي والصور المتاحة.</p><ul class="check-list"><li>${icon('check')} كلمات وصف واضحة بدل الوسوم العشوائية</li><li>${icon('check')} صور مضغوطة بصيغة WebP مع نص بديل عربي</li><li>${icon('check')} استفسار واتساب مخصص باسم المنتج</li><li>${icon('check')} صفحات قابلة للفهرسة داخل خريطة الموقع</li></ul><a class="text-link" href="/mfrwshat/">اعرف المزيد عن طريقة العمل ${icon('arrow')}</a></div>
    </div>
  </section>

  <section class="section cta-section"><div class="container cta-box"><div><span class="eyebrow light">هل لديك مساحة جاهزة للقياس؟</span><h2>أرسل الصور والمقاسات على واتساب</h2><p>سنراجع نوع الاستخدام ونقترح أقرب خامة وصورة من الكتالوج.</p></div><a class="button button-light" href="${waLink()}" target="_blank" rel="noopener">ابدأ الاستفسار ${icon('whatsapp')}</a></div></section>`;

write(join(repoRoot, 'index.html'), pageShell({
  title: 'موكيت للأرضيات بالرياض | موكيت مكاتب وفينيل وسجاد',
  description: 'موكيت مربعات للمكاتب، فينيل بلجيكي، موكيت مساجد، سجاد وعشب صناعي في الرياض. شاهد صور المنتجات واستفسر عن التوريد والتركيب عبر واتساب.',
  path: '/', keywords: ['موكيت الرياض', 'موكيت مكاتب', 'فينيل بلجيكي', 'موكيت مساجد', 'عشب صناعي'], image: heroImage.src, schema: [homeSchema], active: 'home', body: homeBody,
}));

const collectionSchema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'منتجات موكيت للأرضيات',
  url: `${site.origin}/sjad-alsjad/`,
  mainEntity: { '@type': 'ItemList', itemListElement: products.map((product, index) => ({ '@type': 'ListItem', position: index + 1, url: `${site.origin}/products/${product.slug}/`, name: product.cardName })) },
};
const catalogBody = `
  <section class="page-hero"><div class="container"><nav class="breadcrumbs" aria-label="مسار الصفحة"><a href="/">الرئيسية</a><span>/</span><span aria-current="page">المنتجات</span></nav><span class="eyebrow light">كتالوج المنتجات</span><h1>أرضيات مصنفة بصور حقيقية</h1><p>تصفح المنتجات حسب الاستخدام. لا توجد أسعار أو سلة؛ كل استفسار يفتح واتساب برسالة تحمل اسم المنتج.</p></div></section>
  <section class="section"><div class="container"><div class="filter-row" role="group" aria-label="تصفية المنتجات"><button class="active" data-filter="all">الكل</button>${[...new Set(products.map((p) => p.category))].map((category) => `<button data-filter="${escapeHtml(category)}">${escapeHtml(category)}</button>`).join('')}</div><div class="product-grid catalog-grid">${products.map((p, i) => `<div data-category="${escapeHtml(p.category)}">${productCard(p, i)}</div>`).join('')}</div></div></section>
  <section class="section compact-cta"><div class="container cta-box"><div><h2>لم تجد التصميم المطلوب؟</h2><p>أرسل صورة مرجعية والمساحة لنبحث عن أقرب عينة متاحة.</p></div><a class="button button-light" href="${waLink()}" target="_blank" rel="noopener">استفسر على واتساب ${icon('whatsapp')}</a></div></section>`;
write(join(repoRoot, 'sjad-alsjad', 'index.html'), pageShell({ title: 'كتالوج موكيت وفينيل وسجاد وعشب صناعي بالرياض', description: 'كتالوج موكيت مربعات وفينيل بلجيكي وموكيت مساجد وسجاد منزلي وعشب صناعي بصور المنتجات الفعلية. استفسر عن المواصفة والتوريد عبر واتساب.', path: '/sjad-alsjad/', keywords: ['كتالوج موكيت', 'أرضيات الرياض', 'فينيل', 'سجاد', 'عشب صناعي'], image: images.get(products[0].imageIds[0]).src, schema: [collectionSchema], active: 'catalog', body: catalogBody }));

const aboutBody = `
  <section class="page-hero"><div class="container"><nav class="breadcrumbs"><a href="/">الرئيسية</a><span>/</span><span>من نحن</span></nav><span class="eyebrow light">${site.legalName}</span><h1>اختيار أرضيات أوضح للمنازل والمشروعات</h1><p>نعرض صور العينات كما هي، ونفصل بين نوع الخامة والمواصفة والتطبيق حتى يصل استفسارك إلى المنتج الصحيح.</p></div></section>
  <section class="section"><div class="container editorial-grid about-grid"><div class="editorial-image"><img src="${images.get(76).src}" width="${images.get(76).width}" height="${images.get(76).height}" alt="تنفيذ موكيت مربعات في مساحة مكتبية" fetchpriority="high"></div><div><span class="eyebrow">عن المؤسسة</span><h2>من الكتالوج إلى التنفيذ</h2><p>نعمل في توريد وتركيب حلول الأرضيات والمفروشات في الرياض والمشروعات داخل المملكة حسب نطاق العمل. تشمل التشكيلة موكيت المكاتب، الفينيل، موكيت المساجد، السجاد، موكيت الرول والعشب الصناعي.</p><p>هدف الموقع أن يختصر مرحلة الاختيار: صورة واضحة، اسم دقيق، استخدامات مناسبة وزر استفسار يرسل اسم المنتج مباشرة. أما المواصفات المتغيرة مثل السماكة وطبقة الاستخدام والتوفر فتُثبت مع كود العينة قبل اعتماد العرض.</p><ul class="check-list"><li>${icon('check')} تصنيف الصور حسب الخامة الحقيقية</li><li>${icon('check')} قياس وحساب كمية المشروع</li><li>${icon('check')} توريد أو توريد وتركيب</li><li>${icon('check')} تواصل مباشر من دون سلة أو دفع إلكتروني</li></ul></div></div></section>
  <section class="section values-section"><div class="container"><div class="section-heading"><div><span class="eyebrow">ما الذي نلتزم به</span><h2>وضوح قبل التوريد</h2></div></div><div class="value-grid"><article>${icon('search')}<h3>مطابقة الصورة</h3><p>تحديد رقم الصورة أو كود العينة لتقليل الالتباس بين الألوان والتصاميم.</p></article><article>${icon('shield')}<h3>تأكيد المواصفة</h3><p>الخصائص الفنية تُراجع مع الصنف المعتمد، خصوصًا للمرافق والمشروعات.</p></article><article>${icon('ruler')}<h3>حساب واقعي</h3><p>العرض يعتمد على المساحة والهدر وتجهيز السطح ونطاق التركيب.</p></article></div></div></section>
  <section class="section compact-cta"><div class="container cta-box"><div><h2>ابدأ بصورة ومساحة</h2><p>أرسل تفاصيل موقعك وسنوجهك إلى القسم والعينة المناسبة.</p></div><a class="button button-light" href="${waLink()}" target="_blank" rel="noopener">تواصل عبر واتساب ${icon('whatsapp')}</a></div></section>`;
write(join(repoRoot, 'mfrwshat', 'index.html'), pageShell({ title: 'من نحن | مؤسسة موكيت للأرضيات في الرياض', description: 'تعرف على مؤسسة موكيت للأرضيات وخدمات اختيار وتوريد وتركيب موكيت المكاتب والفينيل وموكيت المساجد والسجاد والعشب الصناعي في الرياض.', path: '/mfrwshat/', keywords: ['مؤسسة موكيت للأرضيات', 'تركيب موكيت الرياض', 'توريد أرضيات'], image: images.get(76).src, active: 'about', body: aboutBody }));

const contactBody = `
  <section class="page-hero"><div class="container"><nav class="breadcrumbs"><a href="/">الرئيسية</a><span>/</span><span>اتصل بنا</span></nav><span class="eyebrow light">تواصل مباشر</span><h1>أرسل تفاصيل الأرضية على واتساب</h1><p>لرد أسرع أرسل رابط المنتج، صورة الموقع، المقاسات والمدينة.</p></div></section>
  <section class="section"><div class="container contact-grid"><div class="contact-panel"><span class="eyebrow">بيانات التواصل</span><h2>نحن في خدمتك</h2><p>الرياض، المملكة العربية السعودية. تُراجع طلبات المدن والمشروعات الأخرى حسب نطاق العمل.</p><a class="contact-method primary" href="${waLink()}" target="_blank" rel="noopener">${icon('whatsapp')}<span><strong>واتساب</strong><small dir="ltr">${site.phone}</small></span></a><a class="contact-method" href="tel:${site.phone}">${icon('phone')}<span><strong>اتصال</strong><small dir="ltr">${site.phone}</small></span></a><a class="contact-method" href="mailto:${site.email}"><span class="at-icon">@</span><span><strong>البريد الإلكتروني</strong><small>${site.email}</small></span></a></div><div class="inquiry-guide"><h2>ماذا ترسل في الاستفسار؟</h2><ol><li><span>1</span><div><strong>المنتج أو الصورة</strong><small>رابط الصفحة أو لقطة التصميم</small></div></li><li><span>2</span><div><strong>المساحة</strong><small>الطول × العرض أو المخطط</small></div></li><li><span>3</span><div><strong>نوع الاستخدام</strong><small>مكتب، منزل، مسجد، مرفق أو حديقة</small></div></li><li><span>4</span><div><strong>الموقع</strong><small>المدينة والحي وحالة الأرضية الحالية</small></div></li></ol><a class="button button-whatsapp wide" href="${waLink()}" target="_blank" rel="noopener">${icon('whatsapp')} فتح محادثة واتساب</a></div></div></section>`;
write(join(repoRoot, 'mwkyt', 'index.html'), pageShell({ title: 'اتصل بنا | موكيت للأرضيات بالرياض', description: 'تواصل مع موكيت للأرضيات في الرياض عبر واتساب أو الاتصال للاستفسار عن موكيت المكاتب والفينيل والسجاد وموكيت المساجد والعشب الصناعي.', path: '/mwkyt/', keywords: ['واتساب موكيت الرياض', 'اتصال موكيت للأرضيات', 'طلب تركيب أرضيات'], image: images.get(2).src, active: 'contact', body: contactBody }));

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
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: site.origin },
      { '@type': 'ListItem', position: 2, name: 'المنتجات', item: `${site.origin}/sjad-alsjad/` },
      { '@type': 'ListItem', position: 3, name: product.cardName, item: `${site.origin}${path}` },
    ],
  };
  const faqSchema = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: product.faq.map(([question, answer]) => ({ '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer } })) };
  const gallery = product.imageIds.map((id, index) => {
    const image = images.get(id);
    const alt = `${product.imageAlt} – صورة ${index + 1}`;
    return `<button class="gallery-item" type="button" data-lightbox="${image.src}" data-alt="${escapeHtml(alt)}" aria-label="تكبير ${escapeHtml(alt)}"><img src="${image.src}" width="${image.width}" height="${image.height}" alt="${escapeHtml(alt)}" loading="${index < 4 ? 'eager' : 'lazy'}" decoding="async"><span>عرض الصورة</span></button>`;
  }).join('');
  const related = products.filter((candidate) => candidate.slug !== product.slug && (candidate.category === product.category || candidate.tags.some((tag) => product.tags.includes(tag)))).slice(0, 3);
  const relatedProducts = (related.length >= 3 ? related : products.filter((candidate) => candidate.slug !== product.slug).slice(0, 3)).map(productCard).join('');
  const body = `
    <section class="product-hero"><div class="container"><nav class="breadcrumbs"><a href="/">الرئيسية</a><span>/</span><a href="/sjad-alsjad/">المنتجات</a><span>/</span><span>${escapeHtml(product.category)}</span></nav><div class="product-hero-grid"><div class="product-hero-image"><img src="${cover.src}" width="${cover.width}" height="${cover.height}" alt="${escapeHtml(product.imageAlt)}" fetchpriority="high"><span>${escapeHtml(product.category)}</span></div><div class="product-hero-copy"><span class="eyebrow">استفسار وتوريد حسب المشروع</span><h1>${escapeHtml(product.name)}</h1><p class="lead">${escapeHtml(product.intro)}</p><div class="product-tags">${product.tags.slice(0, 5).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}</div><div class="product-actions"><a class="button button-whatsapp" href="${waLink(product.cardName)}" target="_blank" rel="noopener">${icon('whatsapp')} استفسر عن هذا المنتج</a><a class="button button-outline" href="tel:${site.phone}">${icon('phone')} اتصال مباشر</a></div><p class="price-note">لا نعرض سعرًا ثابتًا؛ يُجهز العرض حسب الصنف والمساحة ونطاق التركيب.</p></div></div></div></section>
    <section class="section product-details"><div class="container details-grid"><article><span class="eyebrow">وصف المنتج</span><h2>المواصفات والاستخدام المناسب</h2>${product.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}</article><aside><h2>أبرز المزايا</h2><ul class="feature-list">${product.features.map((feature) => `<li>${icon('check')} ${escapeHtml(feature)}</li>`).join('')}</ul><h2>الاستخدامات</h2><div class="application-tags">${product.applications.map((application) => `<span>${escapeHtml(application)}</span>`).join('')}</div></aside></div></section>
    <section class="section gallery-section"><div class="container"><div class="section-heading"><div><span class="eyebrow">صور المنتج</span><h2>معرض العينات والتنفيذ</h2></div><p>اضغط على أي صورة لتكبيرها، ثم أرسل رقمها أو رابط الصفحة عند الاستفسار.</p></div><div class="product-gallery">${gallery}</div></div></section>
    <section class="section faq-section"><div class="container narrow"><div class="section-heading"><div><span class="eyebrow">أسئلة شائعة</span><h2>قبل الاستفسار</h2></div></div><div class="faq-list">${product.faq.map(([question, answer], index) => `<details ${index === 0 ? 'open' : ''}><summary>${escapeHtml(question)}<span>+</span></summary><p>${escapeHtml(answer)}</p></details>`).join('')}</div></div></section>
    <section class="section product-inquiry"><div class="container cta-box"><div><span class="eyebrow light">${escapeHtml(product.cardName)}</span><h2>أرسل المساحة وصورة الموقع</h2><p>ستفتح رسالة واتساب باسم هذا المنتج لتسهيل متابعة التوفر والمواصفة.</p></div><a class="button button-light" href="${waLink(product.cardName)}" target="_blank" rel="noopener">استفسر عن المنتج ${icon('whatsapp')}</a></div></section>
    <section class="section related-section"><div class="container"><div class="section-heading"><div><span class="eyebrow">منتجات مرتبطة</span><h2>قد يناسبك أيضًا</h2></div></div><div class="product-grid">${relatedProducts}</div></div></section>
    <dialog class="lightbox" aria-label="عرض الصورة المكبرة"><button type="button" class="lightbox-close" aria-label="إغلاق">${icon('close')}</button><img src="${cover.src}" width="${cover.width}" height="${cover.height}" alt="${escapeHtml(product.imageAlt)}"><p></p></dialog>`;
  write(join(repoRoot, 'products', product.slug, 'index.html'), pageShell({ title: product.title, description: product.description, path, keywords: product.tags, image: cover.src, schema: [productSchema, breadcrumbSchema, faqSchema], active: 'catalog', body, bodyClass: 'product-page' }));
}

const notFound = `${head({ title: 'الصفحة غير موجودة | موكيت للأرضيات', description: 'الصفحة المطلوبة غير موجودة أو انتقل رابطها. تصفح كتالوج موكيت للأرضيات في الرياض واختر موكيت المكاتب أو الفينيل أو السجاد المناسب.', path: '/404.html', image: images.get(2).src })}<body>${header()}<main id="content"><section class="not-found"><div class="container"><span>404</span><h1>هذه الصفحة غير موجودة</h1><p>قد يكون الرابط قديمًا. انتقل إلى كتالوج المنتجات المصنف.</p><a class="button button-dark" href="/sjad-alsjad/">تصفح المنتجات ${icon('arrow')}</a></div></section></main>${footer()}<script src="/assets/js/site.js" defer></script></body></html>`;
write(join(repoRoot, '404.html'), notFound);

const sitemapPaths = ['/', '/sjad-alsjad/', '/mfrwshat/', '/mwkyt/', ...products.map((product) => `/products/${product.slug}/`)];
write(join(repoRoot, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapPaths.map((path) => `  <url><loc>${site.origin}${path}</loc><lastmod>${new Date().toISOString().slice(0, 10)}</lastmod><changefreq>${path === '/' ? 'weekly' : 'monthly'}</changefreq><priority>${path === '/' ? '1.0' : path.includes('/products/') ? '0.8' : '0.7'}</priority></url>`).join('\n')}\n</urlset>\n`);
write(join(repoRoot, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${site.origin}/sitemap.xml\n`);
write(join(repoRoot, 'site.webmanifest'), JSON.stringify({ name: site.legalName, short_name: site.name, lang: 'ar-SA', dir: 'rtl', start_url: '/', display: 'standalone', background_color: '#f8fafc', theme_color: '#0f172a', icons: [{ src: '/assets/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }] }, null, 2));

const redirects = ['hand-soap', 'classic-cap', 'creative-course-session', 'face-serum', 'group-fitness-class', 'handmade-vase', 'individual-coaching-session', 'intro-language-tutoring-session', 'set-of-plates', 'sunglasses', 'wooden-chair', 'wool-sweater'];
write(join(repoRoot, 'vercel.json'), JSON.stringify({ trailingSlash: true, redirects: redirects.map((source) => ({ source: `/${source}/`, destination: '/sjad-alsjad/', permanent: true })), headers: [{ source: '/assets/(.*)', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] }, { source: '/(.*).html', headers: [{ key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' }] }] }, null, 2));
write(join(repoRoot, '.nojekyll'), '');
write(join(repoRoot, 'README.md'), `# Moket Floor\n\nStatic Arabic RTL product catalogue for ${site.legalName}.\n\n- Product pages with Saudi-focused metadata and structured data\n- WebP images sourced from the supplied catalogue\n- WhatsApp enquiries instead of prices, cart or checkout\n- Sitemap, robots.txt, canonical URLs and responsive layout\n`);

write(join(repoRoot, 'assets', 'favicon.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#0f172a"/><path d="M13 45V19h8l11 15 11-15h8v26h-8V31L32 46 21 31v14z" fill="#38bdf8"/></svg>`);

console.log(`Built ${products.length} product pages with ${selectedIds.length} optimized images.`);

// The catalogue builder owns image optimisation; the original-layout builder
// always runs last so rebuilding product media cannot replace the site design.
await import('./build-original-layout.mjs');
