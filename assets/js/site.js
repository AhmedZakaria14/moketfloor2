(() => {
  const menuButton = document.querySelector('.menu-button');
  const menu = document.querySelector('.main-nav');

  const closeMenu = () => {
    if (!menuButton || !menu) return;
    menu.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'فتح القائمة');
  };

  if (menuButton && menu) {
    menuButton.addEventListener('click', () => {
      const open = !menu.classList.contains('open');
      menu.classList.toggle('open', open);
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', open ? 'إغلاق القائمة' : 'فتح القائمة');
    });
    menu.addEventListener('click', (event) => {
      if (event.target.closest('a')) closeMenu();
    });
    document.addEventListener('click', (event) => {
      if (!menu.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
    });
  }

  const filters = document.querySelectorAll('[data-filter]');
  const filterItems = document.querySelectorAll('.catalog-grid > [data-category]');
  filters.forEach((button) => {
    button.addEventListener('click', () => {
      const value = button.dataset.filter;
      filters.forEach((candidate) => candidate.classList.toggle('active', candidate === button));
      filterItems.forEach((item) => {
        item.hidden = value !== 'all' && item.dataset.category !== value;
      });
    });
  });

  const lightbox = document.querySelector('.lightbox');
  if (lightbox) {
    const lightboxImage = lightbox.querySelector('img');
    const caption = lightbox.querySelector('p');
    const closeButton = lightbox.querySelector('.lightbox-close');

    document.querySelectorAll('[data-lightbox]').forEach((button) => {
      button.addEventListener('click', () => {
        lightboxImage.src = button.dataset.lightbox;
        lightboxImage.alt = button.dataset.alt || '';
        caption.textContent = button.dataset.alt || '';
        lightbox.showModal();
      });
    });

    closeButton.addEventListener('click', () => lightbox.close());
    lightbox.addEventListener('click', (event) => {
      const rect = lightbox.getBoundingClientRect();
      const outside = event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
      if (outside) lightbox.close();
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });
})();
