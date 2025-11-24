const PARTIALS_BASE = (() => {
  if (window.PARTIALS_BASE) return window.PARTIALS_BASE;
  const fromScript = document.currentScript
    || Array.from(document.querySelectorAll('script[src]')).find(s => s.src.includes('partials/partials.js'));
  if (fromScript) return new URL('./', fromScript.src).toString();
  return new URL('partials/', window.location.href).toString();
})();

const SITE_BASE = (() => {
  if (window.PARTIALS_SITE_BASE) return window.PARTIALS_SITE_BASE;
  try { return new URL('../', PARTIALS_BASE).toString(); }
  catch { return window.location.origin + '/'; }
})();

const partialUrl = (file) => new URL(file, PARTIALS_BASE).toString();
const siteUrl = (file) => file.startsWith('#') ? file : new URL(file, SITE_BASE).toString();

function resolvePartialAssets(root){
  if(!root) return;
  root.querySelectorAll('[data-partial-src]').forEach(el => {
    const asset = el.getAttribute('data-partial-src');
    if(asset) el.setAttribute('src', siteUrl(asset));
    const fallback = el.getAttribute('data-partial-fallback');
    if(fallback){
      const fallbackUrl = siteUrl(fallback);
      el.addEventListener('error', function handler(){
        el.removeEventListener('error', handler);
        el.src = fallbackUrl;
      }, { once:true });
      el.removeAttribute('data-partial-fallback');
    }
    el.removeAttribute('data-partial-src');
  });
  root.querySelectorAll('[data-partial-href]').forEach(el => {
    const href = el.getAttribute('data-partial-href');
    if(href) el.setAttribute('href', siteUrl(href));
    el.removeAttribute('data-partial-href');
  });
}

// ================= Carga de parciales =================
function loadPartial(id, url) {
  const slot = document.getElementById(id);
  
  return fetch(url)
    .then((res) => res.text())
    .then((html) => {
      
    // --- ARREGLO AUTOMÁTICO DE RUTAS ---
      // Si el body tiene la clase 'subpage', añadimos '../' a todo
      if (document.body.classList.contains('subpage')) {
        
        // 1. Arregla IMÁGENES (Logo, Carrito, Iconos, etc.)
        html = html.replace(/src="assets\//g, 'src="../assets/');
        
        // 2. Arregla ENLACES al inicio
        html = html.replace(/href="index.html"/g, 'href="../index.html"');
        
        // 3. Arregla ANCLAS (para que el menú funcione desde subpáginas)
        html = html.replace(/href="#/g, 'href="../index.html#');
        
        // 4. ¡CORRECCIÓN PARA ENLACES ENTRE SUBDOMINIOS!
        // Buscamos enlaces que vayan a carpetas hermanas (SierraNevada, Blog, contacto, reserva)
        // y les añadimos '../' delante.
        
        // Sierra Nevada
        html = html.replace(/href="SierraNevada\//g, 'href="../SierraNevada/');
        
        // Blog
        html = html.replace(/href="Blog\//g, 'href="../Blog/');

        // Tienda
        html = html.replace(/href="Tienda\//g, 'href="../Tienda/');
        
        // Contacto
        html = html.replace(/href="contacto\//g, 'href="../contacto/');
        
        // Reserva
        html = html.replace(/href="reserva\//g, 'href="../reserva/');

        // Enlace genérico a 'dist' (si lo usas)
        html = html.replace(/href="dist\//g, 'href="../dist/');
      }
      slot.innerHTML = html;
      if (id === 'navbar') wireMenu();
    })
    .catch((e) => {
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
      // Si el body tiene la clase 'always-solid-nav', forzamos que sea sólido siempre.
      if (document.body.classList.contains('always-solid-nav')) {
        bar.classList.add('scrolled');
        return; // Salimos de la función, no hacemos nada más
       }
      
      // Solo añade 'scrolled' si el menú NO está abierto
      if (!list.classList.contains('open')) {
        bar.classList.toggle('scrolled', scrollTop > 10);
        setOffset();
      }
    };

    setOffset(); onScroll();
    window.addEventListener('resize', setOffset);
    window.addEventListener('scroll', onScroll, { passive:true });
    document.addEventListener('scroll', onScroll, { passive:true });
    bar.addEventListener('transitionend', setOffset); //tienda
    
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
      setOffset();
      
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
const navPromise  = loadPartial('navbar', partialUrl('navbar.html'));
const footPromise = loadPartial('footer', partialUrl('footer.html'));

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


/* =========================================== */
/* === SCRIPT CARRITO SNIPCART CORREGIDO === */
/* =========================================== */

// 1. CONFIGURACIÓN: Aquí definimos tu API Key y opciones
window.SnipcartSettings = {
    publicApiKey: "TU_API_KEY_AQUI", // <--- ¡¡IMPORTANTE!! PEGA AQUÍ TU API KEY PÚBLICA DE SNIPCART
    loadStrategy: "on-user-interaction", // Carga el script solo cuando el usuario interactúa (mejor rendimiento)
    modalStyle: "side", // El carrito se abre lateralmente
    addProductBehavior: "none", // Evita que se abra solo al añadir (opcional)
};

// 2. LOADER: El script estándar de Snipcart
(function () {
  var c, d;
  (d = (c = window.SnipcartSettings).version) != null || (c.version = "3.0");

  var s, S;
  (S = (s = window.SnipcartSettings).timeoutDuration) != null ||
    (s.timeoutDuration = 2750);

  var l, p;
  (p = (l = window.SnipcartSettings).domain) != null ||
    (l.domain = "cdn.snipcart.com");

  var w, u;
  (u = (w = window.SnipcartSettings).protocol) != null ||
    (w.protocol = "https");

  var m, g;
  (g = (m = window.SnipcartSettings).loadCSS) != null ||
    (m.loadCSS = !0);

  var y =
      window.SnipcartSettings.version.includes("v3.0.0-ci") ||
      (window.SnipcartSettings.version != "3.0" &&
        window.SnipcartSettings.version.localeCompare(
          "3.4.0",
          void 0,
          { numeric: !0, sensitivity: "base" }
        ) === -1),
    f = ["focus", "mouseover", "touchmove", "scroll", "keydown"];

  window.LoadSnipcart = o;

  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", r)
    : r();

  function r() {
    if (window.SnipcartSettings.loadStrategy) {
      if (window.SnipcartSettings.loadStrategy === "on-user-interaction") {
        f.forEach(function (t) {
          return document.addEventListener(t, o);
        });
        setTimeout(o, window.SnipcartSettings.timeoutDuration);
      }
    } else {
      o();
    }
  }

  var a = !1;

  function o() {
    if (a) return;
    a = !0;

    let t = document.getElementsByTagName("head")[0],
      n = document.querySelector("#snipcart"),
      i = document.querySelector(
        'src[src^="' +
          window.SnipcartSettings.protocol +
          "://" +
          window.SnipcartSettings.domain +
          '"][src$="snipcart.js"]'
      ),
      e = document.querySelector(
        'link[href^="' +
          window.SnipcartSettings.protocol +
          "://" +
          window.SnipcartSettings.domain +
          '"][href$="snipcart.css"]'
      );

    if (!n) {
      n = document.createElement("div");
      n.id = "snipcart";
      n.setAttribute("hidden", "true");
      document.body.appendChild(n);
    }

    h(n);

    if (!i) {
      i = document.createElement("script");
      i.src =
        window.SnipcartSettings.protocol +
        "://" +
        window.SnipcartSettings.domain +
        "/themes/v" +
        window.SnipcartSettings.version +
        "/default/snipcart.js";
      i.async = !0;
      t.appendChild(i);
    }

    if (!e && window.SnipcartSettings.loadCSS) {
      e = document.createElement("link");
      e.rel = "stylesheet";
      e.type = "text/css";
      e.href =
        window.SnipcartSettings.protocol +
        "://" +
        window.SnipcartSettings.domain +
        "/themes/v" +
        window.SnipcartSettings.version +
        "/default/snipcart.css";
      t.prepend(e);
    }

    f.forEach(function (v) {
      return document.removeEventListener(v, o);
    });
  }

  function h(t) {
    if (!y) return;

    t.dataset.apiKey = window.SnipcartSettings.publicApiKey;

    if (window.SnipcartSettings.addProductBehavior) {
      t.dataset.configAddProductBehavior =
        window.SnipcartSettings.addProductBehavior;
    }

    if (window.SnipcartSettings.modalStyle) {
      t.dataset.configModalStyle = window.SnipcartSettings.modalStyle;
    }

    if (window.SnipcartSettings.currency) {
      t.dataset.currency = window.SnipcartSettings.currency;
    }

    if (window.SnipcartSettings.templatesUrl) {
      t.dataset.templatesUrl = window.SnipcartSettings.templatesUrl;
    }
  }
})();
