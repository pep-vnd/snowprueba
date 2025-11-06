// app.js — carga parciales + navbar fijo + preloader
function loadPartial(id, url){
  const slot = document.getElementById(id);
  // devolvemos la Promesa para poder saber cuándo terminó
  return fetch(url)
    .then(res => res.text())
    .then(html => {
      slot.innerHTML = html;
      if(id === 'navbar'){ wireMenu(); } // conecta eventos del menú móvil y sticky
    })
    .catch(e => {
      console.error('Fallo cargando', url, e);
      slot.innerHTML = '<!-- fallo cargando ' + url + ' -->';
    });
}

function wireMenu(){
  const btn  = document.getElementById('menu-btn');
  const list = document.getElementById('navlist');
  const bar  = document.querySelector('.topbar');

  // Navbar “sticky”: usamos variable CSS --nav-h (adiós franja blanca)
  if(bar){
    const setOffset = ()=>{
      const h = bar.offsetHeight || 72;
      document.documentElement.style.setProperty('--nav-h', h + 'px');
    };
    const onScroll  = ()=>{
      const sc = window.scrollY > 10;
      bar.classList.toggle('scrolled', sc); // tu CSS ya estiliza .scrolled
    };
    setOffset();
    onScroll();
    window.addEventListener('resize', setOffset);
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // Menú móvil (si existe botón hamburguesa)
  if(btn && list){
    btn.addEventListener('click', ()=>{
      const open = list.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }
}

// Inicia carga de parciales (tu estructura de carpetas)
const navPromise  = loadPartial('navbar', 'partials/navbar.html');
const footPromise = loadPartial('footer', 'partials/footer.html');

// Ocultar preloader cuando:
// 1) termine el evento 'load' (imágenes y CSS listos) Y
// 2) hayamos cargado los parciales
window.addEventListener('load', () => {
  Promise.all([navPromise, footPromise]).finally(() => {
    const pre = document.getElementById('preloader');
    if(pre){
      pre.classList.add('done');        // activa la transición CSS
      setTimeout(() => pre.remove(), 600); // limpieza del DOM
    }
  });
});

// ---- (tu código existente sigue igual) ----

// Scroll a reserva
function scrollToId(id){
  const el = document.getElementById(id);
  if(el) el.scrollIntoView({behavior:'smooth'});
}

// Simulación de reserva
function simularReserva(){
  const date  = document.getElementById('f-entrada')?.value;
  const days  = document.getElementById('dias')?.value;
  const talla = document.getElementById('talla')?.value;
  const nivel = document.getElementById('nivel')?.value;
  const email = document.getElementById('email')?.value;
  if(!date || !email){
    alert('Completa fecha y correo para comprobar disponibilidad.');
    return;
  }
  const ref = Math.random().toString(36).slice(2,8).toUpperCase();
  alert(`Reserva simulada: ${date} · ${days} día(s)\nTalla ${talla} · Nivel ${nivel}\nConfirmación a ${email}\nRef: SN-${ref}`);
}

// Delegación de eventos
document.addEventListener('click', (e)=>{
  const t = e.target;
  if(t && t.id === 'cta-nav') scrollToId('reserva');
  if(t && t.classList && t.classList.contains('btn-reserva')) scrollToId('reserva');
  if(t && t.id === 'cta-hero') scrollToId('reserva');
  if(t && t.id === 'cta-comprobar') simularReserva();
});

// Año dinámico en el footer (por si lo usas)
(function setYearWhenReady(){
  const root = document.getElementById('footer');
  if(!root) return;
  const apply = ()=>{
    const y = root.querySelector('#year');
    if(y){ y.textContent = new Date().getFullYear(); return true; }
    return false;
  };
  if(apply()) return;
  const obs = new MutationObserver(()=>{ if(apply()) obs.disconnect(); });
  obs.observe(root, { childList:true, subtree:true });
})();

// ===== Barra de progreso de scroll en la navbar =====
(function wireScrollProgress(){
  const bar = document.querySelector('.topbar');
  const line = document.querySelector('.scroll-progress');
  if(!bar || !line) return;

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

// ---- Reveal-once para el footer y cualquier bloque con .reveal-once ----
const io = new IntersectionObserver((entries, obs)=>{
  entries.forEach(en=>{
    if(en.isIntersecting){
      en.target.classList.add('reveal-in');
      obs.unobserve(en.target);
    }
  });
},{
  rootMargin: '0px 0px -10% 0px', threshold: 0.15
});

// Cuando el footer exista (se carga por parcial), aplicar
(function waitFooter(){
  const root = document.getElementById('footer');
  if(!root) return;
  const bind = ()=>{
    root.querySelectorAll('.reveal-once').forEach(el=> io.observe(el));
  };
  // Intento directo
  bind();
  // Y por si llega más tarde
  const mo = new MutationObserver(()=>{ bind(); });
  mo.observe(root, { childList:true, subtree:true });
})();

// ===== HERO SLIDER (autoplay 5s, fade, dots, swipe) =====
(function heroSlider(){
  const root = document.querySelector('.hero-slider');
  if(!root) return;
  const slides = Array.from(root.querySelectorAll('.slide'));
  const dots   = Array.from(root.querySelectorAll('.dot'));
  const title  = document.getElementById('hero-title');
  const sub    = document.getElementById('hero-sub');

  let i = slides.findIndex(s => s.classList.contains('active'));
  if(i < 0) i = 0;
  let timer = null, hovering = false;

  function applyText(idx){
    const s = slides[idx];
    if(!s) return;
    title.textContent = s.dataset.title || '';
    sub.textContent   = s.dataset.sub   || '';
  }

  function go(n){
    slides[i].classList.remove('active');
    dots[i]?.classList.remove('active');
    i = (n + slides.length) % slides.length;
    slides[i].classList.add('active');
    dots[i]?.classList.add('active');
    applyText(i);
  }

  function next(){ go(i+1); }
  function play(){ stop(); timer = setInterval(next, 5000); }
  function stop(){ if(timer) clearInterval(timer); timer = null; }

  // dots
  dots.forEach((d, idx)=>{
    d.addEventListener('click', ()=>{ go(idx); play(); });
  });

  // pausa al pasar por encima / enfocar con teclado
  root.addEventListener('mouseenter', ()=>{ hovering = true; stop(); });
  root.addEventListener('mouseleave', ()=>{ hovering = false; play(); });
  root.addEventListener('focusin', stop);
  root.addEventListener('focusout', ()=>{ if(!hovering) play(); });

  // swipe táctil
  let x0 = null;
  root.addEventListener('touchstart', e=>{ x0 = e.touches[0].clientX; stop(); }, {passive:true});
  root.addEventListener('touchend',   e=>{
    if(x0==null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if(Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1));
    x0 = null; play();
  }, {passive:true});

  applyText(i);
  play();
})();

// ===== HERO SLIDER: flechas + teclado, autoplay sigue en 5s =====
(function enhanceHeroSlider(){
  const root   = document.querySelector('.hero-slider');
  if(!root) return;
  const slides = Array.from(root.querySelectorAll('.slide'));
  const dots   = Array.from(root.querySelectorAll('.dot'));
  const title  = document.getElementById('hero-title');
  const sub    = document.getElementById('hero-sub');
  const prevB  = document.getElementById('hero-prev');
  const nextB  = document.getElementById('hero-next');

  let i = slides.findIndex(s => s.classList.contains('active'));
  if(i < 0) i = 0;
  let timer = null, hovering = false;

  const applyText = (idx)=>{
    const s = slides[idx]; if(!s) return;
    title.textContent = s.dataset.title || '';
    sub.textContent   = s.dataset.sub   || '';
  };
  const go = (n)=>{
    slides[i].classList.remove('active'); dots[i]?.classList.remove('active');
    i = (n + slides.length) % slides.length;
    slides[i].classList.add('active'); dots[i]?.classList.add('active');
    applyText(i);
  };
  const next = ()=> go(i+1);
  const prev = ()=> go(i-1);
  const play = ()=>{ stop(); timer = setInterval(next, 5000); };
  const stop = ()=>{ if(timer) clearInterval(timer); timer = null; };

  dots.forEach((d, idx)=> d.addEventListener('click', ()=>{ go(idx); play(); }));
  root.addEventListener('mouseenter', ()=>{ hovering = true; stop(); });
  root.addEventListener('mouseleave', ()=>{ hovering = false; play(); });

  // flechas
  nextB?.addEventListener('click', ()=>{ next(); play(); });
  prevB?.addEventListener('click', ()=>{ prev(); play(); });

  // teclado (cuando el slider tiene foco o el usuario pulsa sobre la página)
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'ArrowRight'){ next(); play(); }
    if(e.key === 'ArrowLeft'){  prev(); play(); }
  });

  // swipe táctil
  let x0 = null;
  root.addEventListener('touchstart', e=>{ x0 = e.touches[0].clientX; stop(); }, {passive:true});
  root.addEventListener('touchend',   e=>{
    if(x0==null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if(Math.abs(dx) > 40) (dx < 0 ? next() : prev());
    x0 = null; play();
  }, {passive:true});

  applyText(i);
  play();
})();

