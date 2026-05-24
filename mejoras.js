
document.addEventListener('DOMContentLoaded', function () {

    // 1. ARRAY DE OBJETOS con datos de la tabla de tés
    const datosTés = [
        { tipo: 'Té verde Sencha', origen: 'Japón', temperatura: '70°C', infusion: '2-3 min' },
        { tipo: 'Té verde Longjing', origen: 'China', temperatura: '75°C', infusion: '2-3 min' },
        { tipo: 'Té negro Assam', origen: 'India', temperatura: '95°C', infusion: '3-5 min' },
        { tipo: 'Té negro Darjeeling', origen: 'India', temperatura: '90°C', infusion: '3-4 min' },
        { tipo: 'Té blanco Pai Mu Tan', origen: 'China', temperatura: '75°C', infusion: '4-5 min' },
        { tipo: 'Té Oolong Tieguanyin', origen: 'China', temperatura: '85°C', infusion: '3-4 min' },
        { tipo: 'Té Oolong Milk', origen: 'Taiwan', temperatura: '85°C', infusion: '3-4 min' },
        { tipo: 'Té rojo Pu-erh', origen: 'China', temperatura: '95°C', infusion: '4-5 min' },
        { tipo: 'Té matcha', origen: 'Japón', temperatura: '70°C', infusion: '1-2 min' },
        { tipo: 'Té chai especiado', origen: 'India', temperatura: '95°C', infusion: '5 min' }
    ];

    const formLogin = document.getElementById('formLogin');

    // 2. GENERAR TABLA DESDE API MOCKOON
    function generarTablaTes() {
        const contenedorTabla = document.querySelector('#tabla table');
        if (!contenedorTabla) {
            console.warn('No se encontró el contenedor de la tabla');
            return;
        }

        // MOSTRAR loading
        contenedorTabla.innerHTML = '<tr><td colspan="4">Cargando tés desde API...</td></tr>';

        // FETCH DESDE API MOCKOON
        fetch('http://localhost:3002/api/tes')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error en API: ' + response.status);
                }
                return response.json();
            })
            .then(datosTes => {
                // 1) GENERAR TABLA
                let html = `
                <thead class="table-tea">
                    <tr>
                        <th>Tipo de té</th>
                        <th>Origen</th>
                        <th>Temp.</th>
                        <th>Infusionado</th>
                    </tr>
                </thead>
                <tbody class="small">`;

                datosTes.forEach(tea => {
                    html += `
                    <tr>
                        <td>${tea.tipo}</td>
                        <td>${tea.origen}</td>
                        <td>${tea.temperatura}</td>
                        <td>${tea.infusion}</td>
                    </tr>`;
                });

                html += '</tbody>';
                contenedorTabla.innerHTML = html;
                console.log('Tabla cargada desde API con', datosTes.length, 'tés');

                // 2) CREAR GRÁFICO con los mismos datos
                crearGraficoTemperaturas(datosTes);
            })
            .catch(error => {
                console.error('Error cargando API:', error);
                contenedorTabla.innerHTML = '<tr class="table-danger"><td colspan="4">Error: No se pudo cargar la API. Revisa Mockoon.</td></tr>';
            });
    }

    // Crear gráfico de temperaturas y tiempos con Chart.js
    let graficoTe = null;

    function crearGraficoTemperaturas(datosTes) {
        const canvas = document.getElementById('chartTemperaturas');
        if (!canvas || !window.Chart) {
            console.warn('No se encontró canvas o Chart.js no está cargado');
            return;
        }

        // Etiquetas: nombre del té
        const labels = datosTes.map(t => t.tipo);

        // Valores numéricos: extraemos el número de la temperatura ("70°C" -> 70)
        const temperaturas = datosTes.map(t => {
            if (!t.temperatura) return null;
            const match = t.temperatura.toString().match(/\d+/);
            return match ? Number(match[0]) : null;
        });

        // Tiempos: "2-3 min" -> valor medio (2.5), "5 min" -> 5
        const tiempos = datosTes.map(t => {
            if (!t.infusion) return null;
            const numeros = t.infusion.toString().match(/\d+/g);

            if (!numeros) return null;

            if (numeros.length === 1) {
                return Number(numeros[0]);
            } else {
                const n1 = Number(numeros[0]);
                const n2 = Number(numeros[1]);
                return (n1 + n2) / 2;
            }
        });

        const coloresFondo = datosTes.map((_, i) => {
            const coloresBase = [
                'rgba(217, 119, 6, 0.6)',   // dorado
                'rgba(72, 120, 21, 0.6)',   // verde
                'rgba(107, 114, 128, 0.6)',  // gris
                'rgba(139, 69, 19, 0.6)',   // marrón
                'rgba(240, 218, 123, 0.6)',  // crudo
                'rgba(99, 102, 241, 0.6)',  // violeta
                'rgba(234, 179, 8, 0.6)',   // amarillo
                'rgba(148, 27, 12, 0.6)',   // rojo té
                'rgba(64, 235, 12, 0.6)',  // hierba
                'rgba(244, 114, 182, 0.6)' // rosa   
            ];
            return coloresBase[i % coloresBase.length];
        });

        const coloresBorde = coloresFondo.map(c => c.replace('0.6', '1'));
        const ctx = canvas.getContext('2d');

        // Si ya existía un gráfico, destruirlo antes de crear otro
        if (graficoTe) {
            graficoTe.destroy();
        }

        graficoTe = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    type: 'bar',
                    label: 'Temperatura (°C)',
                    data: temperaturas,
                    backgroundColor: coloresFondo,
                    borderColor: coloresBorde,
                    borderWidth: 1,
                    yAxisID: 'yTemp'
                },
                {
                    type: 'line',
                    label: 'Tiempo (min)',
                    data: tiempos,
                    borderColor: coloresBorde,
                    backgroundColor: coloresFondo,
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true,
                    pointRadius: 3,
                    yAxisID: 'yTiempo'
                }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    yTemp: {
                        type: 'linear',
                        position: 'left',
                        beginAtZero: true,
                        title: { display: true, text: 'Temperatura (°C)' }
                    },
                    yTiempo: {
                        type: 'linear',
                        position: 'right',
                        beginAtZero: true,
                        title: { display: true, text: 'Tiempo (min)' },
                        grid: { drawOnChartArea: false } // evita doble rejilla
                    },
                    x: {
                        ticks: { maxRotation: 45, minRotation: 45 }
                    }
                },
                plugins: {
                    legend: { display: true },
                    title: {
                        display: true,
                        text: 'Temperatura y tiempo recomendado por tipo de té'
                    }
                }
            }
        });

        console.log('Gráfico de temperaturas y tiempos creado con', labels.length, 'tés');

        // Activar control de modo (temp/tiempo/ambos)
        inicializarSelectorModoGrafico();
    }

    function inicializarSelectorModoGrafico() {
        const select = document.getElementById('modoGrafico');
        if (!select || !graficoTe) return;

        select.addEventListener('change', function () {
            const valor = this.value;
            const dsTemp = graficoTe.data.datasets[0];
            const dsTiempo = graficoTe.data.datasets[1];

            if (valor === 'temp') {
                dsTemp.hidden = false;
                dsTiempo.hidden = true;
            } else if (valor === 'tiempo') {
                dsTemp.hidden = true;
                dsTiempo.hidden = false;
            } else {
                // ambos
                dsTemp.hidden = false;
                dsTiempo.hidden = false;
            }

            graficoTe.update();
        });
    }


    // LOGIN NAVBAR + MODAL
    if (formLogin) {
        console.log('Login listener...');
        formLogin.addEventListener('submit', async (e) => { // ← Arrow function OK
            e.preventDefault();

            const usuario = document.getElementById('loginUsuario').value.trim();  // ← PRIMERO captura
            const password = document.getElementById('loginPassword').value;
            console.log('Submit DISPARADO con:', usuario, password);  // ← ANTES del fetch (para debug)

            try {
                const respuesta = await fetch('http://localhost:3002/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: usuario, password: password })  // ← usuario NO username
                });

                const datos = await respuesta.json();
                console.log('Respuesta:', respuesta.status, datos); // debug

                if (respuesta.ok && datos.success) {
                    isLoggedIn = true;
                    localStorage.setItem('teLoggedIn', JSON.stringify({
                        logeado: true,
                        usuario: usuario
                    }));

                    actualizarBotonLogin(usuario);
                    bootstrap.Modal.getInstance(document.getElementById('loginModal')).hide();

                    // mostrarToast
                    mostrarToast('¡Bienvenido!', true);
                } else {
                    // Error específico de la API
                    document.getElementById('loginError').textContent = datos.error || 'Error de API';
                    document.getElementById('loginError').classList.remove('d-none');
                    showToast('Error de login', false);
                }

            } catch (error) {
                console.error('Login error:', error);
                document.getElementById('loginError').textContent = 'Credenciales inválidas.';
                document.getElementById('loginError').classList.remove('d-none');
                showToast('Sin conexión', false);
            }
        });
    }


    // verificar la sesión
    const sesion = localStorage.getItem('teLoggedIn');
    if (sesion) {
        const datos = JSON.parse(sesion);
        if (datos.logeado) {
            isLoggedIn = true;
            actualizarBotonLogin(datos.usuario);
        }
    }
    //generarTablaTes();  // tabla API


// Cambiar texto botón según estado
function actualizarBotonLogin(username) {
    const btnLogin = document.getElementById('btnLogin');
    if (!btnLogin) return;
    if (username) {
        btnLogin.textContent = `Hola, ${username}`;
        btnLogin.className = 'btn btn-success ms-2';
        btnLogin.removeAttribute('data-bs-toggle');

        // Logout
        btnLogin.onclick = () => confirm('Logout?') && (localStorage.removeItem('teLoggedIn'), location.reload());
    } else {
        btnLogin.textContent = 'Login';
        btnLogin.className = 'btn btn-outline-light ms-2';
        btnLogin.setAttribute('data-bs-toggle', 'modal');
        btnLogin.setAttribute('data-bs-target', '#loginModal');
    }
}

// TOAST INFO
function mostrarToast(mensaje, esExito = false) {
    const toastElement = document.getElementById('formToast');
    const toastBody = document.getElementById('formToastBody');

    if (!toastElement || !toastBody) {
        console.warn('Toast no disponible');
        return;
    }

    toastBody.textContent = mensaje;
    const variant = esExito ? 'success' : 'danger';
    toastElement.className = `toast align-items-center text-bg-${variant} border-0`;

    const toast = new bootstrap.Toast(toastElement, { delay: 3000 });
    toast.show();
}

// 3. RESALTAR LENGUAJE (TIPO DE TÉ) SELECCIONADO
const selectTipo = document.getElementById('tipo');
if (selectTipo) {
    selectTipo.addEventListener('change', function () {
        // Eliminar resaltado previo de todas las opciones
        Array.from(this.options).forEach(opt => {
            opt.classList.remove('fw-bold', 'text-success', 'bg-light');
        });

        // Resaltar opción seleccionada
        const indiceSeleccionado = this.selectedIndex;
        if (this.value && this.value !== 'Elija una opción') {
            this.options[indiceSeleccionado].classList.add('fw-bold', 'text-success', 'bg-light');
            console.log('Tipo de té seleccionado:', this.value);
        }
    });
    console.log('Event listener para resaltado del select agregado');
}

// 4. ARRAY GLOBAL DE USUARIOS con localStorage
let arrayUsuarios = JSON.parse(localStorage.getItem('usuariosTe')) || [];
console.log('Usuarios cargados desde localStorage:', arrayUsuarios.length);

function actualizarUsuariosGlobal() {
    arrayUsuarios = JSON.parse(localStorage.getItem('usuariosTe') || '[]');
}

// 5. Guardar datos formulario + Sincronización con Salesforce CRM
function procesarFormulario() {
    const nombre = document.getElementById('nombre').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('passwordSus').value;
    const tipo = document.getElementById('tipo').value;
    const checkboxes = document.querySelectorAll('input[name=\"cafeina\"]:checked');
    const comentarios = document.getElementById('comentarios').value.trim();

    // Separamos el nombre completo en Nombre y Apellido de forma limpia para Salesforce
    const partesNombre = nombre.split(' ');
    const firstName = partesNombre[0];
    const lastName = partesNombre.length > 1 ? partesNombre.slice(1).join(' ') : 'Contacto Web';

    // 1. Añadir usuario en LocalStorage (Mantenemos tu lógica intacta)
    const nuevoUsuario = {
        nombre, email, password, tipo,
        nivelesCafeina: Array.from(checkboxes).map(cb => cb.value),
        comentarios,
        fechaRegistro: new Date().toLocaleString('es-ES')
    };

    arrayUsuarios.push(nuevoUsuario);
    localStorage.setItem('usuariosTe', JSON.stringify(arrayUsuarios));

    // 2. MAGIA: Envío asíncrono en tiempo real hacia Salesforce Apex REST EndPoint
    // Reutilizamos la estructura del JSON que espera tu clase Apex unificada
    const datosLeadCRM = {
        firstName: firstName,
        lastName: lastName,
        email: email,
        phone: "", // Opcional, vacío en este formulario
        wantsInfo: true // Por defecto true ya que se está suscribiendo de forma activa
    };

    // Endpoint público expuesto en tu Salesforce Site
    const urlSalesforce = 'https://aqua-dev-editon-dev-ed.develop.my.salesforce.com/services/apexrest/v1/wix-chat-leads/';

    fetch(urlSalesforce, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(datosLeadCRM)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Respuesta de red no conforme');
        }
        return response.text();
    })
    .then(resultado => {
        console.log('Respuesta de Salesforce CRM:', resultado);
        if (resultado.startsWith('OK:')) {
            const salesforceId = resultado.split(':')[1];
            showToast('¡Registrado y sincronizado con CRM! ID: ' + salesforceId, 'success');
        } else {
            showToast('Registrado localmente. Error en CRM: ' + resultado, 'warning');
        }
    })
    .catch(error => {
        console.error('Error al sincronizar con el CRM central:', error);
        // Fallback: si falla Salesforce (por ejemplo por CORS), notificamos al menos el éxito local
        showToast('¡Suscripción local guardada! Usuarios totales: ' + arrayUsuarios.length, 'dark');
    });

    // Resetear formulario tal como lo tenías
    formSuscripcion.reset();
    console.table(arrayUsuarios);
}

// 6. Guardar datos formulario
function procesarFormulario() {
    const nombre = document.getElementById('nombre').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('passwordSus').value;
    const tipo = document.getElementById('tipo').value;
    const checkboxes = document.querySelectorAll('input[name="cafeina"]:checked');
    const comentarios = document.getElementById('comentarios').value.trim();
    /*
        if (!nombre || !email || !password || !tipo || checkboxes.length === 0) {
            showToast('Por favor, complete todos los campos requeridos');
            return;
        }
    */
    // añadir usuario
    const nuevoUsuario = {
        nombre, email, password, tipo,
        nivelesCafeina: Array.from(checkboxes).map(cb => cb.value),
        comentarios,
        fechaRegistro: new Date().toLocaleString('es-ES')
    };

    arrayUsuarios.push(nuevoUsuario);
    localStorage.setItem('usuariosTe', JSON.stringify(arrayUsuarios));

    showToast('¡Registrado! Usuarios totales: ' + arrayUsuarios.length);
    formSuscripcion.reset();
    console.table(arrayUsuarios);
}

// INICIALIZAR TODO al cargar la página
actualizarUsuariosGlobal();
generarTablaTes();
console.log('Mejoras.js cargado correctamente - Listo para depuración');
});