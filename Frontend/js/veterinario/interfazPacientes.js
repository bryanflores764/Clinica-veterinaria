document.addEventListener("DOMContentLoaded", () => {
    const pacientesIniciales = [
        {
            id: 1,
            nombre: "Panchito",
            especie: "Perro",
            raza: "Pequeño",
            color: "Café",
            peso: "10 lbs",
            fechaNacimiento: "2025-11-28",
            propietario: "yo",
            telefono: "21212121"
        }
    ];

    let pacientes = JSON.parse(localStorage.getItem("pacientesVeterinario")) || pacientesIniciales;
    let vacunas = JSON.parse(localStorage.getItem("vacunasVeterinario")) || [];
    let historiales = JSON.parse(localStorage.getItem("historialesVeterinario")) || [];

    let mascotaSeleccionadaId = null;

    const tbody = document.getElementById("users-tbody");
    const emptyMsg = document.getElementById("empty-msg");
    const searchInput = document.getElementById("search");

    const alertasPanel = document.getElementById("alertas-panel");
    const btnToggleAlertasPanel = document.getElementById("btn-toggle-alertas-panel");
    const alertasPanelLista = document.getElementById("alertas-panel-lista");
    const alertasPanelEmpty = document.getElementById("alertas-panel-empty");
    const alertasCountBadge = document.getElementById("alertas-count-badge");

    const modalHistorial = document.getElementById("modal-historial");
    const cerrarModalHistorial = document.getElementById("cerrar-modal-historial");
    const cancelarHistorial = document.getElementById("cancelar-historial");
    const formHistorial = document.getElementById("form-historial");
    const historialMascotaId = document.getElementById("historial-mascota-id");
    const historialMascotaNombre = document.getElementById("historial-mascota-nombre");

    const modalDetalleHistorial = document.getElementById("modal-detalle-historial");
    const cerrarModalDetalleHistorial = document.getElementById("cerrar-modal-detalle-historial");
    const detalleMascotaNombre = document.getElementById("detalle-mascota-nombre");
    const detalleMascotaEspecie = document.getElementById("detalle-mascota-especie");
    const detalleMascotaRaza = document.getElementById("detalle-mascota-raza");
    const detalleMascotaPropietario = document.getElementById("detalle-mascota-propietario");
    const detalleMotivo = document.getElementById("detalle-motivo");
    const detalleDiagnosticoInicial = document.getElementById("detalle-diagnostico-inicial");
    const detalleObservaciones = document.getElementById("detalle-observaciones");

    const modalCartilla = document.getElementById("modal-cartilla");
    const cerrarModalCartilla = document.getElementById("cerrar-modal-cartilla");

    const formVacuna = document.getElementById("form-vacuna");
    const btnToggleFormVacuna = document.getElementById("btn-toggle-form-vacuna");
    const btnCancelarVacuna = document.getElementById("cancelar-vacuna");

    const inputVacunaMascotaId = document.getElementById("vacuna-mascota-id");
    const inputVacunaNombre = document.getElementById("vacuna-nombre");
    const inputVacunaFecha = document.getElementById("vacuna-fecha");
    const inputVacunaPeso = document.getElementById("vacuna-peso");
    const inputVacunaProxima = document.getElementById("vacuna-proxima");
    const inputVacunaLote = document.getElementById("vacuna-lote");
    const inputVacunaObservaciones = document.getElementById("vacuna-observaciones");

    const cartillaNombre = document.getElementById("cartilla-nombre");
    const cartillaEspecie = document.getElementById("cartilla-especie");
    const cartillaRaza = document.getElementById("cartilla-raza");
    const cartillaColor = document.getElementById("cartilla-color");
    const cartillaFechaNacimiento = document.getElementById("cartilla-fecha-nacimiento");
    const cartillaPeso = document.getElementById("cartilla-peso");
    const cartillaPropietario = document.getElementById("cartilla-propietario");
    const cartillaTelefono = document.getElementById("cartilla-telefono");

    const cartillaVacunasLista = document.getElementById("cartilla-vacunas-lista");
    const cartillaVacunasEmpty = document.getElementById("cartilla-vacunas-empty");

    const cartillaAlertasLista = document.getElementById("cartilla-alertas-lista");
    const cartillaAlertasEmpty = document.getElementById("cartilla-alertas-empty");

    guardarPacientes();
    renderizarPacientes();
    renderizarPanelAlertas();

    if (searchInput) {
        searchInput.addEventListener("input", () => {
            renderizarPacientes(searchInput.value.trim().toLowerCase());
        });
    }

    if (btnToggleAlertasPanel && alertasPanel) {
        btnToggleAlertasPanel.addEventListener("click", () => {
            alertasPanel.classList.toggle("collapsed");
        });
    }

    if (cerrarModalHistorial) {
        cerrarModalHistorial.addEventListener("click", cerrarHistorial);
    }

    if (cancelarHistorial) {
        cancelarHistorial.addEventListener("click", cerrarHistorial);
    }

    if (modalHistorial) {
        modalHistorial.addEventListener("click", (e) => {
            if (e.target === modalHistorial) {
                cerrarHistorial();
            }
        });
    }

    if (formHistorial) {
        formHistorial.addEventListener("submit", guardarHistorial);
    }

    if (cerrarModalDetalleHistorial) {
        cerrarModalDetalleHistorial.addEventListener("click", cerrarDetalleHistorial);
    }

    if (modalDetalleHistorial) {
        modalDetalleHistorial.addEventListener("click", (e) => {
            if (e.target === modalDetalleHistorial) {
                cerrarDetalleHistorial();
            }
        });
    }

    if (cerrarModalCartilla) {
        cerrarModalCartilla.addEventListener("click", cerrarCartilla);
    }

    if (modalCartilla) {
        modalCartilla.addEventListener("click", (e) => {
            if (e.target === modalCartilla) {
                cerrarCartilla();
            }
        });
    }

    if (btnToggleFormVacuna && formVacuna) {
        btnToggleFormVacuna.addEventListener("click", () => {
            const estaOculto = formVacuna.style.display === "none" || formVacuna.style.display === "";

            formVacuna.style.display = estaOculto ? "block" : "none";
            btnToggleFormVacuna.textContent = estaOculto ? "Ocultar formulario" : "+ Registrar vacuna";
        });
    }

    if (btnCancelarVacuna && formVacuna) {
        btnCancelarVacuna.addEventListener("click", () => {
            limpiarFormularioVacuna();
            formVacuna.style.display = "none";

            if (btnToggleFormVacuna) {
                btnToggleFormVacuna.textContent = "+ Registrar vacuna";
            }
        });
    }

    if (formVacuna) {
        formVacuna.addEventListener("submit", registrarVacuna);

        formVacuna.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") {
                e.preventDefault();
                registrarVacuna(e);
            }
        });
    }

    document.addEventListener("click", (e) => {
        const btnHistorial = e.target.closest(".btn-historial");
        const btnCartilla = e.target.closest(".btn-cartilla");
        const btnEliminarVacuna = e.target.closest(".btn-eliminar-vacuna");
        const btnMarcarRevisada = e.target.closest(".btn-marcar-revisada");
        const alertaPanelItem = e.target.closest(".alerta-panel-item");

        if (btnHistorial) {
            const mascotaId = Number(btnHistorial.dataset.id);
            abrirHistorial(mascotaId);
        }

        if (btnCartilla) {
            const mascotaId = Number(btnCartilla.dataset.id);
            abrirCartilla(mascotaId);
        }

        if (btnEliminarVacuna) {
            const vacunaId = Number(btnEliminarVacuna.dataset.id);
            eliminarVacuna(vacunaId);
        }

        if (btnMarcarRevisada) {
            const vacunaId = Number(btnMarcarRevisada.dataset.id);
            marcarVacunaRevisada(vacunaId);
        }

        if (alertaPanelItem && !btnMarcarRevisada) {
            const mascotaId = Number(alertaPanelItem.dataset.mascotaId);
            abrirCartilla(mascotaId);
        }
    });

    function renderizarPacientes(filtro = "") {
        if (!tbody) return;

        tbody.innerHTML = "";

        const pacientesFiltrados = pacientes.filter((paciente) => {
            const texto = `${paciente.nombre} ${paciente.especie} ${paciente.raza} ${paciente.propietario}`.toLowerCase();
            return texto.includes(filtro);
        });

        if (pacientesFiltrados.length === 0) {
            if (emptyMsg) emptyMsg.style.display = "block";
            return;
        }

        if (emptyMsg) emptyMsg.style.display = "none";

        pacientesFiltrados.forEach((paciente) => {
            const fila = document.createElement("tr");

            fila.innerHTML = `
                <td>${paciente.nombre}</td>
                <td>${paciente.especie}</td>
                <td>${paciente.raza}</td>
                <td>${paciente.peso}</td>
                <td>${formatearFecha(paciente.fechaNacimiento)}</td>
                <td>${paciente.propietario}</td>
                <td class="actions-col">
                    <button type="button" class="btn-historial btn-accion" data-id="${paciente.id}">
                        Historial clínico
                    </button>
                    <button type="button" class="btn-cartilla btn-accion" data-id="${paciente.id}">
                        Cartilla de vacunación
                    </button>
                </td>
            `;

            tbody.appendChild(fila);
        });
    }

    function abrirHistorial(mascotaId) {
        const paciente = pacientes.find((item) => item.id === mascotaId);

        if (!paciente) {
            mostrarToast("No se encontró la mascota seleccionada.", "error");
            return;
        }

        const historialExistente = historiales.find((item) => item.mascotaId === mascotaId);

        if (historialExistente) {
            abrirDetalleHistorial(mascotaId);
            return;
        }

        if (!modalHistorial || !historialMascotaId || !historialMascotaNombre) {
            mostrarToast("No se encontró el modal de historial clínico.", "error");
            return;
        }

        historialMascotaId.value = paciente.id;
        historialMascotaNombre.value = paciente.nombre;

        limpiarErroresFormulario(formHistorial);
        modalHistorial.classList.add("show");
    }

    function cerrarHistorial() {
        if (modalHistorial) {
            modalHistorial.classList.remove("show");
        }

        if (formHistorial) {
            formHistorial.reset();
            limpiarErroresFormulario(formHistorial);
        }
    }

    function guardarHistorial(e) {
        e.preventDefault();

        const motivo = document.getElementById("motivo");
        const diagnosticoInicial = document.getElementById("diagnostico-inicial");
        const observaciones = document.getElementById("observaciones");

        limpiarErroresFormulario(formHistorial);

        let formularioValido = true;

        if (!motivo || motivo.value.trim() === "") {
            mostrarErrorCampo(motivo, "El motivo es obligatorio.");
            formularioValido = false;
        } else if (motivo.value.trim().length < 4) {
            mostrarErrorCampo(motivo, "El motivo debe tener al menos 4 caracteres.");
            formularioValido = false;
        }

        if (!diagnosticoInicial || diagnosticoInicial.value.trim() === "") {
            mostrarErrorCampo(diagnosticoInicial, "El diagnóstico inicial es obligatorio.");
            formularioValido = false;
        } else if (diagnosticoInicial.value.trim().length < 4) {
            mostrarErrorCampo(diagnosticoInicial, "El diagnóstico debe tener al menos 4 caracteres.");
            formularioValido = false;
        }

        if (!observaciones || observaciones.value.trim() === "") {
            mostrarErrorCampo(observaciones, "Las observaciones son obligatorias.");
            formularioValido = false;
        } else if (observaciones.value.trim().length < 5) {
            mostrarErrorCampo(observaciones, "Las observaciones deben tener al menos 5 caracteres.");
            formularioValido = false;
        }

        if (!formularioValido) {
            enfocarPrimerErrorFormulario(formHistorial);
            mostrarToast("Complete correctamente el historial clínico.", "error");
            return;
        }

        const nuevoHistorial = {
            id: Date.now(),
            mascotaId: Number(historialMascotaId.value),
            motivo: motivo.value.trim(),
            diagnosticoInicial: diagnosticoInicial.value.trim(),
            observaciones: observaciones.value.trim(),
            fechaCreacion: obtenerFechaActualInput()
        };

        historiales.push(nuevoHistorial);
        guardarHistoriales();

        cerrarHistorial();
        mostrarToast("Historial clínico guardado correctamente.", "success");
        abrirDetalleHistorial(nuevoHistorial.mascotaId);
    }

    function abrirDetalleHistorial(mascotaId) {
        const paciente = pacientes.find((item) => item.id === mascotaId);
        const historial = historiales.find((item) => item.mascotaId === mascotaId);

        if (!paciente || !historial) {
            mostrarToast("No se encontró el historial clínico.", "error");
            return;
        }

        if (detalleMascotaNombre) detalleMascotaNombre.textContent = paciente.nombre || "-";
        if (detalleMascotaEspecie) detalleMascotaEspecie.textContent = paciente.especie || "-";
        if (detalleMascotaRaza) detalleMascotaRaza.textContent = paciente.raza || "-";
        if (detalleMascotaPropietario) detalleMascotaPropietario.textContent = paciente.propietario || "-";
        if (detalleMotivo) detalleMotivo.textContent = historial.motivo || "-";
        if (detalleDiagnosticoInicial) detalleDiagnosticoInicial.textContent = historial.diagnosticoInicial || "-";
        if (detalleObservaciones) detalleObservaciones.textContent = historial.observaciones || "-";

        if (modalDetalleHistorial) {
            modalDetalleHistorial.classList.add("show");
        }
    }

    function cerrarDetalleHistorial() {
        if (modalDetalleHistorial) {
            modalDetalleHistorial.classList.remove("show");
        }
    }

    function abrirCartilla(mascotaId) {
        const paciente = pacientes.find((item) => item.id === mascotaId);

        if (!paciente) {
            mostrarToast("No se encontró la mascota seleccionada.", "error");
            return;
        }

        if (!modalCartilla) {
            mostrarToast("No se encontró el modal de cartilla.", "error");
            return;
        }

        mascotaSeleccionadaId = mascotaId;

        if (inputVacunaMascotaId) inputVacunaMascotaId.value = mascotaId;

        if (cartillaNombre) cartillaNombre.textContent = paciente.nombre || "-";
        if (cartillaEspecie) cartillaEspecie.textContent = paciente.especie || "-";
        if (cartillaRaza) cartillaRaza.textContent = paciente.raza || "-";
        if (cartillaColor) cartillaColor.textContent = paciente.color || "-";
        if (cartillaFechaNacimiento) cartillaFechaNacimiento.textContent = formatearFecha(paciente.fechaNacimiento) || "-";
        if (cartillaPeso) cartillaPeso.textContent = paciente.peso || "-";
        if (cartillaPropietario) cartillaPropietario.textContent = paciente.propietario || "-";
        if (cartillaTelefono) cartillaTelefono.textContent = paciente.telefono || "-";

        limpiarFormularioVacuna();
        renderizarAlertasCartilla();
        renderizarVacunasCartilla();

        modalCartilla.classList.add("show");
    }

    function cerrarCartilla() {
        if (modalCartilla) {
            modalCartilla.classList.remove("show");
        }

        mascotaSeleccionadaId = null;
        limpiarFormularioVacuna();

        if (formVacuna) {
            formVacuna.style.display = "none";
        }

        if (btnToggleFormVacuna) {
            btnToggleFormVacuna.textContent = "+ Registrar vacuna";
        }
    }

    function registrarVacuna(e) {
        if (e) e.preventDefault();

        if (!formVacuna) return;

        limpiarErroresVacuna();

        const vacunaNombre = inputVacunaNombre ? inputVacunaNombre.value.trim() : "";
        const fechaAplicacion = inputVacunaFecha ? inputVacunaFecha.value.trim() : "";
        const pesoPaciente = inputVacunaPeso ? inputVacunaPeso.value.trim() : "";
        const proximaDosis = inputVacunaProxima ? inputVacunaProxima.value.trim() : "";
        const lote = inputVacunaLote ? inputVacunaLote.value.trim() : "";
        const observaciones = inputVacunaObservaciones ? inputVacunaObservaciones.value.trim() : "";

        let formularioValido = true;

        if (vacunaNombre === "") {
            mostrarErrorCampo(inputVacunaNombre, "La vacuna aplicada es obligatoria.");
            formularioValido = false;
        } else if (vacunaNombre.length < 3) {
            mostrarErrorCampo(inputVacunaNombre, "La vacuna debe tener al menos 3 caracteres.");
            formularioValido = false;
        } else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(vacunaNombre)) {
            mostrarErrorCampo(inputVacunaNombre, "La vacuna solo debe contener letras y espacios.");
            formularioValido = false;
        }

        if (fechaAplicacion === "") {
            mostrarErrorCampo(inputVacunaFecha, "La fecha de aplicación es obligatoria.");
            formularioValido = false;
        } else if (!esFechaValidaFlexible(fechaAplicacion)) {
            mostrarErrorCampo(inputVacunaFecha, "La fecha de aplicación no es válida.");
            formularioValido = false;
        } else if (fechaEsFutura(fechaAplicacion)) {
            mostrarErrorCampo(inputVacunaFecha, "La fecha de aplicación no puede ser futura.");
            formularioValido = false;
        }

        if (pesoPaciente === "") {
            mostrarErrorCampo(inputVacunaPeso, "El peso del paciente es obligatorio.");
            formularioValido = false;
        } else if (Number(pesoPaciente) <= 0 || Number.isNaN(Number(pesoPaciente))) {
            mostrarErrorCampo(inputVacunaPeso, "El peso debe ser un número mayor a 0.");
            formularioValido = false;
        } else if (Number(pesoPaciente) > 500) {
            mostrarErrorCampo(inputVacunaPeso, "El peso ingresado es demasiado alto.");
            formularioValido = false;
        }

        if (proximaDosis === "") {
            mostrarErrorCampo(inputVacunaProxima, "La próxima dosis es obligatoria.");
            formularioValido = false;
        } else if (!esFechaValidaFlexible(proximaDosis)) {
            mostrarErrorCampo(inputVacunaProxima, "La fecha de próxima dosis no es válida.");
            formularioValido = false;
        }

        if (
            fechaAplicacion !== "" &&
            proximaDosis !== "" &&
            esFechaValidaFlexible(fechaAplicacion) &&
            esFechaValidaFlexible(proximaDosis)
        ) {
            const fechaAplicacionDate = crearFechaDesdeTexto(fechaAplicacion);
            const proximaDosisDate = crearFechaDesdeTexto(proximaDosis);

            if (proximaDosisDate <= fechaAplicacionDate) {
                mostrarErrorCampo(inputVacunaProxima, "La próxima dosis debe ser posterior a la fecha de aplicación.");
                formularioValido = false;
            }
        }

        if (lote === "") {
            mostrarErrorCampo(inputVacunaLote, "El lote de la vacuna es obligatorio.");
            formularioValido = false;
        } else if (lote.length < 3) {
            mostrarErrorCampo(inputVacunaLote, "El lote debe tener al menos 3 caracteres.");
            formularioValido = false;
        } else if (!/^[A-Za-z0-9-]+$/.test(lote)) {
            mostrarErrorCampo(inputVacunaLote, "El lote solo puede contener letras, números y guiones.");
            formularioValido = false;
        }

        if (observaciones === "") {
            mostrarErrorCampo(inputVacunaObservaciones, "Las observaciones son obligatorias.");
            formularioValido = false;
        } else if (observaciones.length < 5) {
            mostrarErrorCampo(inputVacunaObservaciones, "Las observaciones deben tener al menos 5 caracteres.");
            formularioValido = false;
        } else if (observaciones.length > 200) {
            mostrarErrorCampo(inputVacunaObservaciones, "Las observaciones no deben superar los 200 caracteres.");
            formularioValido = false;
        }

        if (!formularioValido) {
            enfocarPrimerErrorFormulario(formVacuna);
            mostrarToast("Complete correctamente los campos marcados.", "error");
            return;
        }

        const nuevaVacuna = {
            id: Date.now(),
            mascotaId: Number(inputVacunaMascotaId.value),
            nombre: vacunaNombre,
            fechaAplicacion,
            peso: Number(pesoPaciente).toFixed(2),
            proximaDosis,
            lote,
            observaciones,
            veterinario: "Luis",
            revisada: false
        };

        vacunas.push(nuevaVacuna);
        guardarVacunas();

        limpiarFormularioVacuna();

        formVacuna.style.display = "none";

        if (btnToggleFormVacuna) {
            btnToggleFormVacuna.textContent = "+ Registrar vacuna";
        }

        renderizarAlertasCartilla();
        renderizarVacunasCartilla();
        renderizarPanelAlertas();

        mostrarToast("Vacuna registrada correctamente.", "success");
    }

    function renderizarVacunasCartilla() {
        if (!cartillaVacunasLista) return;

        cartillaVacunasLista.innerHTML = "";

        const vacunasMascota = vacunas.filter((vacuna) => vacuna.mascotaId === mascotaSeleccionadaId);

        if (vacunasMascota.length === 0) {
            if (cartillaVacunasEmpty) cartillaVacunasEmpty.style.display = "block";
            return;
        }

        if (cartillaVacunasEmpty) {
            cartillaVacunasEmpty.style.display = "none";
        }

        vacunasMascota.forEach((vacuna) => {
            const estado = obtenerEstadoVacuna(vacuna.proximaDosis);
            const item = document.createElement("div");

            item.className = `vacuna-item ${estado.clase}`;

            item.innerHTML = `
                <div class="vacuna-info">
                    <div class="vacuna-nombre">${vacuna.nombre}</div>
                    <div class="vacuna-detalle"><strong>Fecha de aplicación:</strong> ${formatearFecha(vacuna.fechaAplicacion)}</div>
                    <div class="vacuna-detalle"><strong>Próxima dosis:</strong> ${formatearFecha(vacuna.proximaDosis)}</div>
                    <div class="vacuna-detalle"><strong>Peso:</strong> ${vacuna.peso} lbs</div>
                    <div class="vacuna-detalle"><strong>Lote:</strong> ${vacuna.lote}</div>
                    <div class="vacuna-detalle"><strong>Observaciones:</strong> ${vacuna.observaciones}</div>
                    <div class="vacuna-detalle"><strong>Veterinario:</strong> ${vacuna.veterinario}</div>
                </div>

                <div class="vacuna-acciones">
                    <span class="vacuna-badge ${estado.clase}">${estado.texto}</span>
                    <button type="button" class="btn-eliminar-vacuna" data-id="${vacuna.id}">
                        Eliminar
                    </button>
                </div>
            `;

            cartillaVacunasLista.appendChild(item);
        });
    }

    function renderizarAlertasCartilla() {
        if (!cartillaAlertasLista) return;

        cartillaAlertasLista.innerHTML = "";

        const alertas = obtenerAlertasVacunas().filter((vacuna) => vacuna.mascotaId === mascotaSeleccionadaId);

        if (alertas.length === 0) {
            if (cartillaAlertasEmpty) cartillaAlertasEmpty.style.display = "block";
            return;
        }

        if (cartillaAlertasEmpty) {
            cartillaAlertasEmpty.style.display = "none";
        }

        alertas.forEach((vacuna) => {
            const estado = obtenerEstadoVacuna(vacuna.proximaDosis);
            const item = document.createElement("div");

            item.className = `alerta-item ${estado.clase}`;

            item.innerHTML = `
                <div class="alerta-info">
                    <p><strong>${vacuna.nombre}</strong> — ${estado.texto}</p>
                    <p>Fecha próxima dosis: <strong>${formatearFecha(vacuna.proximaDosis)}</strong></p>
                </div>

                <div class="alerta-acciones">
                    <button type="button" class="btn-alerta-notificar btn-marcar-revisada" data-id="${vacuna.id}">
                        Marcar como revisada
                    </button>
                </div>
            `;

            cartillaAlertasLista.appendChild(item);
        });
    }

    function renderizarPanelAlertas() {
        if (!alertasPanelLista) return;

        alertasPanelLista.innerHTML = "";

        const alertas = obtenerAlertasVacunas();

        if (alertas.length === 0) {
            if (alertasPanelEmpty) alertasPanelEmpty.style.display = "block";

            if (alertasCountBadge) {
                alertasCountBadge.textContent = "";
                alertasCountBadge.style.display = "none";
            }

            return;
        }

        if (alertasPanelEmpty) {
            alertasPanelEmpty.style.display = "none";
        }

        if (alertasCountBadge) {
            alertasCountBadge.textContent = alertas.length;
            alertasCountBadge.style.display = "inline-flex";
        }

        alertas.forEach((vacuna) => {
            const paciente = pacientes.find((item) => item.id === vacuna.mascotaId);
            const estado = obtenerEstadoVacuna(vacuna.proximaDosis);
            const item = document.createElement("div");

            item.className = `alerta-panel-item ${estado.clase}`;
            item.dataset.mascotaId = vacuna.mascotaId;

            item.innerHTML = `
                <div class="alerta-panel-info">
                    <span class="alerta-panel-mascota">${paciente ? paciente.nombre : "Mascota"}</span>
                    <span class="alerta-panel-sep">-</span>
                    <span class="alerta-panel-vacuna">${vacuna.nombre}</span>
                    <span class="alerta-panel-fecha">${formatearFecha(vacuna.proximaDosis)}</span>
                </div>

                <span class="alerta-panel-badge ${estado.clase}">
                    ${estado.texto}: ${formatearFecha(vacuna.proximaDosis)}
                </span>
            `;

            alertasPanelLista.appendChild(item);
        });
    }

    function obtenerAlertasVacunas() {
        return vacunas.filter((vacuna) => {
            if (vacuna.revisada) return false;
            if (!esFechaValidaFlexible(vacuna.proximaDosis)) return false;

            const fechaProxima = crearFechaDesdeTexto(vacuna.proximaDosis);
            const hoy = obtenerHoySinHora();
            const diferenciaDias = Math.ceil((fechaProxima - hoy) / (1000 * 60 * 60 * 24));

            return diferenciaDias <= 7;
        });
    }

    function obtenerEstadoVacuna(fechaProxima) {
        if (!esFechaValidaFlexible(fechaProxima)) {
            return {
                texto: "SIN FECHA",
                clase: "vencida"
            };
        }

        const fecha = crearFechaDesdeTexto(fechaProxima);
        const hoy = obtenerHoySinHora();
        const diferenciaDias = Math.ceil((fecha - hoy) / (1000 * 60 * 60 * 24));

        if (diferenciaDias < 0) {
            return {
                texto: "VENCIDA",
                clase: "vencida"
            };
        }

        if (diferenciaDias <= 7) {
            return {
                texto: "PRÓXIMA",
                clase: "proxima"
            };
        }

        return {
            texto: "AL DÍA",
            clase: "aplicada"
        };
    }

    function eliminarVacuna(vacunaId) {
        const confirmar = confirm("¿Está seguro de eliminar esta vacuna?");

        if (!confirmar) return;

        vacunas = vacunas.filter((vacuna) => vacuna.id !== vacunaId);
        guardarVacunas();

        renderizarAlertasCartilla();
        renderizarVacunasCartilla();
        renderizarPanelAlertas();

        mostrarToast("Vacuna eliminada correctamente.", "success");
    }

    function marcarVacunaRevisada(vacunaId) {
        vacunas = vacunas.map((vacuna) => {
            if (vacuna.id === vacunaId) {
                return {
                    ...vacuna,
                    revisada: true
                };
            }

            return vacuna;
        });

        guardarVacunas();

        renderizarAlertasCartilla();
        renderizarVacunasCartilla();
        renderizarPanelAlertas();

        mostrarToast("Alerta marcada como revisada.", "success");
    }

    function mostrarErrorCampo(campo, mensaje) {
        if (!campo) return;

        const grupo = campo.closest(".form-group");

        if (!grupo) return;

        let error = grupo.querySelector(".error-msg");

        if (!error) {
            error = document.createElement("small");
            error.classList.add("error-msg");
            grupo.appendChild(error);
        }

        grupo.classList.add("error");
        error.textContent = mensaje;
    }

    function limpiarErroresFormulario(formulario) {
        if (!formulario) return;

        const grupos = formulario.querySelectorAll(".form-group");

        grupos.forEach((grupo) => {
            grupo.classList.remove("error");

            const error = grupo.querySelector(".error-msg");

            if (error) {
                error.textContent = "";
            }
        });
    }

    function limpiarErroresVacuna() {
        limpiarErroresFormulario(formVacuna);
    }

    function enfocarPrimerErrorFormulario(formulario) {
        if (!formulario) return;

        const primerCampo = formulario.querySelector(".form-group.error input, .form-group.error textarea");

        if (primerCampo) {
            primerCampo.focus();
        }
    }

    function limpiarFormularioVacuna() {
        if (!formVacuna) return;

        formVacuna.reset();
        limpiarErroresVacuna();

        if (mascotaSeleccionadaId && inputVacunaMascotaId) {
            inputVacunaMascotaId.value = mascotaSeleccionadaId;
        }
    }

    function esFechaValidaFlexible(fecha) {
        if (!fecha) return false;

        if (/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
            const [anio, mes, dia] = fecha.split("-").map(Number);
            const fechaObjeto = new Date(anio, mes - 1, dia);

            return (
                fechaObjeto.getFullYear() === anio &&
                fechaObjeto.getMonth() === mes - 1 &&
                fechaObjeto.getDate() === dia
            );
        }

        if (/^\d{2}-\d{2}-\d{4}$/.test(fecha)) {
            const [dia, mes, anio] = fecha.split("-").map(Number);
            const fechaObjeto = new Date(anio, mes - 1, dia);

            return (
                fechaObjeto.getFullYear() === anio &&
                fechaObjeto.getMonth() === mes - 1 &&
                fechaObjeto.getDate() === dia
            );
        }

        return false;
    }

    function fechaEsFutura(fecha) {
        const fechaIngresada = crearFechaDesdeTexto(fecha);
        const hoy = obtenerHoySinHora();

        return fechaIngresada > hoy;
    }

    function crearFechaDesdeTexto(fecha) {
        if (/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
            const [anio, mes, dia] = fecha.split("-").map(Number);
            return new Date(anio, mes - 1, dia);
        }

        if (/^\d{2}-\d{2}-\d{4}$/.test(fecha)) {
            const [dia, mes, anio] = fecha.split("-").map(Number);
            return new Date(anio, mes - 1, dia);
        }

        return new Date("");
    }

    function obtenerHoySinHora() {
        const hoy = new Date();
        return new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    }

    function obtenerFechaActualInput() {
        const hoy = new Date();
        const anio = hoy.getFullYear();
        const mes = String(hoy.getMonth() + 1).padStart(2, "0");
        const dia = String(hoy.getDate()).padStart(2, "0");

        return `${anio}-${mes}-${dia}`;
    }

    function formatearFecha(fecha) {
        if (!fecha) return "-";

        if (/^\d{2}-\d{2}-\d{4}$/.test(fecha)) {
            return fecha;
        }

        if (/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
            const [anio, mes, dia] = fecha.split("-");
            return `${dia}-${mes}-${anio}`;
        }

        return fecha;
    }

    function guardarPacientes() {
        localStorage.setItem("pacientesVeterinario", JSON.stringify(pacientes));
    }

    function guardarVacunas() {
        localStorage.setItem("vacunasVeterinario", JSON.stringify(vacunas));
    }

    function guardarHistoriales() {
        localStorage.setItem("historialesVeterinario", JSON.stringify(historiales));
    }

    function mostrarToast(mensaje, tipo = "success") {
        let contenedor = document.getElementById("toast-container");

        if (!contenedor) {
            contenedor = document.createElement("div");
            contenedor.id = "toast-container";
            contenedor.className = "toast-container";
            document.body.appendChild(contenedor);
        }

        const toast = document.createElement("div");
        toast.className = tipo === "error" ? "toast error" : "toast";
        toast.textContent = mensaje;

        contenedor.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
});