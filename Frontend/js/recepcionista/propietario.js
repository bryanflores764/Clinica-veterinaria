(() => {
    const API_URL = "https://clinica-veterinaria-backend-m3mf.onrender.com/api/propietarios";
    const token = localStorage.getItem("token");

    let propietarios = [];
    let modoModal = "crear";
    let propietarioEditandoId = null;

    // Elementos del DOM
    const tableBody = document.getElementById("ownersTableBody");
    const buscarInput = document.getElementById("buscarPropietario");
    const filtroEstado = document.getElementById("filtroEstado");

    const modalOverlay = document.getElementById("modalOverlay");
    const modalTitle = document.getElementById("modalTitle");
    const btnNuevoPropietario = document.getElementById("nuevo-propietario");
    const btnCerrarModal = document.getElementById("cerrarModal");
    const btnCancelar = document.getElementById("cancelar");
    const formNuevoPropietario = document.getElementById("formNuevoPropietario");
    const btnGuardar = document.querySelector(".btn-guardar");

    const inputNombre = document.getElementById("nombre");
    const inputTelefono = document.getElementById("telefono");
    const inputCorreo = document.getElementById("correo");
    const inputDireccion = document.getElementById("direccion");

    const contenedorNotificaciones = document.getElementById("contenedorNotificaciones");

    // =========================
    // Helpers UI
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

    function setInputsDisabled(disabled) {
        [inputNombre, inputTelefono, inputCorreo, inputDireccion].forEach(input => {
            if (input) input.disabled = disabled;
        });
    }

    function limpiarFormulario() {
        formNuevoPropietario?.reset();
        setInputsDisabled(false);

        if (btnGuardar) {
            btnGuardar.disabled = false;
            btnGuardar.style.display = "inline-block";
        }
    }

    function llenarFormulario(propietario) {
        inputNombre.value = propietario?.Nombre || "";
        inputTelefono.value = propietario?.Telefono || "";
        inputCorreo.value = propietario?.Correo || "";
        inputDireccion.value = propietario?.Direccion || "";
    }

    function abrirModalCrear() {
        modoModal = "crear";
        propietarioEditandoId = null;
        modalTitle.textContent = "Nuevo Propietario";

        limpiarFormulario();
        modalOverlay?.classList.remove("hidden");
    }

    function abrirModalEditar(propietario) {
        modoModal = "editar";
        propietarioEditandoId = propietario.id;
        modalTitle.textContent = "Editar Propietario";

        limpiarFormulario();
        llenarFormulario(propietario);
        modalOverlay?.classList.remove("hidden");
    }

    function abrirModalVer(propietario) {
        modoModal = "ver";
        propietarioEditandoId = propietario.id;
        modalTitle.textContent = "Detalle del Propietario";

        limpiarFormulario();
        llenarFormulario(propietario);
        setInputsDisabled(true);

        // En modo ver, ocultamos guardar para evitar envíos accidentales
        if (btnGuardar) {
            btnGuardar.style.display = "none";
        }

        modalOverlay?.classList.remove("hidden");
    }

    function cerrarModalPropietario() {
        modalOverlay?.classList.add("hidden");

        modoModal = "crear";
        propietarioEditandoId = null;
        modalTitle.textContent = "Nuevo Propietario";

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

    //===ABREVIACION DE DIRECCION====//

    function truncarTexto(texto, limite = 20) {
    if (!texto) return "";
    return texto.length > limite 
        ? texto.slice(0, limite) + "..." 
        : texto;
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

        // Debe contener al menos una letra
        if (!/[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(nombre)) {
            return "El nombre debe contener letras";
        }

        return null;
    }

    function validarTelefono(telefono) {
        if (!telefono) {
            return "El teléfono es obligatorio";
        }

        // Solo números
        if (!/^\d+$/.test(telefono)) {
            return "El teléfono solo debe contener números";
        }

        // Ajusta este 8 si su proyecto maneja otra longitud
        if (telefono.length !== 8) {
            return "El teléfono debe tener exactamente 8 dígitos";
        }

        return null;
    }

    function validarFormularioPropietario(datos) {
        const errorNombre = validarNombre(datos.nombre);
        if (errorNombre) return errorNombre;

        const errorTelefono = validarTelefono(datos.telefono);
        if (errorTelefono) return errorTelefono;

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
        const response = await fetch(url, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            ...options
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Ocurrió un error en la solicitud");
        }

        return result;
    }

    async function obtenerPropietarios() {
        try {
            const result = await request(API_URL, { method: "GET" });
            propietarios = result.data || [];
            aplicarFiltros();
        } catch (error) {
            console.error("Error al cargar propietarios:", error.message);
            mostrarNotificacion("No se pudieron cargar los propietarios", "error");
        }
    }

    async function guardarPropietario(datosPropietario) {
        const esEdicion = modoModal === "editar";
        const url = esEdicion ? `${API_URL}/${propietarioEditandoId}` : API_URL;
        const method = esEdicion ? "PUT" : "POST";

        const result = await request(url, {
            method,
            body: JSON.stringify(datosPropietario)
        });

        mostrarNotificacion(
            result.message ||
                (esEdicion
                    ? "Propietario actualizado exitosamente"
                    : "Propietario creado exitosamente"),
            "exito"
        );

        cerrarModalPropietario();
        await obtenerPropietarios();
    }

    async function toggleEstadoPropietario(id) {
        const propietario = propietarios.find(p => String(p.id) === String(id));
        if (!propietario) return;

        const accion = propietario.Estado?.toLowerCase() === "activo" ? "desactivar" : "activar";
        const confirmado = await mostrarConfirmacion(
            `¿Seguro que deseas ${accion} a ${propietario.Nombre}?`
        );

        if (!confirmado) return;

        try {
            const result = await request(`${API_URL}/${id}/toggle`, {
                method: "PATCH"
            });

            mostrarNotificacion(result.message || "Estado actualizado", "exito");
            await obtenerPropietarios();
        } catch (error) {
            console.error("Error al cambiar estado:", error.message);
            mostrarNotificacion(error.message || "Error inesperado", "error");
        }
    }

    // =========================
    // Render
    // =========================
    function crearFilaPropietario(prop) {
        const tr = document.createElement("tr");

        const estadoClase = (prop.Estado || "").toLowerCase();
        const esMovil = window.innerWidth <= 600;

const textoBotonToggle = esMovil
  ? (estadoClase === "activo" ? "Desac." : "Act.")
  : (estadoClase === "activo" ? "Desactivar" : "Activar");;
        const claseToggle = estadoClase === "activo" ? "btn-desactivar" : "btn-activar";

        tr.innerHTML = `
            <td>${prop.Nombre || ""}</td>
            <td>${prop.Telefono || ""}</td>
            <td class="col-correo">${prop.Correo || ""}</td>
            <td class="col-direccion" title="${prop.Direccion || ""}">
                ${truncarTexto(prop.Direccion || "", 20)}
            </td>
            <td class="col-estado">
                <span class="badge ${estadoClase}">
                    ${prop.Estado || ""}
                </span>
            </td>
            <td>
                <div class="acciones-propietario">
                    <button type="button" class="btn-ver" data-id="${prop.id}">Ver</button>
                    <button type="button" class="btn-editar" data-id="${prop.id}">Editar</button>
                    <button type="button" class="btn-toggle ${claseToggle}" data-id="${prop.id}">${textoBotonToggle}</button>
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
                    <td colspan="6">No se encontraron propietarios.</td>
                </tr>
            `;
            return;
        }

        const fragment = document.createDocumentFragment();

        lista.forEach(prop => {
            fragment.appendChild(crearFilaPropietario(prop));
        });

        tableBody.appendChild(fragment);
    }

    function aplicarFiltros() {
        const texto = buscarInput?.value.toLowerCase().trim() || "";
        const estadoFiltro = filtroEstado?.value || "activos";

        const filtrados = propietarios.filter(prop => {
            const nombre = (prop.Nombre || "").toLowerCase();
            const correo = (prop.Correo || "").toLowerCase();
            const estado = (prop.Estado || "").toLowerCase();

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

    if (boton.classList.contains("btn-ver")) {
        const propietario = propietarios.find(p => String(p.id) === String(id));
        if (propietario) abrirModalVer(propietario);
        return;
    }

    if (boton.classList.contains("btn-editar")) {
        const propietario = propietarios.find(p => String(p.id) === String(id));
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

        try {
            await guardarPropietario(datosPropietario);
        } catch (error) {
            console.error("Error en formulario:", error.message);
            mostrarNotificacion(error.message, "error");
        }
    }

    function init() {
        btnNuevoPropietario?.addEventListener("click", (e) => {
            e.preventDefault();
            abrirModalCrear();
        });

        btnCerrarModal?.addEventListener("click", cerrarModalPropietario);
        btnCancelar?.addEventListener("click", cerrarModalPropietario);

        modalOverlay?.addEventListener("click", (e) => {
            if (e.target === modalOverlay) {
                cerrarModalPropietario();
            }
        });

        formNuevoPropietario?.addEventListener("submit", manejarSubmitFormulario);
        buscarInput?.addEventListener("input", aplicarFiltros);
        filtroEstado?.addEventListener("change", aplicarFiltros);
        tableBody?.addEventListener("click", manejarClickTabla);

        obtenerPropietarios();
    }

    document.addEventListener("DOMContentLoaded", init);
})();