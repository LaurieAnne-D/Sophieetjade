// Sophie & Jade — scripts
// Smooth scroll to targets
document.querySelectorAll('[data-scroll-to]').forEach(btn=>{
  btn.addEventListener('click', e=>{
    const target = document.querySelector(btn.dataset.scrollTo);
    if(target){ target.scrollIntoView({behavior:'smooth'}) }
  });
});

// IntersectionObserver for fade-in
const io = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add('is-visible');
      io.unobserve(entry.target);
    }
  });
},{threshold:0.15});
document.querySelectorAll('.fade').forEach(el=>io.observe(el));

// Modal open/close with graceful transitions
const modal = document.getElementById('rsvp-modal');
const openBtn = document.getElementById('rsvp-open');
const closeEls = document.querySelectorAll('[data-close]');

openBtn?.addEventListener('click', ()=>{
  modal.showModal();
});
closeEls.forEach(el=> el.addEventListener('click', ()=> modal.close()));

// Fake form submit
document.getElementById('rsvp-form')?.addEventListener('submit', (e)=>{
  e.preventDefault();
  alert('Merci ! Ta réponse a bien été notée (démo).');
  modal.close();
});

// Countdown (set target date here: 2026-12-12 10:30:00 local)
const targetDate = new Date('2026-12-12T10:30:00');
const d = document.getElementById('d');
const h = document.getElementById('h');
const m = document.getElementById('m');
const s = document.getElementById('s');

function tick(){
  const now = new Date();
  const diff = Math.max(0, targetDate - now);
  const days = Math.floor(diff/86400000);
  const hours = Math.floor((diff%86400000)/3600000);
  const mins = Math.floor((diff%3600000)/60000);
  const secs = Math.floor((diff%60000)/1000);
  if(d){ d.textContent = String(days) }
  if(h){ h.textContent = String(hours).padStart(2,'0') }
  if(m){ m.textContent = String(mins).padStart(2,'0') }
  if(s){ s.textContent = String(secs).padStart(2,'0') }
}
tick();
