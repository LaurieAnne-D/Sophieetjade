// Sophie & Jade — scripts
// Smooth scroll to targets
document.querySelectorAll('[data-scroll-to]').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = document.querySelector(btn.dataset.scrollTo);
    if (target) { target.scrollIntoView({ behavior: 'smooth' }); }
  });
});

const supportsMatchMedia = typeof window.matchMedia === 'function';
const motionQuery = supportsMatchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
let shouldReduceMotion = motionQuery?.matches ?? false;

const onMotionPreferenceChange = (handler) => {
  if (!motionQuery) return;
  if (typeof motionQuery.addEventListener === 'function') {
    motionQuery.addEventListener('change', handler);
  } else if (typeof motionQuery.addListener === 'function') {
    motionQuery.addListener(handler);
  }
};

const supportsIO = 'IntersectionObserver' in window;
const fadeElements = Array.from(document.querySelectorAll('.fade'));
const animatedElements = Array.from(document.querySelectorAll('[data-animate]'));
const animatedSet = new WeakSet();

const markAllVisible = () => {
  fadeElements.forEach(el => {
    if (!el.classList.contains('is-visible')) {
      el.classList.add('is-visible');
    }
  });
};

const markAllAnimated = () => {
  animatedElements.forEach(el => {
    if (!el.classList.contains('is-animated')) {
      el.classList.add('is-animated');
    }
    animatedSet.add(el);
  });
};

let fadeObserver = null;
const ensureFadeBehaviour = () => {
  if (!fadeElements.length) return;

  if (!supportsIO || shouldReduceMotion) {
    markAllVisible();
    fadeObserver?.disconnect();
    fadeObserver = null;
    return;
  }

  if (!fadeObserver) {
    fadeObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
  }

  fadeElements.forEach(el => {
    if (!el.classList.contains('is-visible')) {
      fadeObserver.observe(el);
    }
  });
};

let animateObserver = null;
const revealAnimatedElement = (el) => {
  if (animatedSet.has(el)) return;
  animatedSet.add(el);

  const type = el.dataset.animate;
  let delay = Number.parseFloat(el.dataset.animateDelay || '0');
  if (!Number.isFinite(delay)) delay = 0;

  if (type === 'stagger' && !el.dataset.animateDelay) {
    const siblings = el.parentElement?.querySelectorAll('[data-animate="stagger"]') ?? [];
    const index = Array.prototype.indexOf.call(siblings, el);
    delay = index >= 0 ? index * 140 : delay;
  } else if (type === 'timeline' && !el.dataset.animateDelay) {
    const siblings = el.parentElement?.querySelectorAll('[data-animate="timeline"]') ?? [];
    const index = Array.prototype.indexOf.call(siblings, el);
    delay = index >= 0 ? index * 260 : delay;
  } else if (type === 'lift' && !el.dataset.animateDelay) {
    delay = 120;
  }

  window.setTimeout(() => {
    el.classList.add('is-animated');
  }, delay);
};

const ensureAnimateBehaviour = () => {
  if (!animatedElements.length) return;

  if (!supportsIO || shouldReduceMotion) {
    markAllAnimated();
    animateObserver?.disconnect();
    animateObserver = null;
    return;
  }

  if (!animateObserver) {
    animateObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          revealAnimatedElement(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.25, rootMargin: '0px 0px -10%' });
  }

  animatedElements.forEach(el => {
    if (!animatedSet.has(el)) {
      animateObserver.observe(el);
    }
  });
};

// Gentle parallax on hero overlay
const heroOverlay = document.querySelector('.hero__overlay');
let heroLastKnownScrollY = 0;
let heroScrollTicking = false;

const applyHeroParallax = () => {
  if (!heroOverlay || shouldReduceMotion) return;
  const offset = Math.min(heroLastKnownScrollY * 0.18, 80);
  heroOverlay.style.transform = `translate3d(0, ${offset}px, 0)`;
};

const onHeroScroll = () => {
  if (!heroOverlay || shouldReduceMotion) return;
  heroLastKnownScrollY = window.scrollY;
  if (!heroScrollTicking) {
    heroScrollTicking = true;
    window.requestAnimationFrame(() => {
      applyHeroParallax();
      heroScrollTicking = false;
    });
  }
};

if (heroOverlay) {
  window.addEventListener('scroll', onHeroScroll, { passive: true });
}

const refreshMotionSettings = (event) => {
  if (typeof event?.matches === 'boolean') {
    shouldReduceMotion = event.matches;
  } else {
    shouldReduceMotion = motionQuery?.matches ?? false;
  }

  if (shouldReduceMotion && heroOverlay) {
    heroOverlay.style.transform = '';
  }

  ensureFadeBehaviour();
  ensureAnimateBehaviour();

  if (!shouldReduceMotion) {
    applyHeroParallax();
  }
};

refreshMotionSettings();
onMotionPreferenceChange(refreshMotionSettings);

// Modal open/close with graceful transitions
const modal = document.getElementById('rsvp-modal');
const openBtn = document.getElementById('rsvp-open');
const closeEls = document.querySelectorAll('[data-close]');

openBtn?.addEventListener('click', () => {
  modal.showModal();
});
closeEls.forEach(el => el.addEventListener('click', () => modal.close()));

// Fake form submit
document.getElementById('rsvp-form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  alert('Merci ! Ta réponse a bien été notée (démo).');
  modal.close();
});

// ===== Countdown (robuste toutes plateformes) =====
// Date en composants (évite les soucis Safari).
// Attention: mois = 0..11 => Décembre = 11
const targetDate = new Date(2026, 11, 12, 10, 30, 0);

const d = document.getElementById('d');
const h = document.getElementById('h');
const m = document.getElementById('m');
const s = document.getElementById('s');

let timerId = null;

function tick() {
  const now = new Date();
  let diff = targetDate - now;

  if (diff <= 0) {
    diff = 0;
    clearInterval(timerId);
  }

  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);

  if (d) d.textContent = String(days);
  if (h) h.textContent = String(hours).padStart(2, '0');
  if (m) m.textContent = String(mins).padStart(2, '0');
  if (s) s.textContent = String(secs).padStart(2, '0');
}

tick(); // premier affichage immédiatement
timerId = setInterval(tick, 1000);
