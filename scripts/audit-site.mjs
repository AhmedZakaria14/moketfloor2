import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
  if (entry.name === '.git' || entry.name === 'scripts' || entry.name === 'reference-export') return [];
  const path = join(dir, entry.name);
  return entry.isDirectory() ? walk(path) : [path];
});
const htmlFiles = walk(root).filter((path) => path.endsWith('.html'));
const failures = [];
const titles = new Map();
const canonicals = new Map();

const fail = (file, message) => failures.push(`${file.replace(`${root}/`, '')}: ${message}`);
const localTarget = (url) => {
  const clean = url.split(/[?#]/)[0];
  if (clean === '/') return join(root, 'index.html');
  if (clean.endsWith('/')) return join(root, clean, 'index.html');
  const direct = join(root, clean);
  if (existsSync(direct) && statSync(direct).isFile()) return direct;
  return join(root, clean, 'index.html');
};

for (const path of htmlFiles) {
  const file = path.replace(`${root}/`, '');
  const html = readFileSync(path, 'utf8');
  if (!/^<!doctype html>/i.test(html)) fail(file, 'missing doctype');
  if (!/<html lang="ar-SA" dir="rtl">/.test(html)) fail(file, 'missing Arabic RTL root');
  const title = html.match(/<title>(.*?)<\/title>/s)?.[1] || '';
  if (!title) fail(file, 'missing title');
  if (title.length < 28 || title.length > 70) fail(file, `title length ${title.length}`);
  if (titles.has(title)) fail(file, `duplicate title with ${titles.get(title)}`);
  titles.set(title, file);
  const description = html.match(/<meta name="description" content="([^"]*)">/)?.[1] || '';
  if (description.length < 105 || description.length > 180) fail(file, `description length ${description.length}`);
  const canonical = html.match(/<link rel="canonical" href="([^"]+)">/)?.[1] || '';
  if (!canonical.startsWith('https://moketfloor.com/')) fail(file, 'bad canonical');
  if (canonicals.has(canonical)) fail(file, `duplicate canonical with ${canonicals.get(canonical)}`);
  canonicals.set(canonical, file);
  if (!/<meta name="robots" content="index,follow/.test(html)) fail(file, 'page is not indexable');
  const h1Count = (html.match(/<h1(?:\s|>)/g) || []).length;
  if (h1Count !== 1) fail(file, `expected 1 h1, found ${h1Count}`);
  for (const match of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)) {
    try { JSON.parse(match[1]); } catch { fail(file, 'invalid JSON-LD'); }
  }
  for (const match of html.matchAll(/<(?:img|source)[^>]+(?:src|srcset)="([^"]+)"/g)) {
    const url = match[1].split(' ')[0];
    if (url.startsWith('/')) {
      const target = join(root, url);
      if (!existsSync(target)) fail(file, `missing asset ${url}`);
    }
  }
  for (const match of html.matchAll(/<img\s+([^>]+)>/g)) {
    const attrs = match[1];
    if (!/alt="[^"]+"/.test(attrs)) fail(file, 'image missing non-empty alt');
    if (!/width="\d+"/.test(attrs) || !/height="\d+"/.test(attrs)) fail(file, 'image missing dimensions');
  }
  for (const match of html.matchAll(/href="([^"]+)"/g)) {
    const url = match[1];
    if (url.startsWith('/') && !existsSync(localTarget(url))) fail(file, `broken internal link ${url}`);
  }
  if (/\b(?:SAR|ر\.س|ريال)\b/.test(html)) fail(file, 'currency value or label found');
  if (/إضافة إلى السلة|add to cart|checkout|shoppingBag/i.test(html)) fail(file, 'cart or checkout copy found');
}

if (failures.length) {
  console.error(`Audit failed with ${failures.length} issue(s):\n${failures.join('\n')}`);
  process.exit(1);
}

console.log(`Audit passed: ${htmlFiles.length} HTML pages, ${titles.size} unique titles, ${canonicals.size} unique canonicals.`);
