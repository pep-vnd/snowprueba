document.addEventListener('DOMContentLoaded', () => {
    // Lógica para las pestañas (tabs)
    const menuLinks = document.querySelectorAll('.menu-link');
    const contentTabs = document.querySelectorAll('.content-tab');

    menuLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            // Quita la clase 'active' de todos los enlaces
            menuLinks.forEach(item => item.classList.remove('active'));
            // Añade 'active' al enlace clicado
            link.classList.add('active');

            // Oculta todas las pestañas de contenido
            contentTabs.forEach(tab => tab.classList.remove('visible'));

            // Muestra la pestaña de contenido correspondiente
            const targetId = link.getAttribute('href');
            document.querySelector(targetId).classList.add('visible');
        });
    });

    // Lógica para el mapa interactivo (popup)
    const mapPoints = document.querySelectorAll('.map-point');
    const mapPopup = document.getElementById('map-popup');
    let activePoint = null;

    mapPoints.forEach(point => {
        point.addEventListener('click', (e) => {
            const title = point.dataset.title;
            const description = point.dataset.description;

            // Si el mismo punto está activo, lo cerramos
            if (activePoint === point) {
                mapPopup.classList.remove('active');
                activePoint = null;
                return;
            }

            // Actualiza el contenido del popup
            mapPopup.innerHTML = `<h4>${title}</h4><p>${description}</p>`;

            // Calcula la posición del popup
            const pointRect = point.getBoundingClientRect();
            const mapWrapperRect = point.closest('#map-wrapper').getBoundingClientRect();

            let popupX = pointRect.left - mapWrapperRect.left + (pointRect.width / 2);
            let popupY = pointRect.top - mapWrapperRect.top;

            // Posiciona el popup y lo hace visible
            mapPopup.style.left = `${popupX}px`;
            mapPopup.style.top = `${popupY}px`;
            mapPopup.classList.add('active');

            // Ajusta la posición del popup para que no se salga de la pantalla
            // Se usa requestAnimationFrame para asegurar que se ejecuta después del render inicial
            requestAnimationFrame(() => {
                const popupRect = mapPopup.getBoundingClientRect();

                // Ajuste horizontal
                if (popupX + popupRect.width > mapWrapperRect.width) {
                    mapPopup.style.left = `${mapWrapperRect.width - popupRect.width}px`;
                }
                if (popupX < 0) {
                    mapPopup.style.left = '0px';
                }

                // Ajuste vertical (que el popup aparezca encima del punto)
                mapPopup.style.transform = `translateY(-${popupRect.height + 15}px)`; // 15px de margen
            });

            activePoint = point;
        });
    });

    // Cierra el popup si se hace clic fuera de él o de un punto
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
    let carouselInterval; // Para el autoplay

    function showSlides(n) {
        // Reinicia el index si se pasa del final o del principio
        if (n >= slides.length) { slideIndex = 0 }
        if (n < 0) { slideIndex = slides.length - 1 }

        // Oculta todas las diapositivas y quita la clase 'active' de los puntos
        slides.forEach(slide => slide.style.display = 'none');
        dots.forEach(dot => dot.classList.remove('active'));

        // Muestra la diapositiva actual y activa el punto correspondiente
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

    // Navegación con botones
    prevButton.addEventListener('click', () => plusSlides(-1));
    nextButton.addEventListener('click', () => plusSlides(1));

    // Navegación con puntos
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => currentSlide(index));
    });

    // Autoplay
    function startAutoplay() {
        carouselInterval = setInterval(() => {
            plusSlides(1);
        }, 5000); // Cambia de diapositiva cada 5 segundos
    }

    function resetAutoplay() {
        clearInterval(carouselInterval);
        startAutoplay();
    }

    // Inicia el carrusel y el autoplay al cargar la página
    showSlides(slideIndex);
    startAutoplay();
});
