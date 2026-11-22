(() => {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ---------- Sticky nav shadow ---------- */
  const nav = $('#nav');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 20);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  const burger = $('#hamburger');
  const links = $('#navLinks');
  const setMenu = (open) => {
    links.classList.toggle('open', open);
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
  };
  burger.addEventListener('click', () => setMenu(!links.classList.contains('open')));
  $$('a', links).forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => e.key === 'Escape' && setMenu(false));
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target)) setMenu(false);
  });

  /* ---------- Active link on scroll ---------- */
  const sections = $$('main section[id]');
  const navAnchors = $$('a[href^="#"]', links);
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        navAnchors.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id));
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach((s) => spy.observe(s));

  /* ---------- Scroll reveal ---------- */
  const reveal = new IntersectionObserver((entries, obs) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        en.target.classList.add('in');
        obs.unobserve(en.target);
      }
    });
  }, { threshold: 0.15 });
  $$('.reveal').forEach((el) => reveal.observe(el));

  /* ---------- Animated counters ---------- */
  const animateCount = (el) => {
    const target = parseFloat(el.dataset.target);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1800;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(decimals) + (p === 1 ? suffix : '');
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const counters = new IntersectionObserver((entries, obs) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        animateCount(en.target);
        obs.unobserve(en.target);
      }
    });
  }, { threshold: 0.6 });
  $$('.count').forEach((c) => counters.observe(c));

  /* ---------- Portfolio filter ---------- */
  const filters = $$('.filter');
  const cards = $$('.work');
  filters.forEach((btn) => {
    btn.addEventListener('click', () => {
      const f = btn.dataset.filter;
      filters.forEach((b) => {
        const on = b === btn;
        b.classList.toggle('active', on);
        b.setAttribute('aria-selected', String(on));
      });
      cards.forEach((card) => {
        const show = f === 'all' || card.dataset.cat === f;
        card.classList.toggle('hide', !show);
        card.classList.remove('pop');
        if (show) {
          void card.offsetWidth; // restart animation
          card.classList.add('pop');
        }
      });
    });
  });
  // Portfolio cards are not scroll-revealed so filtering never leaves them hidden.

  /* ---------- Contact form validation ---------- */
  const form = $('#auditForm');
  const success = $('#formSuccess');
  const successText = $('#successText');

  const rules = {
    name: (v) => (v.trim().length >= 2 ? '' : 'Please enter your name.'),
    business: (v) => (v.trim().length >= 2 ? '' : 'Enter your business name or Instagram handle.'),
    contactInfo: (v) => {
      const t = v.trim();
      const email = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(t);
      const phone = /^\+?[\d\s\-()]{8,16}$/.test(t);
      return email || phone ? '' : 'Enter a valid email or phone number.';
    },
    service: (v) => (v ? '' : 'Please choose a service.'),
  };

  const validateField = (id) => {
    const input = $('#' + id);
    const msg = rules[id](input.value);
    const field = input.closest('.field');
    field.classList.toggle('invalid', !!msg);
    $(`.error[data-for="${id}"]`).textContent = msg;
    return !msg;
  };

  Object.keys(rules).forEach((id) => {
    const el = $('#' + id);
    el.addEventListener('blur', () => validateField(id));
    el.addEventListener('input', () => el.closest('.field').classList.contains('invalid') && validateField(id));
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const ok = Object.keys(rules).map(validateField).every(Boolean);
    if (!ok) {
      const firstBad = $('.field.invalid input, .field.invalid select', form);
      firstBad && firstBad.focus();
      return;
    }
    const first = $('#name').value.trim().split(' ')[0];
    successText.textContent = `Thanks ${first}! We've received your request and will send your free audit within 24 hours.`;
    success.hidden = false;
    // TODO: send form data to your backend / Formspree / EmailJS here.
    setTimeout(() => {
      form.reset();
      success.hidden = true;
    }, 6000);
  });

  /* ---------- Footer year ---------- */
  $('#year').textContent = new Date().getFullYear();
})();
