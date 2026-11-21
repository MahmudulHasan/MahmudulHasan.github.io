(() => {
  const root = document.documentElement;
  root.classList.add('js');

  // Theme toggle (dark by default; respects saved choice, then OS preference)
  try {
    if (!root.dataset.theme && window.matchMedia('(prefers-color-scheme: light)').matches) {
      root.dataset.theme = 'light';
    }
  } catch (e) {}
  document.querySelector('.theme-toggle')?.addEventListener('click', () => {
    const next = root.dataset.theme === 'light' ? 'dark' : 'light';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) {}
  });

  // Mobile menu
  const toggle = document.querySelector('.menu-toggle');
  const links = document.getElementById('nav-links');
  const setMenu = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    links.classList.toggle('open', open);
  };
  toggle?.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  links?.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  // Header shadow on scroll
  const header = document.querySelector('.site-header');
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Reveal on scroll + active nav link
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('visible'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach((el) => io.observe(el));

    const navLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          navLinks.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id));
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('main section[id]').forEach((s) => spy.observe(s));
  } else {
    reveals.forEach((el) => el.classList.add('visible'));
  }

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
