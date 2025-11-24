document.addEventListener('DOMContentLoaded', () => {

    // --- MODIFICACIÓN: ACTIVAR PESTAÑA Y CONTROLAR SCROLL ---
    function activateTabAndScroll(hash) {
        if (!hash) return;

        const targetLink = document.querySelector(`.menu-link[href="${hash}"]`);
        const targetElement = document.querySelector(hash);

        if (targetLink && targetElement) {
            
            // 1. Activa la pestaña (quita 'active' de todas, pon 'active' en la buena)
            document.querySelectorAll('.menu-link').forEach(item => item.classList.remove('active'));
            targetLink.classList.add('active');

            // 2. Muestra el contenido (oculta todos, muestra el bueno)
            document.querySelectorAll('.content-tab').forEach(tab => tab.classList.remove('visible'));
            targetElement.classList.add('visible');
            
            // 3. Calcula la altura de las barras pegajosas
            const navbarHeight = document.getElementById('navbar')?.offsetHeight || 0;
            const menuBarHeight = document.getElementById('menu-bar-wrapper')?.offsetHeight || 0;
            const offset = navbarHeight + menuBarHeight + 120; // 20px de margen extra

            // 4. Calcula la posición real del elemento
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.scrollY - offset;

            // 5. Haz scroll a esa posición
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    }

    // Lógica para las pestañas (tabs)
    const menuLinks = document.querySelectorAll('.menu-link');

    menuLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Prevenimos el salto de ancla por defecto, porque lo controlamos nosotros
            e.preventDefault(); 
            const targetId = link.getAttribute('href');
            
            // Llama a nuestra función principal que activa y hace scroll
            activateTabAndScroll(targetId);

            // Opcional: actualiza la URL sin recargar la página
            window.history.pushState(null, null, targetId);
        });
    });

    // --- MODIFICACIÓN: Ejecutar la función al cargar la página ---
    // Comprueba si la URL ya tiene un hash (ej. #forfaits-content)
    // y ejecuta la función para que se cargue la pestaña correcta
    if (window.location.hash) {
        // Usamos un pequeño 'setTimeout' para asegurar que el DOM está 100% listo
        setTimeout(() => {
            activateTabAndScroll(window.location.hash);
        }, 100);
    }
    // --- FIN DE LA MODIFICACIÓN ---


    // Lógica para el mapa interactivo (popup)
    const mapPoints = document.querySelectorAll('.map-point');
    const mapPopup = document.getElementById('map-popup');
    let activePoint = null;

    mapPoints.forEach(point => {
        point.addEventListener('click', (e) => {
            const title = point.dataset.title;
            const description = point.dataset.description;

            if (activePoint === point) {
                mapPopup.classList.remove('active');
                activePoint = null;
                return;
            }

            mapPopup.innerHTML = `<h4>${title}</h4><p>${description}</p>`;
            const pointRect = point.getBoundingClientRect();
            const mapWrapperRect = point.closest('#map-wrapper').getBoundingClientRect();
            let popupX = pointRect.left - mapWrapperRect.left + (pointRect.width / 2);
            let popupY = pointRect.top - mapWrapperRect.top;

            mapPopup.style.left = `${popupX}px`;
            mapPopup.style.top = `${popupY}px`;
            mapPopup.classList.add('active');

            requestAnimationFrame(() => {
                const popupRect = mapPopup.getBoundingClientRect();
                if (popupX + popupRect.width > mapWrapperRect.width) {
                    mapPopup.style.left = `${mapWrapperRect.width - popupRect.width}px`;
                }
                if (popupX < 0) {
                    mapPopup.style.left = '0px';
                }
                mapPopup.style.transform = `translateY(-${popupRect.height + 15}px)`;
            });
            activePoint = point;
        });
    });

    document.addEventListener('click', (e) => {
        if (!mapPopup.contains(e.target) && !e.target.closest('.map-point')) {
            mapPopup.classList.remove('active');
            activePoint = null;
        }
    });

    // --- Lógica del Carrusel de Imágenes ---
    let slideIndex = 0;
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.dot');
    const prevButton = document.querySelector('.prev');
    const nextButton = document.querySelector('.next');
    let carouselInterval; 

    if (slides.length > 0) { // Asegúrate de que el carrusel existe
        function showSlides(n) {
            if (n >= slides.length) { slideIndex = 0 }
            if (n < 0) { slideIndex = slides.length - 1 }

            slides.forEach(slide => slide.style.display = 'none');
            dots.forEach(dot => dot.classList.remove('active'));

            slides[slideIndex].style.display = 'block';
            dots[slideIndex].classList.add('active');
        }

        function plusSlides(n) {
            showSlides(slideIndex += n);
            resetAutoplay();
        }

        function currentSlide(n) {
            showSlides(slideIndex = n);
            resetAutoplay();
        }

        prevButton.addEventListener('click', () => plusSlides(-1));
        nextButton.addEventListener('click', () => plusSlides(1));

        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => currentSlide(index));
        });

        function startAutoplay() {
            carouselInterval = setInterval(() => {
                plusSlides(1);
            }, 5000); 
        }

        function resetAutoplay() {
            clearInterval(carouselInterval);
            startAutoplay();
        }

        showSlides(slideIndex);
        startAutoplay();
    }
});