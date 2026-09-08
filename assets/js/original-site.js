(() => {
  const mobileHeaderStyle = document.createElement('style');
  mobileHeaderStyle.textContent = `
    @media (max-width: 760px) {
      .header-layout {
        grid-template-columns: 44px minmax(0, 1fr) 44px !important;
        gap: 10px !important;
      }
      .site-logo {
        grid-column: 2;
        grid-row: 1;
        justify-self: center;
      }
      .menu-button {
        grid-column: 1 !important;
        grid-row: 1;
        justify-self: start;
      }
      .header-cart {
        grid-column: 3;
        grid-row: 1;
        justify-self: end;
        width: 44px;
        height: 44px;
        display: grid;
        place-items: center;
        padding: 0;
        border-radius: 50%;
      }
      .header-cart svg {
        width: 23px;
        height: 23px;
      }
      .header-cart [data-cart-count] {
        position: absolute;
        top: 1px;
        right: 0;
        min-width: 18px;
        height: 18px;
        display: grid;
        place-items: center;
        padding: 0 4px;
        border: 2px solid var(--white);
        font-size: 10px;
        line-height: 1;
      }
    }
  `;
  document.head.appendChild(mobileHeaderStyle);

  const menuButton = document.querySelector('.menu-button');
  const menu = document.querySelector('.main-nav');

  const closeMenu = () => {
    if (!menuButton || !menu) return;
    menu.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'فتح القائمة');
    document.body.classList.remove('menu-open');
  };

  if (menuButton && menu) {
    menuButton.addEventListener('click', () => {
      const open = !menu.classList.contains('open');
      menu.classList.toggle('open', open);
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', open ? 'إغلاق القائمة' : 'فتح القائمة');
      document.body.classList.toggle('menu-open', open);
    });
    menu.addEventListener('click', (event) => {
      if (event.target.closest('a')) closeMenu();
    });
  }

  const filters = [...document.querySelectorAll('[data-filter]')];
  const cards = [...document.querySelectorAll('.catalog-grid > .product-card')];
  const catalogSearch = document.querySelector('#catalog-search');
  const empty = document.querySelector('.empty-results');
  let category = 'all';

  const normalize = (value) => value.trim().toLocaleLowerCase('ar');
  const applyCatalogFilters = () => {
    const query = normalize(catalogSearch?.value || '');
    let visible = 0;
    cards.forEach((card) => {
      const categoryMatch = category === 'all' || card.dataset.category === category;
      const searchMatch = !query || normalize(card.dataset.search || '').includes(query);
      card.hidden = !(categoryMatch && searchMatch);
      if (!card.hidden) visible += 1;
    });
    if (empty) empty.hidden = visible !== 0;
  };

  filters.forEach((button) => {
    button.addEventListener('click', () => {
      category = button.dataset.filter;
      filters.forEach((candidate) => candidate.classList.toggle('active', candidate === button));
      applyCatalogFilters();
    });
  });

  if (catalogSearch) {
    const query = new URLSearchParams(window.location.search).get('q');
    if (query) catalogSearch.value = query;
    catalogSearch.addEventListener('input', applyCatalogFilters);
    applyCatalogFilters();
  }

  const lightbox = document.querySelector('.lightbox');
  if (lightbox) {
    const image = lightbox.querySelector('img');
    const caption = lightbox.querySelector('p');
    document.querySelectorAll('[data-lightbox]').forEach((button) => {
      button.addEventListener('click', () => {
        image.src = button.dataset.lightbox;
        image.alt = button.dataset.alt || '';
        caption.textContent = button.dataset.alt || '';
        lightbox.showModal();
      });
    });
    lightbox.querySelector('.lightbox-close').addEventListener('click', () => lightbox.close());
    lightbox.addEventListener('click', (event) => {
      const rect = lightbox.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) lightbox.close();
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });
})();
