// ================= Carga de parciales =================
function loadPartial(id, url){
  const slot = document.getElementById(id);
  return fetch(url)
    .then(res => res.text())
    .then(html => {
      slot.innerHTML = html;
      if(id === 'navbar') wireMenu();
    })
    .catch(e => {
      console.error('Fallo cargando', url, e);
      slot.innerHTML = '<!-- fallo cargando ' + url + ' -->';
    });
}

// ================= Navbar =================
function wireMenu(){
  const btn  = document.getElementById('menu-btn');
  const list = document.getElementById('navlist');
  const bar  = document.querySelector('.topbar');

  if(bar){
    const setOffset = ()=>{
      const h = bar.offsetHeight || 72;
      document.documentElement.style.setProperty('--nav-h', h + 'px');
    };
    const onScroll = ()=>{
      // sólido en scroll en móvil y desktop
      bar.classList.toggle('scrolled', window.scrollY > 10);
    };
    setOffset(); onScroll();
    window.addEventListener('resize', setOffset);
    window.addEventListener('scroll', onScroll, { passive:true });
  }
  if(btn && list){
    btn.addEventListener('click', ()=>{
      const open = list.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }
}

// ================= Preloader =================
const navPromise  = loadPartial('navbar', 'partials/navbar.html');
const footPromise = loadPartial('footer', 'partials/footer.html');

window.addEventListener('load', () => {
  Promise.all([navPromise, footPromise]).finally(() => {
    const pre = document.getElementById('preloader');
    if(pre){ pre.classList.add('done'); setTimeout(()=> pre.remove(), 600); }
  });
});

// ================= Barra de progreso =================
(function wireScrollProgress(){
  const line = document.querySelector('.scroll-progress');
  if(!line) return;
  const set = ()=>{
    const h = document.documentElement;
    const scrollTop = h.scrollTop || document.body.scrollTop;
    const scrollHeight = (h.scrollHeight || document.body.scrollHeight) - h.clientHeight;
    const pct = Math.max(0, Math.min(1, scrollHeight ? (scrollTop / scrollHeight) : 0));
    line.style.width = (pct * 100).toFixed(2) + '%';
  };
  set();
  window.addEventListener('scroll', set, { passive:true });
  window.addEventListener('resize', set);
})();

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
  if(t.id === 'cta-nav' || t.id === 'cta-hero' || t.classList.contains('btn-reserva')) scrollToId('reserva');
  if(t.id === 'cta-comprobar') simularReserva();
});

// ================= Año dinámico =================
(function setYearWhenReady(){
  const root = document.getElementById('footer'); if(!root) return;
  const apply = ()=>{ const y = root.querySelector('#year'); if(y){ y.textContent = new Date().getFullYear(); return true; } return false; };
  if(apply()) return;
  const obs = new MutationObserver(()=>{ if(apply()) obs.disconnect(); });
  obs.observe(root, { childList:true, subtree:true });
})();

// ================= Animaciones reveal =================
const io = new IntersectionObserver((entries, obs)=>{
  entries.forEach(en=>{ if(en.isIntersecting){ en.target.classList.add('reveal-in'); obs.unobserve(en.target); }});
},{ rootMargin:'0px 0px -10% 0px', threshold:0.15 });

(function waitFooter(){
  const root = document.getElementById('footer'); if(!root) return;
  const bind = ()=> root.querySelectorAll('.reveal-once').forEach(el=> io.observe(el));
  bind();
  const mo = new MutationObserver(()=>{ bind(); });
  mo.observe(root, { childList:true, subtree:true });
})();

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

// ===== Footer carousel (móvil) =====
(function footerCarousel(){
  const mq = window.matchMedia('(max-width: 920px)');
  let prevBtn, nextBtn, ro, so;

  function footEl(){ return document.querySelector('.site-footer .foot'); }
  function rootEl(){ return document.querySelector('.site-footer'); }

  function centerAt(idx){
    const foot = footEl();
    const card = foot?.querySelectorAll('.foot-col')[idx];
    if(!foot || !card) return;
    // padding real (incluye safe-areas)
    const cs   = getComputedStyle(foot);
    const padL = parseFloat(cs.paddingLeft)  || 0;
    const padR = parseFloat(cs.paddingRight) || 0;
    const visible = foot.clientWidth - padL - padR;
    const target  = card.offsetLeft - (visible - card.clientWidth)/2 - padL;
    foot.scrollTo({ left: Math.max(0, target), behavior:'smooth' });
  }

  function nearestIndex(){
    const foot = footEl(); if(!foot) return 0;
    const cards = Array.from(foot.querySelectorAll('.foot-col')); if(!cards.length) return 0;
    const mid   = foot.scrollLeft + foot.clientWidth/2;
    let i=0, best=Infinity;
    cards.forEach((c, idx)=>{ const m = c.offsetLeft + c.clientWidth/2; const d = Math.abs(m - mid); if(d < best){ best = d; i = idx; } });
    return i;
  }

  function mount(){
    const foot = footEl(), root = rootEl();
    if(!foot || !root) return;

    // Flechas (una sola vez)
    if(!prevBtn){
      prevBtn = document.createElement('button');
      nextBtn = document.createElement('button');
      prevBtn.className = 'foot-nav foot-nav--prev';
      nextBtn.className = 'foot-nav foot-nav--next';
      root.appendChild(prevBtn); root.appendChild(nextBtn);

      prevBtn.addEventListener('click', ()=> centerAt(nearestIndex()-1));
      nextBtn.addEventListener('click', ()=> centerAt(nearestIndex()+1));
    }
    prevBtn.style.display = nextBtn.style.display = mq.matches ? 'grid' : 'none';

    // Centrado inicial robusto (después de layout/imagenes)
    requestAnimationFrame(()=> centerAt(0));
    setTimeout(()=> centerAt(0), 150);

    // ResizeObserver para recálculo suave
    ro ??= new ResizeObserver(()=> centerAt(nearestIndex()));
    ro.observe(foot);

    // Scroll snap “ajuste fino” al soltar
    foot.addEventListener('scrollend', ()=> centerAt(nearestIndex()));
    // Polyfill básico si no hay scrollend
    let to=null;
    foot.addEventListener('scroll', ()=>{
      clearTimeout(to); to = setTimeout(()=> centerAt(nearestIndex()), 120);
    }, {passive:true});

    // Observer de safe-areas/teclado (cambios de viewport)
    so ??= new (window.ResizeObserver || MutationObserver)(()=> centerAt(nearestIndex()));
  }

  function unmount(){
    prevBtn?.remove(); nextBtn?.remove(); prevBtn = nextBtn = null;
    ro?.disconnect(); ro = null;
  }

  function onChange(){ mq.matches ? mount() : unmount(); }
  onChange();
  mq.addEventListener?.('change', onChange);
  window.addEventListener('orientationchange', ()=> mq.matches && setTimeout(()=> centerAt(nearestIndex()), 200));
})();
