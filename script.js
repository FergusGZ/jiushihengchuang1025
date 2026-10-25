/* 原生交互；无网络请求，页面正文无需 JavaScript 即可阅读。 */
(() => {
  'use strict';

  const header = document.querySelector('.site-header');
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');
  const backToTop = document.querySelector('.back-to-top');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function setMenu(open, returnFocus = false) {
    mobileNav.hidden = !open;
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? '关闭导航菜单' : '打开导航菜单');
    if (returnFocus) menuToggle.focus();
  }

  menuToggle.addEventListener('click', () => {
    setMenu(menuToggle.getAttribute('aria-expanded') !== 'true');
  });

  mobileNav.addEventListener('click', (event) => {
    if (event.target.closest('a')) setMenu(false);
  });

  document.addEventListener('click', (event) => {
    if (!header.contains(event.target) && !mobileNav.hidden) setMenu(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !mobileNav.hidden) setMenu(false, true);
  });

  window.matchMedia('(min-width: 901px)').addEventListener('change', (event) => {
    if (event.matches) setMenu(false);
  });

  // 每帧最多处理一次滚动，避免频繁计算。
  let scrollPending = false;
  function updateScrollState() {
    header.classList.toggle('is-scrolled', window.scrollY > 50);
    backToTop.hidden = window.scrollY < 600;
    scrollPending = false;
  }
  window.addEventListener('scroll', () => {
    if (!scrollPending) {
      scrollPending = true;
      window.requestAnimationFrame(updateScrollState);
    }
  }, { passive: true });
  updateScrollState();

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reduceMotion.matches ? 'instant' : 'smooth' });
    document.querySelector('.brand').focus({ preventScroll: true });
    if (window.location.hash) {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  });

  // 使用真实区块位置标记当前栏目，包含滚动到页脚的情形。
  const navLinks = [...document.querySelectorAll('.desktop-nav a, .mobile-nav a')];
  const sectionIds = ['home', 'about', 'services', 'cases', 'news', 'contact'];
  function activateSection(id) {
    navLinks.forEach((link) => {
      if (link.getAttribute('href') === '#' + id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) activateSection(entry.target.id);
      });
    }, { rootMargin: '-15% 0px -55% 0px', threshold: 0 });
    sectionIds.forEach((id) => observer.observe(document.getElementById(id)));
  }

  // 详情只展示参考站已公开的摘要，直接从当前卡片读取，避免内容重复维护。
  const dialog = document.querySelector('.news-dialog');
  let newsTrigger = null;
  document.querySelectorAll('.news-open').forEach((button) => {
    button.addEventListener('click', () => {
      const card = button.closest('.news-copy');
      document.getElementById('dialog-title').textContent = button.textContent;
      document.getElementById('dialog-meta').textContent = card.querySelector('.news-meta').textContent;
      document.getElementById('dialog-summary').textContent = card.querySelector('p:last-child').textContent;
      newsTrigger = button;
      dialog.showModal();
      document.body.classList.add('modal-open');
    });
  });
  document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('modal-open');
    if (newsTrigger) newsTrigger.focus({ preventScroll: true });
  });
})();
