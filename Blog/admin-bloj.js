document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('blog-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const title = document.getElementById('blog-title').value;
        const photo = document.getElementById('blog-photo').value;
        const description = document.getElementById('blog-description').value;
        const fullText = document.getElementById('blog-fulltext').value;

        if (title && photo && description && fullText) {
            
            // Simulación de la captura y envío de datos
            console.log("==========================================");
            console.log("✅ Datos del nuevo blog capturados:");
            console.log("Título:", title);
            console.log("URL de la Foto:", photo);
            console.log("Descripción:", description);
            console.log("Texto Detallado (Snippet):", fullText.substring(0, 100) + "...");
            console.log("==========================================");

            // Mensaje al administrador
            alert("✅ ¡Blog simulado CREADO con éxito!\n\nDatos capturados. En un sistema real, estos datos se enviarían a un CMS o base de datos para publicarse.\n\nRevisa la consola (F12) para ver la simulación de los datos enviados.");
            
            form.reset();
        } else {
            alert("Por favor, completa todos los campos para crear el artículo.");
        }
    });
});