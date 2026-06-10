// ============================================================
// Archivo: js/administrador/ver-cliente.js
// ============================================================

(() => {
    const API_URL = "https://clinica-veterinaria-backend-m3mf.onrender.com/api/propietarios";

    let propietarios = [];
    let modoModal = "ver";
    let propietarioEditandoId = null;

    // Elementos del DOM
    const tableBody = document.getElementById("ownersTableBody");
    const buscarInput = document.getElementById("buscarPropietario");
    const filtroEstado = document.getElementById("filtroEstado");

    const modalOverlay = document.getElementById("modalOverlay");
    const modalTitle = document.getElementById("modalTitle");
    const btnCerrarModal = document.getElementById("cerrarModal");
    const btnCancelar = document.getElementById("cancelar");
    const formPropietario = document.getElementById("formPropietario");
    const btnGuardar = document.querySelector(".btn-guardar");

    const inputNombre = document.getElementById("nombre");
    const inputTelefono = document.getElementById("telefono");
    const inputCorreo = document.getElementById("correo");
    const inputDireccion = document.getElementById("direccion");

    const contenedorNotificaciones = document.getElementById("contenedorNotificaciones");

    // =========================
    // Helpers generales
    // =========================

    function getToken() {
        return localStorage.getItem("token");
    }

    function cerrarSesionForzada() {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        window.location.replace("../../index.html");
    }

    function getId(propietario) {
        return propietario.id
            || propietario.Id
            || propietario.ID
            || propietario.Id_Propietario
            || propietario.id_propietario;
    }

    function getNombre(propietario) {
        return propietario.Nombre || propietario.nombre || "";
    }

    function getTelefono(propietario) {
        return propietario.Telefono || propietario.telefono || "";
    }

    function getCorreo(propietario) {
        return propietario.Correo || propietario.correo || "";
    }

    function getDireccion(propietario) {
        return propietario.Direccion || propietario.direccion || "";
    }

    function getEstado(propietario) {
        return propietario.Estado || propietario.estado || "Activo";
    }

    function escaparHTML(valor) {
        return String(valor ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function truncarTexto(texto, limite = 20) {
        if (!texto) return "";

        return texto.length > limite
            ? texto.slice(0, limite) + "..."
            : texto;
    }

    // =========================
    // Notificaciones
    // =========================

    function mostrarNotificacion(mensaje, tipo = "info") {
        if (!contenedorNotificaciones) return;

        const notificacion = document.createElement("div");
        notificacion.className = `notificacion ${tipo}`;
        notificacion.textContent = mensaje;

        contenedorNotificaciones.appendChild(notificacion);

        setTimeout(() => {
            notificacion.remove();
        }, 3000);
    }

    // =========================
    // Modal
    // =========================

    function setInputsDisabled(disabled) {
        [inputNombre, inputTelefono, inputCorreo, inputDireccion].forEach(input => {
            if (input) input.disabled = disabled;
        });
    }

    function limpiarFormulario() {
        formPropietario?.reset();
        setInputsDisabled(false);

        if (btnGuardar) {
            btnGuardar.disabled = false;
            btnGuardar.style.display = "inline-block";
            btnGuardar.textContent = "Guardar";
        }
    }

    function llenarFormulario(propietario) {
        inputNombre.value = getNombre(propietario);
        inputTelefono.value = getTelefono(propietario);
        inputCorreo.value = getCorreo(propietario);
        inputDireccion.value = getDireccion(propietario);
    }

    function abrirModalVer(propietario) {
        modoModal = "ver";
        propietarioEditandoId = getId(propietario);

        modalTitle.textContent = "Detalle del Cliente";

        limpiarFormulario();
        llenarFormulario(propietario);
        setInputsDisabled(true);

        if (btnGuardar) {
            btnGuardar.style.display = "none";
        }

        modalOverlay?.classList.remove("hidden");
    }

    function abrirModalEditar(propietario) {
        modoModal = "editar";
        propietarioEditandoId = getId(propietario);

        modalTitle.textContent = "Editar Cliente";

        limpiarFormulario();
        llenarFormulario(propietario);
        setInputsDisabled(false);

        if (btnGuardar) {
            btnGuardar.style.display = "inline-block";
            btnGuardar.textContent = "Guardar";
        }

        modalOverlay?.classList.remove("hidden");
    }

    function cerrarModalPropietario() {
        modalOverlay?.classList.add("hidden");

        modoModal = "ver";
        propietarioEditandoId = null;
        modalTitle.textContent = "Detalle del Cliente";

        limpiarFormulario();
    }

    function obtenerDatosFormulario() {
        return {
            nombre: inputNombre.value.trim(),
            telefono: inputTelefono.value.trim(),
            correo: inputCorreo.value.trim(),
            direccion: inputDireccion.value.trim()
        };
    }

    // =========================
    // Validaciones
    // =========================

    function validarNombre(nombre) {
        if (!nombre) {
            return "El nombre es obligatorio";
        }

        if (nombre.length < 2) {
            return "El nombre debe tener al menos 2 caracteres";
        }

        if (!/[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(nombre)) {
            return "El nombre debe contener letras";
        }

        return null;
    }

    function validarTelefono(telefono) {
        if (!telefono) {
            return "El teléfono es obligatorio";
        }

        if (!/^\d+$/.test(telefono)) {
            return "El teléfono solo debe contener números";
        }

        if (telefono.length !== 8) {
            return "El teléfono debe tener exactamente 8 dígitos";
        }

        return null;
    }

    function validarCorreo(correo) {
        if (!correo) {
            return "El correo es obligatorio";
        }

        const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!regexCorreo.test(correo)) {
            return "Ingresa un correo válido";
        }

        return null;
    }

    function validarDireccion(direccion) {
        if (!direccion) {
            return "La dirección es obligatoria";
        }

        if (direccion.length < 3) {
            return "La dirección debe tener al menos 3 caracteres";
        }

        return null;
    }

    function validarFormularioPropietario(datos) {
        const errorNombre = validarNombre(datos.nombre);
        if (errorNombre) return errorNombre;

        const errorTelefono = validarTelefono(datos.telefono);
        if (errorTelefono) return errorTelefono;

        const errorCorreo = validarCorreo(datos.correo);
        if (errorCorreo) return errorCorreo;

        const errorDireccion = validarDireccion(datos.direccion);
        if (errorDireccion) return errorDireccion;

        return null;
    }

    // =========================
    // Confirmación
    // =========================

    function mostrarConfirmacion(mensaje) {
        return new Promise((resolve) => {
            const modal = document.getElementById("modalConfirmacion");
            const texto = document.getElementById("mensajeConfirmacion");
            const btnAceptar = document.getElementById("btnAceptarConfirm");
            const btnCancelarConfirm = document.getElementById("btnCancelarConfirm");

            if (!modal || !texto || !btnAceptar || !btnCancelarConfirm) {
                resolve(false);
                return;
            }

            texto.textContent = mensaje;
            modal.classList.remove("hidden");

            btnAceptar.onclick = null;
            btnCancelarConfirm.onclick = null;

            btnAceptar.onclick = () => {
                modal.classList.add("hidden");
                resolve(true);
            };

            btnCancelarConfirm.onclick = () => {
                modal.classList.add("hidden");
                resolve(false);
            };
        });
    }

    // =========================
    // API
    // =========================

    async function request(url, options = {}) {
        const token = getToken();

        const response = await fetch(url, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
                ...(options.headers || {})
            }
        });

        if (response.status === 401 || response.status === 403) {
            cerrarSesionForzada();
            return;
        }

        const result = await response.json().catch(() => ({}));

        if (!response.ok || result.success === false) {
            throw new Error(result.message || "Ocurrió un error en la solicitud");
        }

        return result;
    }

    async function obtenerPropietarios() {
        try {
            const result = await request(API_URL, {
                method: "GET"
            });

            propietarios = result?.data || result || [];

            if (!Array.isArray(propietarios)) {
                propietarios = [];
            }

            aplicarFiltros();

        } catch (error) {
            console.error("Error al cargar propietarios:", error);
            mostrarNotificacion("No se pudieron cargar los clientes", "error");
        }
    }

    async function actualizarPropietario(datosPropietario) {
        if (!propietarioEditandoId) {
            mostrarNotificacion("No se encontró el cliente a editar", "error");
            return;
        }

        btnGuardar.disabled = true;
        btnGuardar.textContent = "Guardando...";

        try {
            const result = await request(`${API_URL}/${propietarioEditandoId}`, {
                method: "PUT",
                body: JSON.stringify(datosPropietario)
            });

            mostrarNotificacion(result?.message || "Cliente actualizado correctamente", "exito");

            cerrarModalPropietario();
            await obtenerPropietarios();

        } catch (error) {
            console.error("Error al actualizar propietario:", error);
            mostrarNotificacion(error.message || "No se pudo actualizar el cliente", "error");
        } finally {
            btnGuardar.disabled = false;
            btnGuardar.textContent = "Guardar";
        }
    }

    async function toggleEstadoPropietario(id) {
        const propietario = propietarios.find(p => String(getId(p)) === String(id));

        if (!propietario) {
            mostrarNotificacion("No se encontró el cliente seleccionado", "error");
            return;
        }

        const estadoActual = getEstado(propietario).toLowerCase();
        const accion = estadoActual === "activo" ? "desactivar" : "activar";
        const nombre = getNombre(propietario);

        const confirmado = await mostrarConfirmacion(
            `¿Seguro que deseas ${accion} a ${nombre}?`
        );

        if (!confirmado) return;

        try {
            const result = await request(`${API_URL}/${id}/toggle`, {
                method: "PATCH"
            });

            mostrarNotificacion(result?.message || "Estado actualizado correctamente", "exito");

            await obtenerPropietarios();

        } catch (error) {
            console.error("Error al cambiar estado:", error);
            mostrarNotificacion(error.message || "No se pudo cambiar el estado", "error");
        }
    }

    // =========================
    // Render
    // =========================

    function crearFilaPropietario(propietario) {
        const id = getId(propietario);
        const nombre = getNombre(propietario);
        const telefono = getTelefono(propietario);
        const correo = getCorreo(propietario);
        const direccion = getDireccion(propietario);
        const estado = getEstado(propietario);

        const estadoClase = estado.toLowerCase();
        const esMovil = window.innerWidth <= 600;

        const textoBotonToggle = esMovil
            ? (estadoClase === "activo" ? "Desac." : "Act.")
            : (estadoClase === "activo" ? "Desactivar" : "Activar");

        const claseToggle = estadoClase === "activo" ? "btn-desactivar" : "btn-activar";

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${escaparHTML(nombre)}</td>
            <td>${escaparHTML(telefono)}</td>
            <td class="col-correo">${escaparHTML(correo)}</td>
            <td class="col-direccion" title="${escaparHTML(direccion)}">
                ${escaparHTML(truncarTexto(direccion, 20))}
            </td>
            <td class="col-estado">
                <span class="badge ${escaparHTML(estadoClase)}">
                    ${escaparHTML(estado)}
                </span>
            </td>
            <td>
                <div class="acciones-propietario">
                    <button type="button" class="btn-ver" data-id="${escaparHTML(id)}">Ver</button>
                    <button type="button" class="btn-editar" data-id="${escaparHTML(id)}">Editar</button>
                    <button type="button" class="btn-toggle ${claseToggle}" data-id="${escaparHTML(id)}">
                        ${textoBotonToggle}
                    </button>
                </div>
            </td>
        `;

        return tr;
    }

    function renderizarPropietarios(lista) {
        if (!tableBody) return;

        tableBody.innerHTML = "";

        if (!lista.length) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6">No se encontraron clientes.</td>
                </tr>
            `;
            return;
        }

        const fragment = document.createDocumentFragment();

        lista.forEach(propietario => {
            fragment.appendChild(crearFilaPropietario(propietario));
        });

        tableBody.appendChild(fragment);
    }

    function aplicarFiltros() {
        const texto = buscarInput?.value.toLowerCase().trim() || "";
        const estadoFiltro = filtroEstado?.value || "activos";

        const filtrados = propietarios.filter(propietario => {
            const nombre = getNombre(propietario).toLowerCase();
            const correo = getCorreo(propietario).toLowerCase();
            const estado = getEstado(propietario).toLowerCase();

            const coincideTexto = nombre.includes(texto) || correo.includes(texto);

            let coincideEstado = true;

            if (estadoFiltro === "activos") {
                coincideEstado = estado === "activo";
            } else if (estadoFiltro === "inactivos") {
                coincideEstado = estado === "inactivo";
            }

            return coincideTexto && coincideEstado;
        });

        renderizarPropietarios(filtrados);
    }

    // =========================
    // Eventos
    // =========================

    function manejarClickTabla(e) {
        const boton = e.target.closest("button");

        if (!boton) return;

        const id = boton.dataset.id;

        if (!id) return;

        const propietario = propietarios.find(p => String(getId(p)) === String(id));

        if (boton.classList.contains("btn-ver")) {
            if (propietario) abrirModalVer(propietario);
            return;
        }

        if (boton.classList.contains("btn-editar")) {
            if (propietario) abrirModalEditar(propietario);
            return;
        }

        if (boton.classList.contains("btn-toggle")) {
            toggleEstadoPropietario(id);
        }
    }

    async function manejarSubmitFormulario(e) {
        e.preventDefault();

        if (modoModal === "ver") {
            cerrarModalPropietario();
            return;
        }

        const datosPropietario = obtenerDatosFormulario();

        const errorValidacion = validarFormularioPropietario(datosPropietario);

        if (errorValidacion) {
            mostrarNotificacion(errorValidacion, "error");
            return;
        }

        await actualizarPropietario(datosPropietario);
    }

    function init() {
        btnCerrarModal?.addEventListener("click", cerrarModalPropietario);
        btnCancelar?.addEventListener("click", cerrarModalPropietario);

        modalOverlay?.addEventListener("click", (e) => {
            if (e.target === modalOverlay) {
                cerrarModalPropietario();
            }
        });

        formPropietario?.addEventListener("submit", manejarSubmitFormulario);

        buscarInput?.addEventListener("input", aplicarFiltros);
        filtroEstado?.addEventListener("change", aplicarFiltros);

        tableBody?.addEventListener("click", manejarClickTabla);

        obtenerPropietarios();
    }

    document.addEventListener("DOMContentLoaded", init);
})();