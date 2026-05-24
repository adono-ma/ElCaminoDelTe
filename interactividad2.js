// INTERACTIVIDAD.JS - Funcionalidades avanzadas del proyecto de tés
document.addEventListener('DOMContentLoaded', function () {

    // 1. RELOJ DIGITAL/ANALÓGICO debajo de Guía Rápida
    function crearReloj() {
        const guiaRapida = document.querySelector('aside .card-body');
        if (!guiaRapida) return;

        const relojContainer = document.createElement('div');
        relojContainer.id = 'relojContainer';
        relojContainer.className = 'mt-3 p-3 border rounded bg-light';
        relojContainer.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-2">
                <h6 class="mb-0">¿Qué hora es?</h6>
                <!-- CAMBIAR btn-outline-secondary por btn-outline-dark -->
                <button id="toggleReloj" class="btn btn-sm btn-outline-dark">Analógico</button>
            </div>
            <div id="relojDigital" class="h4 mb-0 fw-bold text-center"></div>
            <canvas id="relojAnalogico" width="120" height="120" class="d-none mx-auto" style="border-radius:50%;"></canvas>
        `;
        guiaRapida.appendChild(relojContainer);

        let modoDigital = true;
        const digitalEl = document.getElementById('relojDigital');
        const analogicoEl = document.getElementById('relojAnalogico');
        const toggleBtn = document.getElementById('toggleReloj');

        function actualizarReloj() {
            const ahora = new Date();
            const tiempo = ahora.toLocaleTimeString('es-ES', { hour12: false });
            digitalEl.textContent = tiempo;

            // Analógico simple
            const ctx = analogicoEl.getContext('2d');
            ctx.clearRect(0, 0, 120, 120);
            ctx.strokeStyle = '#24461d';
            ctx.lineWidth = 2;
            const centroX = 60, centroY = 60, radio = 50;

            // Círculo
            ctx.beginPath();
            ctx.arc(centroX, centroY, radio, 0, 2 * Math.PI);
            ctx.stroke();

            // Manecillas
            const horas = ahora.getHours() % 12;
            const minutos = ahora.getMinutes();
            const segundos = ahora.getSeconds();

            // Hora
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(centroX, centroY);
            ctx.lineTo(centroX + Math.sin((horas * 30 + minutos * 0.5) * Math.PI / 180) * 30,
                centroY - Math.cos((horas * 30 + minutos * 0.5) * Math.PI / 180) * 30);
            ctx.stroke();

            // Minuto
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(centroX, centroY);
            ctx.lineTo(centroX + Math.sin(minutos * 6 * Math.PI / 180) * 40,
                centroY - Math.cos(minutos * 6 * Math.PI / 180) * 40);
            ctx.stroke();

            // Segundo
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'rgb(72, 120, 21)';
            ctx.beginPath();
            ctx.moveTo(centroX, centroY);
            ctx.lineTo(centroX + Math.sin(segundos * 6 * Math.PI / 180) * 45,
                centroY - Math.cos(segundos * 6 * Math.PI / 180) * 45);
            ctx.stroke();
        }

        toggleBtn.addEventListener('click', function () {
            modoDigital = !modoDigital;
            digitalEl.classList.toggle('d-none', !modoDigital);
            analogicoEl.classList.toggle('d-none', modoDigital);
            this.textContent = modoDigital ? 'Analógico' : 'Digital';
        });

        actualizarReloj();
        setInterval(actualizarReloj, 1000);
    }

    // 2. MODAL CUENTA ATRÁS para tabla de tés
    function crearToastCrono() {
        let toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
            toastContainer.style.zIndex = '1050';
            document.body.appendChild(toastContainer);
        }

        const toastHtml = `
    <div id="toastCrono" class="toast" role="alert" aria-live="polite" aria-atomic="true">
        <div class="toast-header" id="toastHeader">
            <img src="sello.svg" width="20" height="20" class="rounded me-2" alt="Té">
            <strong class="me-auto" id="toastTitulo">Infusionar Té</strong>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"
          aria-label="Cerrar"></button>
        </div>
        <div class="toast-body text-center">
            <div class="h5 mb-2 fw-bold text-primary" id="toastCronoDisplay">00:00:0</div>
            <div class="small text-muted" id="toastTiempoObjetivo">Objetivo: 3 min</div>
        </div>
    </div>`;

        toastContainer.insertAdjacentHTML('beforeend', toastHtml);

        const toastEl = document.getElementById('toastCrono');
        const header = document.getElementById('toastHeader');
        const toast = new bootstrap.Toast(toastEl, { autohide: false });

        let intervalo = null;
        let totalSegundos = 0;
        let decimasRestantes = 0;

        // Ajusta el color del toast según el tema
        function actualizarTemaToast() {
            const esOscuro = document.documentElement.getAttribute('data-bs-theme') === 'dark' ||
                document.body.classList.contains('dark-theme');

            if (esOscuro) {
                header.classList.remove('bg-tea', 'text-dark');
                header.classList.add('bg-tea', 'text-white');
                toastEl.classList.remove('bg-light', 'text-dark');
                toastEl.classList.add('bg-dark', 'text-white');
            } else {
                header.classList.remove('bg-tea', 'text-white');
                header.classList.add('bg-tea', 'text-dark');
                toastEl.classList.remove('bg-dark', 'text-white');
                toastEl.classList.add('bg-light', 'text-dark');
            }
        }

        function actualizarDisplay() {
            const totalSegs = Math.floor(decimasRestantes / 10);
            const mins = Math.floor(totalSegs / 60).toString().padStart(2, '0');
            const segs = (totalSegs % 60).toString().padStart(2, '0');
            const decimas = (decimasRestantes % 60).toString().padStart(2, '0');
            document.getElementById('toastCronoDisplay').textContent = `${mins}:${segs}:${decimas}`;
        }

        // Obtener tiempo del té desde la tabla
        window.obtenerTiempoTe = function (tipoTe) {
            const fila = Array.from(document.querySelectorAll('#tabla tbody tr'))
                .find(row => row.querySelector('td:first-child')?.textContent.includes(tipoTe));

            if (!fila) return { tiempoStr: "3 min", segundos: 180 }; // fallback

            const tiempoStr = fila.querySelector('td:nth-child(4)')?.textContent.trim() || "3 min";

            // Convertir a segundos
            const numeros = tiempoStr.match(/\d+/g);
            let segundos;
            if (numeros?.length === 1) {
                segundos = Number(numeros[0]) * 60;
            } else if (numeros?.length === 2) {
                const n1 = Number(numeros[0]), n2 = Number(numeros[1]);
                segundos = ((n1 + n2) / 2) * 60; // media en segundos
            } else {
                segundos = 180; // 3 min por defecto
            }

            return { tiempoStr, segundos };
        };

        // Iniciar cuenta atrás
        window.iniciarToastCrono = function (titulo, segundos, textoObjetivo) {
            clearInterval(intervalo);

            document.getElementById('toastTitulo').textContent = titulo;
            document.getElementById('toastTiempoObjetivo').textContent = `Objetivo: ${textoObjetivo}`;

            totalSegundos = segundos;
            decimasRestantes = segundos * 10;
            actualizarDisplay();
            actualizarTemaToast(); // ajusta colores al tema actual

            intervalo = setInterval(() => {
                if (decimasRestantes > 0) {
                    decimasRestantes--;
                    actualizarDisplay();
                } else {
                    clearInterval(intervalo);
                    alert('¡Tiempo de infusión terminado!');
                }
            }, 100);

            toast.show();
        };

        // Con cambio de tema
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', actualizarTemaToast);
        }

        // Cambiar tema al actualizar
        actualizarTemaToast();

        return toast;
    }

    // 3. HACER CLICABLE la tabla principal
    function hacerTablaInteractiva(toast) {
        document.addEventListener('click', function (e) {
            if (e.target.closest('#tabla td:first-child')) {
                const tipoTe = e.target.closest('tr').querySelector('td:first-child').textContent;
                const clave = tipoTe.split(' ')[1];
                const { tiempoStr, segundos } = window.obtenerTiempoTe(tipoTe);

                window.iniciarToastCrono(`Infusionar ${tipoTe}`, segundos, tiempoStr);
            }
        });
    }



    // 4. BUSCADOR DINÁMICO para tabla
    function crearBuscadorTabla() {
        const tablaSection = document.querySelector('#tabla');
        if (!tablaSection) return;

        const buscadorHtml = `
        <div class="mb-3">
            <input type="text" id="buscadorTabla" class="form-control" placeholder="Buscar tipo de té, origen...">
        </div>`;
        tablaSection.insertAdjacentHTML('afterbegin', buscadorHtml);

        const buscador = document.getElementById('buscadorTabla');
        //const filas = document.querySelectorAll('#tabla tbody tr');

        buscador.addEventListener('input', function () {
            const termino = this.value.toLowerCase();

            //con la api, las tablas son dinámicas, por lo que hay que seleccionar las filas cada vez, no antes
            const filas = document.querySelectorAll('#tabla tbody tr');
            filas.forEach(fila => {
                const texto = fila.textContent.toLowerCase();
                fila.style.display = texto.includes(termino) ? '' : 'none';
            });
        });
    }

    // 5. MAPA
    function crearMapaTeterias() {
        const ceremonia = document.getElementById('ceremonia');
        if (!ceremonia) return;

        const mapaSection = document.createElement('section');
        mapaSection.className = 'mt-5 px-0';
        mapaSection.id = 'seccionMapa';
        mapaSection.innerHTML = `
    <div class="text-center mb-5">
        <h3>Busca tu tetería más cercana</h3>
        <p class="text-muted">Mapa de ciudad</p>
    </div>
    <div class="position-relative">
        <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3034.3!2d-3.7038!3d40.4168!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd4228474f3f2c5b%3A0x4b4b4b4b4b4b4b4b!2sMadrid%2C%20Espa%C3%B1a!5e0!3m2!1ses!2ses!4v1624523797308!5m2!1ses!2ses" 
            class="w-100 rounded shadow" 
            style="border:0; min-height: 600px; max-height: 70vh;" 
            title="Mapa de teterías en Madrid, España - Centro de la ciudad"
            allowfullscreen
            loading="lazy" 
            referrerpolicy="no-referrer-when-downgrade">
        </iframe>
    </div>
    <div class="text-center mt-3">
        <small class="text-muted">
            Acerca el mapa y busca zonas con teterías y locales de té en Madrid.
        </small>
    </div>`;

        ceremonia.parentNode.insertBefore(mapaSection, ceremonia.nextSibling);
    }



    // INICIALIZAR TODO
    crearReloj();
    const toastCrono = crearToastCrono();
    hacerTablaInteractiva(toastCrono);
    crearBuscadorTabla();
    crearMapaTeterias();

    console.log(' Interactividad completa cargada');
});
