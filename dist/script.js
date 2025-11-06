// Envolvemos todo en un contexto de GSAP apuntando a #snv
// Esto soluciona el problema de que JS no encuentre los elementos.
let ctx = gsap.context(() => {

  /* =========================================== */
  /* ANIMACIÓN GSAP (Parallax) */
  /* =========================================== */
  gsap
    .timeline({
      scrollTrigger: {
        trigger: '.scrollDist', // Busca .scrollDist DENTRO de #snv
        start: '0 0',
        end: '100% 100%',
        scrub: 1,
      },
    })
    .fromTo('.sky', { y: 0 }, { y: -200 }, 0)
    .fromTo('.cloud1', { y: 100 }, { y: -800 }, 0)
    .fromTo('.cloud2', { y: -150 }, { y: -500 }, 0)
    .fromTo('.cloud3', { y: -50 }, { y: -650 }, 0)
    .fromTo('.mountBg', { y: -10 }, { y: -100 }, 0)
    .fromTo('.mountMg', { y: -30 }, { y: -250 }, 0)
    .fromTo('.mountFg', { y: -50 }, { y: -600 }, 0);


  /* =========================================== */
  /* BOTÓN FLECHA */
  /* =========================================== */
  
  // Busca #arrow-btn DENTRO de #snv
  const arrowBtn = document.querySelector('#arrow-btn'); 

  arrowBtn.addEventListener('mouseenter', () => {
    gsap.to('.arrow', { y: 10, duration: 0.8, ease: 'back.inOut(3)', overwrite: 'auto' });
  });

  arrowBtn.addEventListener('mouseleave', () => {
    gsap.to('.arrow', { y: 0, duration: 0.5, ease: 'power3.out', overwrite: 'auto' });
  });

  arrowBtn.addEventListener('click', () => {
    gsap.to(window, { scrollTo: innerHeight, duration: 1.5, ease: 'power1.inOut' });
  });


  /* =========================================== */
  /* LÓGICA DEL MAPA INTERACTIVO (Pop-up) */
  /* =========================================== */

  // Busca .map-point DENTRO de #snv
  const allPoints = document.querySelectorAll('.map-point');
  // Busca #map-popup DENTRO de #snv
  const popup = document.getElementById('map-popup');
  // Busca #map-wrapper img DENTRO de #snv
  const mapImage = document.querySelector('#map-wrapper img'); 

  allPoints.forEach(point => {
    point.addEventListener('click', (event) => {
      event.stopPropagation();
      
      const title = point.dataset.title;
      const description = point.dataset.description;
      
      popup.innerHTML = `
        <h4>${title}</h4>
        <p>${description}</p>
      `;
      
      popup.style.top = point.style.top;
      popup.style.left = point.style.left;
      
      popup.classList.add('active');
    });
  });

  const closePopup = () => {
    popup.classList.remove('active');
  };

  mapImage.addEventListener('click', closePopup);

}, "#snv"); // <-- La magia de GSAP está aquí.


/* ======================================================= */
/* === LÓGICA PORTADA DESDE APP.JS (Footer, Scroll, etc.) === */
/* ======================================================= */
/*
  Esta lógica se aplica al Navbar y Footer, que están
  FUERA del contenedor #snv, por eso va fuera del 
  contexto de GSAP.
*/

// ---- Año dinámico en el footer ----
(function setYearWhenReady(){
  const root = document.getElementById('footer');
  if(!root) return;
  const apply = ()=>{
    const y = root.querySelector('#year');
    if(y){ y.textContent = new Date().getFullYear(); return true; }
    return false;
  };
  if(apply()) return;
  // Observador para esperar a que el JS inyecte el HTML del footer
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
    // Ajuste: El alto del scroll es el '.scrollDist' dentro de #snv
    const scrollDist = document.querySelector('#snv .scrollDist');
    const scrollHeight = (scrollDist ? scrollDist.offsetHeight : h.scrollHeight) - h.clientHeight;
    
    const pct = Math.max(0, Math.min(1, scrollHeight ? (scrollTop / scrollHeight) : 0));
    line.style.width = (pct * 100).toFixed(2) + '%';
  };
  set();
  window.addEventListener('scroll', set, { passive:true });
  window.addEventListener('resize', set);
})();


// ---- Reveal-once para el footer ----
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

// Espera a que el footer se inyecte (con el script de index.html)
// y le aplica la animación de revelado.
(function waitFooter(){
  const root = document.getElementById('footer');
  if(!root) return;
  const bind = ()=>{
    root.querySelectorAll('.reveal-once').forEach(el=> io.observe(el));
  };
  // Intento directo
  bind();
  // Y observador por si llega más tarde
  const mo = new MutationObserver(()=>{ 
    bind();
    // Una vez bindeado, nos desconectamos
    mo.disconnect();
  });
  mo.observe(root, { childList:true, subtree:true });
})();