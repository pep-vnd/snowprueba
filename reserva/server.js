/* =================================================================
   EL CÓDIGO DEL SERVIDOR (server.js)
================================================================= */

const express = require('express');
const nodemailer = require('nodemailer');
const app = express();
const PORT = 3000; // El puerto donde correrá el servidor

/* =================================================================
   CONFIGURACIÓN DE CORREO
   IMPORTANTE: Usa una "Contraseña de Aplicación" de Gmail,
   no tu contraseña real.
================================================================= */
const GMAIL_USER = 'jorgebolivarblandino@gmail.com'; // 👈 Reemplaza esto
const GMAIL_PASS = 'kmrqkovvmxnuqska'; // 👈 Reemplaza esto

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: GMAIL_USER,
        pass: GMAIL_PASS,
    },
});

// --- Middlewares ---
// 1. Para que Express entienda el JSON que le envía el frontend
app.use(express.json());
// 2. Para que el servidor "sirva" tu index.html y resto de archivos
app.use(express.static('.'));

/* =================================================================
   EL ENDPOINT DE LA API
================================================================= */
app.post('/api/reservar', async (req, res) => {
    console.log("¡RESERVA RECIBIDA!");

    try {
        // 1. Recibimos los datos del frontend
        const reserva = req.body;
        const emailCliente = reserva.persons[0].email;
        const emailAdmin = 'jorge.boliblandi@alum.uca.es';

        console.log('Datos:', reserva);

        // 2. Formatear los datos para los correos
        const datosHtml = `
            <h2>Datos de la Reserva</h2>
            <p><strong>Tipo:</strong> ${reserva.classType}</p>
            <p><strong>Personas:</strong> ${reserva.numPersons}</p>
            <p><strong>Fecha:</strong> ${reserva.date}</p>
            <p><strong>Turno:</strong> ${reserva.shift}</p>
            <h3>Participantes:</h3>
            <ul>
                ${reserva.persons.map(p => `
                    <li>
                        <strong>${p.name} ${p.lastname}</strong> (Nivel: ${p.level}, DNI: ${p.dni})
                        ${p.email ? `<br>Email: ${p.email}` : ''}
                    </li>
                `).join('')}
            </ul>
        `;

        // 3. Enviar correo de confirmación al CLIENTE
        //    *** TEXTO ACTUALIZADO AQUÍ ***
        const mailCliente = {
            from: `"Equipo de Reservas" <${GMAIL_USER}>`,
            to: emailCliente,
            subject: '¡Tu reserva está confirmada!',
            html: `
                <h1>¡Gracias por tu reserva!</h1>
                <p>Tu clase ha sido agendada con éxito. A continuación puedes ver los detalles.</p>
                <p>¡Nos vemos en la nieve!</p>
                <hr>
                ${datosHtml}
            `
        };
        
        // 4. Enviar correo de notificación al ADMIN
        const mailAdmin = {
            from: `"Sistema de Reservas" <${GMAIL_USER}>`,
            to: emailAdmin,
            subject: `Nueva Reserva: ${reserva.classType} para ${reserva.numPersons} pers.`,
            html: `
                <p>Se ha registrado una nueva reserva en el sistema.</p>
                <hr>
                ${datosHtml}
            `
        };

        // 5. Enviar los dos correos
        await Promise.all([
            transporter.sendMail(mailCliente),
            transporter.sendMail(mailAdmin)
        ]);

        console.log('Correos enviados con éxito.');
        
        // 6. Responder al frontend que todo salió bien
        res.status(200).json({ 
            message: "Reserva confirmada y correos enviados"
        });

    } catch (error) {
        console.error('Error al procesar la reserva:', error);
        res.status(500).json({
            message: "Error al enviar los correos de confirmación."
        });
    }
});

/* =================================================================
   INICIAR EL SERVIDOR
================================================================= */
app.listen(PORT, () => {
    console.log(`
      -----------------------------------------------
      Servidor de reservas escuchando en el puerto ${PORT}
      Abre tu web en: http://localhost:${PORT}
      -----------------------------------------------
    `);
});
