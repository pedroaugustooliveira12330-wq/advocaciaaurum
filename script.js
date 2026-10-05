(() => {
  const root = document.documentElement;
  const body = document.body;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const preloader = document.querySelector('.preloader');
  const revealNodes = [...document.querySelectorAll('.reveal')];
  const counters = [...document.querySelectorAll('[data-count]')];
  const timeline = document.querySelector('.timeline');
  const timelineFill = document.querySelector('.timeline-fill');
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav-links');
  let rafPending = false;

  const finishIntro = () => {
    body.classList.remove('loading');
    root.classList.add('ready');
    if (preloader) preloader.classList.add('done');
    window.setTimeout(() => { if (preloader) preloader.remove(); }, 750);
  };

  body.classList.add('loading');
  if (reduceMotion) {
    root.classList.add('js-ready', 'ready');
    finishIntro();
  } else {
    window.setTimeout(finishIntro, 1150);
  }

  const show = (node) => {
    node.classList.add('is-visible');
    if (!node.matches('[data-count]')) return;
    if (node.dataset.counted) return;
    node.dataset.counted = 'true';
    const end = Number(node.dataset.count) || 0;
    const prefix = node.dataset.prefix || '';
    const suffix = node.dataset.suffix || '';
    if (reduceMotion) { node.textContent = node.dataset.final || `${prefix}${end}${suffix}`; return; }
    const start = performance.now();
    const duration = 1300;
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      node.textContent = `${prefix}${Math.round(end * eased).toLocaleString('pt-BR')}${suffix}`;
      if (p < 1) requestAnimationFrame(tick); else node.textContent = node.dataset.final || `${prefix}${end}${suffix}`;
    };
    requestAnimationFrame(tick);
  };

  if ('IntersectionObserver' in window && !reduceMotion) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        show(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -35px 0px' });
    revealNodes.forEach(node => observer.observe(node));
  } else {
    revealNodes.forEach(show);
  }
  // Prevent any reveal item staying hidden if the browser pauses intersection callbacks.
  window.setTimeout(() => revealNodes.forEach(show), 2800);

  const updateTimeline = () => {
    rafPending = false;
    if (!timeline || !timelineFill) return;
    const rect = timeline.getBoundingClientRect();
    const viewportMarker = window.innerHeight * (window.innerWidth <= 680 ? 0.72 : 0.68);
    const distance = Math.max(0, Math.min(rect.height, viewportMarker - rect.top));
    const progress = rect.height ? distance / rect.height : 0;
    if (window.innerWidth <= 680) timelineFill.style.height = `${progress * 100}%`;
    else timelineFill.style.width = `${progress * 100}%`;
  };
  const requestTimelineUpdate = () => {
    if (!rafPending) { rafPending = true; requestAnimationFrame(updateTimeline); }
  };
  window.addEventListener('scroll', requestTimelineUpdate, { passive: true });
  window.addEventListener('resize', requestTimelineUpdate, { passive: true });
  requestTimelineUpdate();

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      toggle.setAttribute('aria-label', open ? 'Abrir menu' : 'Fechar menu');
      nav.classList.toggle('open', !open);
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Abrir menu');
      nav.classList.remove('open');
    }));
  }

  const cards = document.querySelectorAll('.practice-card');
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && !reduceMotion) {
    cards.forEach(card => {
      card.addEventListener('pointermove', event => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        card.style.setProperty('--ry', `${x * 2.4}deg`);
        card.style.setProperty('--rx', `${-y * 2.4}deg`);
      });
      card.addEventListener('pointerleave', () => {
        card.style.removeProperty('--ry');
        card.style.removeProperty('--rx');
      });
    });
  }
})();


