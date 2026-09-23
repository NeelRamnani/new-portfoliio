// Motion enhances the page; all content remains visible without JavaScript.
(() => {
  const root = document.documentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const toggle = document.querySelector('#motion-toggle');
  const running = new Set();
  const revealed = new WeakSet();
  let observer;
  const heroVideo = document.querySelector('#hero-video');
  let heroInView = true;
  const syncHeroVideo = () => {
    if (!heroVideo) return;
    const light = root.dataset.theme === 'light';
    const source = light ? heroVideo.dataset.srcLight : heroVideo.dataset.srcDark;
    const poster = light ? heroVideo.dataset.posterLight : heroVideo.dataset.posterDark;
    if (heroVideo.dataset.activeSource !== source) {
      heroVideo.pause();
      heroVideo.classList.remove('is-ready');
      heroVideo.poster = poster;
      heroVideo.removeAttribute('src');
      heroVideo.load();
      heroVideo.dataset.activeSource = source;
    }
    if (!enabled() || document.hidden || !heroInView) {
      heroVideo.pause();
      return;
    }
    if (!heroVideo.getAttribute('src')) {
      heroVideo.src = source;
      heroVideo.muted = true;
      heroVideo.load();
    }
    const playRequest = heroVideo.play();
    if (playRequest) playRequest.catch(() => {});
  };
  heroVideo?.addEventListener('loadeddata', () => {
    if (heroVideo.getAttribute('src') === heroVideo.dataset.activeSource) heroVideo.classList.add('is-ready');
  });
  heroVideo?.addEventListener('error', () => heroVideo.classList.remove('is-ready'));
  document.addEventListener('neel:themechange', syncHeroVideo);
  if (heroVideo && 'IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      heroInView = entries[0].isIntersecting;
      syncHeroVideo();
    }).observe(document.querySelector('.hero'));
  }
  let paused = false;
  try { paused = localStorage.getItem('neel-motion-paused') === 'true'; } catch {}
  const enabled = () => !reduced.matches && !paused;
  const play = (element, index = 0) => {
    if (!enabled() || !element.animate || element.hidden) return;
    const animation = element.animate([
      { opacity: 0, transform: 'translateY(24px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ], { duration: 700, delay: Math.min(index * 75, 225), easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards' });
    running.add(animation);
    animation.finished.then(() => running.delete(animation), () => running.delete(animation));
  };
  const targets = [...document.querySelectorAll('.section-heading, .service-card, .service-footer, .project, .social-heading, .social-gallery button, .email-heading, .email-card, .email-footer, .process-grid article, .about-identity, .about-copy, .quote-grid figure, .contact-copy, .contact-form')];
  const setupReveals = () => {
    observer?.disconnect();
    if (!enabled() || !('IntersectionObserver' in window)) return;
    observer = new IntersectionObserver(entries => {
      let index = 0;
      entries.forEach(entry => {
        if (!entry.isIntersecting || entry.target.hidden) return;
        if (!revealed.has(entry.target)) {
          play(entry.target, index++);
          revealed.add(entry.target);
          entry.target.classList.add('is-revealed');
        }
        observer.unobserve(entry.target);
      });
    }, { threshold: .08 });
    targets.forEach(element => { if (!revealed.has(element)) observer.observe(element); });
  };
  const sync = () => {
    root.dataset.motion = enabled() ? 'full' : 'off';
    toggle.hidden = false;
    toggle.textContent = reduced.matches ? 'Reduced motion' : paused ? 'Play animations' : 'Pause animations';
    toggle.setAttribute('aria-pressed', String(!enabled()));
    toggle.disabled = reduced.matches;
    toggle.title = reduced.matches ? 'Your device’s reduced-motion preference is enabled.' : 'Turn decorative animations on or off';
    if (!enabled()) {
      running.forEach(animation => animation.cancel());
      running.clear();
    }
    setupReveals();
    syncHeroVideo();
  };
  toggle.addEventListener('click', () => {
    paused = !paused;
    try { localStorage.setItem('neel-motion-paused', String(paused)); } catch {}
    sync();
  });
  reduced.addEventListener('change', sync);
  sync();
  // Stop ambient animation work when the browser tab is out of view.
  const updateVisibility = () => { root.classList.toggle('motion-suspended', document.hidden); syncHeroVideo(); };
  document.addEventListener('visibilitychange', updateVisibility);
  updateVisibility();
  document.querySelectorAll('.service-card, .project-image').forEach(card => {
    let frame = 0;
    let point;
    card.addEventListener('pointermove', event => {
      if (!enabled() || !finePointer.matches) return;
      point = { x: event.clientX, y: event.clientY };
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (!enabled() || !point) return;
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--glow-x', `${point.x - rect.left}px`);
        card.style.setProperty('--glow-y', `${point.y - rect.top}px`);
      });
    }, { passive: true });
    card.addEventListener('pointerleave', () => { cancelAnimationFrame(frame); frame = 0; point = null; });
  });
  document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
    let index = 0;
    document.querySelectorAll('.project:not([hidden]), .social-work:not([hidden]) .social-gallery button:not([hidden]), .email-work:not([hidden]) .email-card').forEach(element => {
      const box = element.getBoundingClientRect();
      if (box.top < window.innerHeight && box.bottom > 0) { revealed.add(element); play(element, index++); }
    });
  }));
  document.querySelector('#more-designs').addEventListener('click', setupReveals);
})();
