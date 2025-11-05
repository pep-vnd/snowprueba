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

  // Navbar “sticky” + padding-top para que no tape el contenido
  if(bar){
    const setOffset = ()=>{ document.body.style.paddingTop = bar.offsetHeight + 'px'; };
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

// Mantén sincronizado el padding-top del body con la altura actual de la navbar
window.addEventListener('scroll', () => {
  const bar = document.querySelector('.topbar');
  if (bar) document.body.style.paddingTop = bar.offsetHeight + 'px';
}, { passive: true });

window.addEventListener('load', () => {
  const bar = document.querySelector('.topbar');
  if (bar) document.body.style.paddingTop = bar.offsetHeight + 'px';
});

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
