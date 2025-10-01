// Sophie & Jade — scripts
// Smooth scroll to targets
document.querySelectorAll('[data-scroll-to]').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = document.querySelector(btn.dataset.scrollTo);
    if (target) { target.scrollIntoView({ behavior: 'smooth' }); }
  });
});

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const onMotionPreferenceChange = (handler) => {
  if (typeof prefersReducedMotion.addEventListener === 'function') {
    prefersReducedMotion.addEventListener('change', handler);
  } else if (typeof prefersReducedMotion.addListener === 'function') {
    prefersReducedMotion.addListener(handler);
  }
};

// IntersectionObserver for fade-in blocks
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll('.fade').forEach(el => io.observe(el));

// Progressive animations orchestrated with data attributes
const animatedElements = document.querySelectorAll('[data-animate]');

if (prefersReducedMotion.matches) {
  animatedElements.forEach(el => el.classList.add('is-animated'));
} else if (animatedElements.length) {
  const animatedSet = new WeakSet();
  const reveal = (el) => {
    if (animatedSet.has(el)) return;
    animatedSet.add(el);
    const type = el.dataset.animate;
    let delay = Number.parseFloat(el.dataset.animateDelay || '0');
    if (!Number.isFinite(delay)) delay = 0;

    if (type === 'stagger' && !el.dataset.animateDelay) {
      const siblings = el.parentElement?.querySelectorAll('[data-animate="stagger"]') ?? [];
      const index = Array.prototype.indexOf.call(siblings, el);
      delay = index >= 0 ? index * 140 : delay;
    } else if (type === 'lift' && !el.dataset.animateDelay) {
      delay = 120;
    }

    window.setTimeout(() => {
      el.classList.add('is-animated');
    }, delay);
  };

  const animateObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        reveal(entry.target);
        animateObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.25, rootMargin: '0px 0px -10%' });

  animatedElements.forEach(el => animateObserver.observe(el));
}

onMotionPreferenceChange((event) => {
  if (event.matches) {
    animatedElements.forEach(el => el.classList.add('is-animated'));
  }
});

// Gentle parallax on hero overlay
const heroOverlay = document.querySelector('.hero__overlay');
if (heroOverlay && !prefersReducedMotion.matches) {
  let lastKnownScrollY = 0;
  let ticking = false;

  const updateOverlay = () => {
    const offset = Math.min(lastKnownScrollY * 0.18, 80);
    heroOverlay.style.transform = `translate3d(0, ${offset}px, 0)`;
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    lastKnownScrollY = window.scrollY;
    if (!ticking) {
      window.requestAnimationFrame(updateOverlay);
      ticking = true;
    }
  });

  onMotionPreferenceChange((event) => {
    if (event.matches) {
      heroOverlay.style.transform = '';
    }
  });
} else if (heroOverlay) {
  heroOverlay.style.transform = '';
}

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
// Construit la date en composants (évite les soucis Safari).
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

