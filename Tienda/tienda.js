// ================= Lógica Visual Tienda =================
// (Añadir al final de app.js)

document.addEventListener('click', (e) => {
  // Detectar clic en botones de compra
  if (e.target.classList.contains('snipcart-add-item')) {
    const btn = e.target;
    
    // Guardar texto original
    const originalText = btn.textContent;
    
    // Feedback visual inmediato
    btn.textContent = '¡Añadido!';
    btn.style.backgroundColor = 'var(--deepblue)';
    btn.style.color = '#fff';
    btn.style.transform = 'scale(0.98)';
    
    // Revertir después de 1.5 segundos
    setTimeout(() => {
      btn.textContent = originalText;
      btn.style.backgroundColor = '';
      btn.style.color = '';
      btn.style.transform = '';
    }, 1500);
  }
});