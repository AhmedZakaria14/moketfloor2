(async () => {
  const response = await fetch('/assets/js/cart-products.json');
  if (!response.ok) return;
  const catalog = await response.json();
  const key = 'moketfloor-order-v1';
  let items = {};
  const load = () => {
    try {
      const stored = JSON.parse(localStorage.getItem(key) || '{}');
      items = Object.fromEntries(catalog.products.filter(p => Number.isInteger(stored?.[p.id]) && stored[p.id] > 0).map(p => [p.id, Math.min(999, stored[p.id])]));
    } catch { items = {}; }
  };
  load();
  const dialog = document.createElement('dialog');
  dialog.className = 'order-cart';
  dialog.setAttribute('aria-labelledby', 'cart-title');
  dialog.innerHTML = `<div class="cart-heading"><h2 id="cart-title">سلة الطلب</h2><button type="button" data-close-cart aria-label="إغلاق سلة الطلب">×</button></div><div class="cart-items"></div><p class="cart-note">الأسعار والتوفر والتوريد أو التركيب تُؤكد مع فريق المبيعات بعد إرسال الطلب.</p><label for="cart-notes">المساحة والمدينة أو ملاحظات الطلب (اختياري)</label><textarea id="cart-notes" rows="3" maxlength="1500" placeholder="مثال: الرياض، مساحة 50 مترًا مربعًا"></textarea><a class="button button-brown cart-submit" target="_blank" rel="noopener">إرسال الطلب عبر واتساب</a><button class="cart-continue" type="button" data-close-cart>متابعة التسوق</button>`;
  document.body.append(dialog);
  const status = document.createElement('p');
  status.className = 'cart-status';
  status.setAttribute('role', 'status');
  document.body.append(status);
  const container = dialog.querySelector('.cart-items');
  const submit = dialog.querySelector('.cart-submit');
  const notes = dialog.querySelector('textarea');
  const updateLink = () => {
    const selected = catalog.products.filter(p => items[p.id]);
    submit.hidden = selected.length === 0;
    const lines = selected.map((p, i) => `${i + 1}. ${p.name} — الكمية: ${items[p.id]}\n${location.origin}/products/${p.id}/`);
    submit.href = `https://wa.me/${catalog.whatsapp}?text=${encodeURIComponent('السلام عليكم، أود طلب المنتجات التالية:\n\n' + lines.join('\n\n') + (notes.value.trim() ? '\n\nملاحظات: ' + notes.value.trim() : '') + '\n\nيرجى تأكيد السعر والتوفر.')}`;
  };
  const render = () => {
    const count = Object.values(items).reduce((sum, n) => sum + n, 0);
    document.querySelectorAll('[data-cart-count]').forEach(el => { el.textContent = count; });
    container.replaceChildren();
    const selected = catalog.products.filter(p => items[p.id]);
    if (!selected.length) {
      const empty = document.createElement('p'); empty.className = 'cart-empty'; empty.textContent = 'سلتك فارغة. أضف المنتجات التي تريد طلبها.'; container.append(empty);
    }
    selected.forEach(p => {
      const row = document.createElement('article'); row.className = 'cart-item';
      const img = document.createElement('img'); img.src = p.image; img.alt = p.name; img.width = 80; img.height = 80;
      const details = document.createElement('div');
      const title = document.createElement('h3'); title.textContent = p.name;
      const label = document.createElement('label'); label.textContent = 'الكمية ';
      const input = document.createElement('input'); input.type = 'number'; input.min = '1'; input.max = '999'; input.step = '1'; input.value = items[p.id]; input.setAttribute('aria-label', `كمية ${p.name}`);
      input.addEventListener('change', () => { items[p.id] = Math.max(1, Math.min(999, Math.trunc(Number(input.value)) || 1)); save(); render(); });
      label.append(input);
      const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'cart-remove'; remove.textContent = 'حذف'; remove.setAttribute('aria-label', `حذف ${p.name}`);
      remove.addEventListener('click', () => { delete items[p.id]; save(); render(); });
      details.append(title, label, remove); row.append(img, details); container.append(row);
    });
    updateLink();
  };
  const save = () => { try { localStorage.setItem(key, JSON.stringify(items)); } catch { status.textContent = 'تعذر حفظ السلة على هذا الجهاز. يمكنك إرسال الطلب الآن.'; } };
  let timer;
  document.querySelectorAll('[data-add-cart]').forEach(button => button.addEventListener('click', () => {
    const id = button.dataset.addCart;
    if (!catalog.products.some(p => p.id === id)) return;
    items[id] = Math.min(999, (items[id] || 0) + 1); save(); render();
    status.textContent = 'تمت إضافة المنتج إلى سلة الطلب';
    clearTimeout(timer); timer = setTimeout(() => { status.textContent = ''; }, 2500);
  }));
  document.querySelectorAll('[data-open-cart]').forEach(button => button.addEventListener('click', () => { render(); dialog.showModal(); }));
  dialog.querySelectorAll('[data-close-cart]').forEach(button => button.addEventListener('click', () => dialog.close()));
  dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); } });
  notes.addEventListener('input', updateLink);
  window.addEventListener('storage', event => { if (event.key === key) { load(); render(); } });
  render();
})();
