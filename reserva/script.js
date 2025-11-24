document.addEventListener('DOMContentLoaded', () => {
    const formWrapper = document.getElementById('booking-form-wrapper');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const confirmBtn = document.getElementById('confirm-btn');
    const loadingSpinner = document.getElementById('loading-spinner');
    const errorMessage = document.getElementById('error-message');

    let currentScreen = 0;
    const bookingData = {
        classType: '',
        numPersons: 1,
        date: '',
        shift: '',
        persons: [],
    };

    const screens = [
        // Pantalla 1: Tipo de clase
        {
            render: () => `
                <div class="screen">
                    <h2>¿Qué clase te gustaría reservar?</h2>
                    <div class="option-group">
                        <button type="button" class="option-btn" data-value="esqui"><i class="fas fa-skiing"></i> Esquí</button>
                        <button type="button" class="option-btn" data-value="snowboard"><i class="fas fa-snowboarding"></i> Snowboarding</button>
                    </div>
                </div>
            `,
            init: () => {
                const buttons = formWrapper.querySelectorAll('.option-btn');
                buttons.forEach(button => {
                    button.classList.toggle('selected', bookingData.classType === button.dataset.value);
                    button.onclick = () => {
                        buttons.forEach(btn => btn.classList.remove('selected'));
                        button.classList.add('selected');
                        bookingData.classType = button.dataset.value;
                        validateScreen(currentScreen);
                    };
                });
            },
            validate: () => bookingData.classType !== ''
        },

        // Pantalla 2: Número de personas, fecha y turno
        {
            render: () => `
                <div class="screen">
                    <h2>Detalles de la Reserva</h2>
                    <label for="numPersons"><i class="fas fa-users"></i> Número de personas:</label>
                    <input type="number" id="numPersons" min="1" max="10" value="${bookingData.numPersons}" required>

                    <label for="bookingDate"><i class="fas fa-calendar-alt"></i> Fecha de la clase:</label>
                    <input type="date" id="bookingDate" value="${bookingData.date}" required>

                    <label><i class="fas fa-clock"></i> Turno:</label>
                    <div class="option-group">
                        <button type="button" class="option-btn" data-value="manana"><i class="fas fa-sun"></i> Mañana</button>
                        <button type="button" class="option-btn" data-value="tarde"><i class="fas fa-cloud-sun"></i> Tarde</button>
                    </div>
                </div>
            `,
            init: () => {
                const numPersonsInput = document.getElementById('numPersons');
                const bookingDateInput = document.getElementById('bookingDate');
                const shiftButtons = formWrapper.querySelectorAll('.option-group .option-btn');

                // --- INICIO LÓGICA DE FECHA ---
                const today = new Date();
                today.setHours(0, 0, 0, 0); // Normalizar a medianoche
                const currentYear = today.getFullYear();
                const currentMonth = today.getMonth(); // 0 (Ene) - 11 (Dic)

                let minDate, maxDateString;

                // Restricción 1: Mínimo 2 días de antelación
                const leadTimeMinDate = new Date();
                leadTimeMinDate.setDate(today.getDate() + 2);
                leadTimeMinDate.setHours(0, 0, 0, 0);

                // Restricción 2: Temporada Nov-Abr
                if (currentMonth >= 10) { // Estamos en Nov o Dic
                    minDate = leadTimeMinDate;
                    maxDateString = `${currentYear + 1}-04-30`;
                } else if (currentMonth <= 3) { // Estamos en Ene, Feb, Mar o Abr
                    minDate = leadTimeMinDate;
                    maxDateString = `${currentYear}-04-30`;
                } else { // Estamos fuera de temporada (May - Oct)
                    const nextSeasonStartDate = new Date(currentYear, 10, 1); // 1 de Nov
                    minDate = (leadTimeMinDate > nextSeasonStartDate) ? leadTimeMinDate : nextSeasonStartDate;
                    maxDateString = `${currentYear + 1}-04-30`; 
                }
                
                const minDateString = minDate.toISOString().split('T')[0];

                // *** ARREGLO DEL BUG DE VALIDACIÓN ***
                screens[1].minValidDate = minDate; // Objeto Date
                screens[1].maxValidDate = new Date(maxDateString + 'T00:00:00'); // Objeto Date

                // Aplicar al input
                bookingDateInput.min = minDateString;
                bookingDateInput.max = maxDateString;
                // --- FIN LÓGICA DE FECHA ---

                numPersonsInput.onchange = () => {
                    bookingData.numPersons = parseInt(numPersonsInput.value);
                    validateScreen(currentScreen);
                };
                bookingDateInput.onchange = () => {
                    bookingData.date = bookingDateInput.value;
                    validateScreen(currentScreen);
                };

                shiftButtons.forEach(button => {
                    button.classList.toggle('selected', bookingData.shift === button.dataset.value);
                    button.onclick = () => {
                        shiftButtons.forEach(btn => btn.classList.remove('selected'));
                        button.classList.add('selected');
                        bookingData.shift = button.dataset.value;
                        validateScreen(currentScreen);
                    };
                });
                
                validateScreen(currentScreen);
            },
            validate: () => {
                const numPersonsValid = bookingData.numPersons >= 1 && bookingData.numPersons <= 10;
                const shiftValid = bookingData.shift !== '';
                
                if (!bookingData.date) return false; 

                const selectedDateParts = bookingData.date.split('-');
                const selectedDate = new Date(selectedDateParts[0], selectedDateParts[1] - 1, selectedDateParts[2]);
                selectedDate.setHours(0, 0, 0, 0); 

                const minValidDate = screens[1].minValidDate;
                const maxValidDate = screens[1].maxValidDate;

                if (!minValidDate || !maxValidDate) {
                    console.error("Límites de fecha no definidos");
                    return false; 
                }

                const dateValid = selectedDate >= minValidDate && selectedDate <= maxValidDate;
                
                return numPersonsValid && shiftValid && dateValid;
            }
        },

        // Pantalla 3: Datos de cada persona
        {
            render: () => {
                let html = `
                    <div class="screen">
                        <h2>Datos de los Participantes</h2>
                `;
                for (let i = 0; i < bookingData.numPersons; i++) {
                    const person = bookingData.persons[i] || {};
                    html += `
                        <div class="person-data-box" data-person-index="${i}">
                            <h3><i class="fas fa-user"></i> Persona ${i + 1}</h3>
                            <label for="name-${i}">Nombre:</label>
                            <input type="text" id="name-${i}" value="${person.name || ''}" required>

                            <label for="lastname-${i}">Apellido:</label>
                            <input type="text" id="lastname-${i}" value="${person.lastname || ''}" required>

                            <label for="dni-${i}">DNI:</label>
                            <input type="text" id="dni-${i}" value="${person.dni || ''}" required>

                            <label for="level-${i}">Nivel:</label>
                            <select id="level-${i}" required>
                                <option value="">Selecciona un nivel</option>
                                <option value="principiante" ${person.level === 'principiante' ? 'selected' : ''}>Principiante</option>
                                <option value="intermedio" ${person.level === 'intermedio' ? 'selected' : ''}>Intermedio</option>
                                <option value="avanzado" ${person.level === 'avanzado' ? 'selected' : ''}>Avanzado</option>
                            </select>

                            ${i === 0 ? `
                                <label for="email-${i}"><i class="fas fa-envelope"></i> Correo Electrónico (Persona 1):</label>
                                <input type="email" id="email-${i}" value="${person.email || ''}" required>
                            ` : ''}
                        </div>
                    `;
                }
                html += `</div>`;
                return html;
            },
            init: () => {
                while (bookingData.persons.length < bookingData.numPersons) {
                    bookingData.persons.push({});
                }
                bookingData.persons.splice(bookingData.numPersons);


                formWrapper.querySelectorAll('.person-data-box').forEach((box, index) => {
                    const person = bookingData.persons[index];
                    const nameInput = box.querySelector(`#name-${index}`);
                    const lastnameInput = box.querySelector(`#lastname-${index}`);
                    const dniInput = box.querySelector(`#dni-${index}`);
                    const levelSelect = box.querySelector(`#level-${index}`);
                    const emailInput = box.querySelector(`#email-${index}`);

                    nameInput.oninput = () => { person.name = nameInput.value; validateScreen(currentScreen); };
                    lastnameInput.oninput = () => { person.lastname = lastnameInput.value; validateScreen(currentScreen); };
                    dniInput.oninput = () => { person.dni = dniInput.value; validateScreen(currentScreen); };
                    levelSelect.onchange = () => { person.level = levelSelect.value; validateScreen(currentScreen); };
                    if (emailInput) {
                        emailInput.oninput = () => { person.email = emailInput.value; validateScreen(currentScreen); };
                    }
                });

                validateScreen(currentScreen); 
            },
            validate: () => {
                for (let i = 0; i < bookingData.numPersons; i++) {
                    const person = bookingData.persons[i];
                    const personIsValid = person.name && person.lastname && person.dni && person.level;
                    if (!personIsValid) return false;

                    if (i === 0) { 
                        const emailValid = person.email && person.email.includes('@') && person.email.includes('.');
                        if (!emailValid) return false;
                    }
                }
                return true;
            }
        },

        // Pantalla 4: Confirmación (Este es un paso final, no un formulario interactivo)
        //    *** TEXTO ACTUALIZADO AQUÍ ***
        {
            render: () => `
                <div class="screen">
                    <h2>¡Reserva Confirmada!</h2>
                    <div class="success-message">
                        <p><i class="fas fa-check-circle"></i> ¡Tu clase ha sido reservada con éxito!</p>
                        <p>Hemos enviado un correo de confirmación con todos los detalles a tu email.</p>
                        <p>¡Muchas gracias y nos vemos pronto!</p>
                    </div>
                </div>
            `,
            init: () => {
                prevBtn.style.display = 'none'; 
                nextBtn.style.display = 'none'; 
                confirmBtn.style.display = 'none'; 
            },
            validate: () => true 
        }
    ];

    function showScreen(index) {
        if (index < 0 || index >= screens.length) return;

        currentScreen = index;
        formWrapper.innerHTML = screens[currentScreen].render();
        screens[currentScreen].init();
        updateNavigationButtons();
    }

    function updateNavigationButtons() {
        if (currentScreen === screens.length - 1) {
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
            confirmBtn.style.display = 'none';
            return;
        }

        prevBtn.style.display = currentScreen > 0 ? 'inline-flex' : 'none'; 
        nextBtn.style.display = currentScreen < screens.length - 2 ? 'inline-flex' : 'none'; 
        confirmBtn.style.display = currentScreen === screens.length - 2 ? 'inline-flex' : 'none'; 
    }


    function validateScreen(index) {
        errorMessage.style.display = 'none'; 
        const isValid = screens[index].validate(); 
        nextBtn.disabled = !isValid;
        confirmBtn.disabled = !isValid;

        if (!isValid && currentScreen < screens.length - 1) { 
            
            if (index === 1 && bookingData.date) { 
                const selectedDateParts = bookingData.date.split('-');
                const selectedDate = new Date(selectedDateParts[0], selectedDateParts[1] - 1, selectedDateParts[2]);
                selectedDate.setHours(0, 0, 0, 0);
                
                const minValidDate = screens[1].minValidDate;
                const maxValidDate = screens[1].maxValidDate;

                if (!minValidDate || !maxValidDate) {
                     errorMessage.textContent = 'Por favor, completa todos los campos obligatorios para continuar.';
                }
                else if (selectedDate < minValidDate || selectedDate > maxValidDate) {
                    errorMessage.textContent = 'Fecha no válida. Solo se puede reservar de Nov a Abr, y con 2 días de antelación.';
                } else {
                    errorMessage.textContent = 'Por favor, completa todos los campos obligatorios para continuar.';
                }
            } else {
                 errorMessage.textContent = 'Por favor, completa todos los campos obligatorios para continuar.';
            }
            
            errorMessage.style.display = 'block';
        }
        return isValid;
    }

    prevBtn.onclick = () => {
        if (currentScreen > 0) {
            showScreen(currentScreen - 1);
        }
    };

    nextBtn.onclick = () => {
        if (validateScreen(currentScreen)) {
            showScreen(currentScreen + 1);
        }
    };

    // *** LLAMADA REAL AL BACKEND ***
    confirmBtn.onclick = async () => {
        if (!validateScreen(currentScreen)) return;

        loadingSpinner.style.display = 'block';
        confirmBtn.disabled = true;
        prevBtn.disabled = true;
        errorMessage.style.display = 'none';

        console.log('Datos de la reserva a enviar:', bookingData);
        try {
            // 1. Enviamos los datos a nuestro servidor (backend)
            const response = await fetch('/api/reservar', {
                method: 'POST', 
                headers: {
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify(bookingData) 
            });

            // 2. Comprobamos si el servidor respondió bien
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error del servidor');
            }

            // 3. El servidor respondió con éxito
            const result = await response.json(); 
            console.log('Reserva procesada:', result);
            
            showScreen(currentScreen + 1); // Mostrar pantalla de confirmación final

        } catch (error) {
            // 4. Capturamos errores (de red o del servidor)
            console.error('Error al confirmar la reserva:', error);
            errorMessage.textContent = error.message || 'Hubo un error al procesar tu reserva. Por favor, inténtalo de nuevo.';
            errorMessage.style.display = 'block';
        } finally {
            // 5. Esto se ejecuta siempre
            loadingSpinner.style.display = 'none';
            confirmBtn.disabled = false;
            prevBtn.disabled = false;
        }
    };

    // Initialize the first screen
    showScreen(0);
});
