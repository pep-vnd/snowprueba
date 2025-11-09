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
      slot.innerHTML = '';
    });
}

// ================= Navbar =================
function wireMenu(){
  const btn  = document.getElementById('menu-btn');
  const list = document.getElementById('navlist');
  const bar  = document.querySelector('.topbar');
  const body = document.body; // Para controlar el overflow

  if(bar){
    const setOffset = ()=>{
      const h = bar.offsetHeight || 72;
      document.documentElement.style.setProperty('--nav-h', h + 'px');
    };
    const onScroll = ()=>{
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      // Solo añade 'scrolled' si el menú NO está abierto
      if (!list.classList.contains('open')) {
        bar.classList.toggle('scrolled', scrollTop > 10);
      }
    };

    setOffset(); onScroll();
    window.addEventListener('resize', setOffset);
    window.addEventListener('scroll', onScroll, { passive:true });
    document.addEventListener('scroll', onScroll, { passive:true });
    
    window.addEventListener('touchmove', (e) => {
      if (e.target.closest('#menu-btn')) {
        e.preventDefault();
      } else {
        onScroll();
      }
    }, { passive: false });
  }
  
  if(btn && list){
    btn.addEventListener('click', ()=>{
      const open = list.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      
      // ================== INICIO DE LOS CAMBIOS JS ==================
      // Añadir/quitar la clase 'menu-open' al topbar
      bar.classList.toggle('menu-open', open);
      
      // También necesitamos controlar el scroll del body
      if (open) {
        body.style.overflow = 'hidden'; // Evitar scroll del contenido de fondo
        bar.classList.remove('scrolled'); // Asegurarse de que no esté en modo "scrolled" cuando el menú se abre
      } else {
        body.style.overflow = ''; // Restaurar scroll
        onScroll(); // Volver a comprobar si debe estar 'scrolled' al cerrar el menú
      }
      // ================== FIN DE LOS CAMBIOS JS ==================
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

// ================= Año dinámico =================
(function setYearWhenReady(){
  const root = document.getElementById('footer'); if(!root) return;
  const apply = ()=>{ const y = root.querySelectorAll('#year'); y.forEach(el => el.textContent = new Date().getFullYear()); return y.length > 0; };
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

// ===== EL CARRUSEL DE FOOTER PARA MÓVIL HA SIDO ELIMINADO =====