// ================= Helpers =================
function scrollToId(id){
  const el = document.getElementById(id);
  if(el) el.scrollIntoView({behavior:'smooth'});
}
function simularReserva(){
  const date = document.getElementById('f-entrada')?.value;
  const days = document.getElementById('dias')?.value;
  const talla = document.getElementById('talla')?.value;
  const nivel = document.getElementById('nivel')?.value;
  const email = document.getElementById('email')?.value;
  if(!date || !email){ alert('Completa fecha y correo para comprobar disponibilidad.'); return; }
  const ref = Math.random().toString(36).slice(2,8).toUpperCase();
  alert(`Reserva simulada: ${date} · ${days} día(s)\nTalla ${talla} · Nivel ${nivel}\nConfirmación a ${email}\nRef: SN-${ref}`);
}
document.addEventListener('click', (e)=>{
  const t = e.target;
  /* MODIFICACIÓN:
    Cambiado 'reserva' por 'bienvenida', ya que 'bienvenida'
    es el ID que existe en tu index.html para la sección de reserva.
  */
  if(t.id === 'cta-nav' || t.id === 'cta-hero' || t.classList.contains('btn-reserva')) scrollToId('bienvenida');
  if(t.id === 'cta-comprobar') simularReserva();
});

// ================= Hero Slider =================
(function heroSlider(){
  const root = document.querySelector('.hero-slider'); if(!root) return;
  const slides = Array.from(root.querySelectorAll('.slide'));
  const dots   = Array.from(root.querySelectorAll('.dot'));
  const title  = document.getElementById('hero-title');
  const sub    = document.getElementById('hero-sub');
  const prevB  = document.getElementById('hero-prev');
  const nextB  = document.getElementById('hero-next');

  let i = slides.findIndex(s => s.classList.contains('active')); if(i < 0) i = 0;
  let timer = null, hovering = false;

  const applyText = (idx)=>{ const s = slides[idx]; if(!s) return; title.textContent = s.dataset.title || ''; sub.textContent = s.dataset.sub || ''; };
  const go   = (n)=>{ slides[i].classList.remove('active'); dots[i]?.classList.remove('active'); i = (n + slides.length) % slides.length; slides[i].classList.add('active'); dots[i]?.classList.add('active'); applyText(i); };
  const next = ()=> go(i+1);
  const prev = ()=> go(i-1);
  const play = ()=>{ stop(); timer = setInterval(next, 5000); };
  const stop = ()=>{ if(timer) clearInterval(timer); timer = null; };

  dots.forEach((d, idx)=> d.addEventListener('click', ()=>{ go(idx); play(); }));
  root.addEventListener('mouseenter', ()=>{ hovering = true; stop(); });
  root.addEventListener('mouseleave', ()=>{ hovering = false; play(); });
  root.addEventListener('focusin', stop);
  root.addEventListener('focusout', ()=>{ if(!hovering) play(); });
  nextB?.addEventListener('click', ()=>{ next(); play(); });
  prevB?.addEventListener('click', ()=>{ prev(); play(); });

  document.addEventListener('keydown', (e)=>{ if(e.key === 'ArrowRight') { next(); play(); } if(e.key === 'ArrowLeft') { prev(); play(); } });

  // Swipe táctil
  let x0 = null;
  root.addEventListener('touchstart', e=>{ x0 = e.touches[0].clientX; stop(); }, {passive:true});
  root.addEventListener('touchend',   e=>{
    if(x0 == null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if(Math.abs(dx) > 40) (dx < 0 ? next() : prev());
    x0 = null; play();
  }, {passive:true});

  applyText(i); play();
})();