from pathlib import Path
import re

ROOT = Path('/home/ubuntu/moketfloor2')
OLD = 'https://moketfloor2.vercel.app'
NEW = 'https://moketfloor.com'

for path in sorted(ROOT.rglob('*.html')):
    if 'reference-export' in path.parts:
        continue
    text = path.read_text(encoding='utf-8')
    updated = text.replace(OLD, NEW)
    if '<meta name="author"' not in updated:
        updated = updated.replace('</head>', '  <meta name="author" content="مفروشات موكيت أرضيات">\n  <meta name="format-detection" content="telephone=no">\n</head>', 1)
    title = re.search(r'<title>(.*?)</title>', updated, re.S)
    description = re.search(r'<meta name="description" content="([^"]*)">', updated)
    og_image = re.search(r'<meta property="og:image" content="([^"]*)">', updated)
    additions = []
    if title and '<meta name="twitter:title"' not in updated:
        additions.append(f'  <meta name="twitter:title" content="{title.group(1)}">')
    if description and '<meta name="twitter:description"' not in updated:
        additions.append(f'  <meta name="twitter:description" content="{description.group(1)}">')
    if og_image and '<meta name="twitter:image"' not in updated:
        additions.append(f'  <meta name="twitter:image" content="{og_image.group(1)}">')
    if og_image and '<meta property="og:image:alt"' not in updated:
        additions.append('  <meta property="og:image:alt" content="صور منتجات ومشروعات مفروشات موكيت أرضيات">')
    if additions:
        updated = updated.replace('</head>', '\n'.join(additions) + '\n</head>', 1)
    if updated != text:
        path.write_text(updated, encoding='utf-8')

for name in ('robots.txt', 'sitemap.xml'):
    path = ROOT / name
    if path.exists():
        text = path.read_text(encoding='utf-8').replace(OLD, NEW)
        path.write_text(text, encoding='utf-8')
