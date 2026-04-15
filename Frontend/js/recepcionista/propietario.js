(() => {
    const API_URL = "http://localhost:3000/api/propietarios";
    const token = localStorage.getItem("token");

    let propietarios = [];

    /*Constantes para el modal dinamico */
    let modoModal = "crear";
    let propietarioEditandoId = null;
    const modalTitle = document.getElementById("modalTitle");
    /*Constantes para el modal dinamico */

    const tableBody = document.getElementById("ownersTableBody");
    const buscarInput = document.getElementById("buscarPropietario");
    const filtroEstado = document.getElementById("filtroEstado");

    const modalOverlay = document.getElementById("modalOverlay");
    const btnNuevoPropietario = document.getElementById("nuevo-propietario");
    const btnCerrarModal = document.getElementById("cerrarModal");
    const btnCancelar = document.getElementById("cancelar");
    const formNuevoPropietario = document.getElementById("formNuevoPropietario");

    /*MODAL DINAMICO*/
    function abrirModalCrear(){
        modoModal = "crear";
        propietarioEditandoId = null;

        modalTitle.textContent = "Nuevo Propietario"
        formNuevoPropietario.reset();

        modalOverlay?.classList.remove("hidden");
    }

    function abrirModalEditar(propietario) {
        modoModal = "editar";
        propietarioEditandoId = propietario.id;

        modalTitle.textContent = "Editar Propietario";

        document.getElementById("nombre").value = propietario.Nombre || "";
        document.getElementById("telefono").value = propietario.Telefono || "";
        document.getElementById("correo").value = propietario.Correo || "";
        document.getElementById("direccion").value = propietario.Direccion || "";

        modalOverlay?.classList.remove("hidden");
    }
    /*------------------------------------------------- */


    /**VER DATOS DEL PROPIETARIO  */
    
    function verPropietario(id) {
    const propietario = propietarios.find(p => p.id == id);
    if (!propietario) return;

    modoModal = "ver";

    modalTitle.textContent = "Detalle del Propietario";

    document.getElementById("nombre").value = propietario.Nombre || "";
    document.getElementById("telefono").value = propietario.Telefono || "";
    document.getElementById("correo").value = propietario.Correo || "";
    document.getElementById("direccion").value = propietario.Direccion || "";

    // Desactivar inputs
    document.querySelectorAll("#formNuevoPropietario input").forEach(input => {
        input.disabled = true;
    });

    modalOverlay.classList.remove("hidden");
}
/**---------------------------------------------------------------------------------------------------------- */
    async function obtenerPropietarios() {
        try {
            const response = await fetch(API_URL, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            const result = await response.json();
            console.log("GET propietarios:", result);

            if (!response.ok) {
                throw new Error(result.message || "Error al obtener propietarios");
            }

            propietarios = result.data || [];
            aplicarFiltros();

        } catch (error) {
            console.error("Error al cargar propietarios:", error.message);
            alert("No se pudieron cargar los propietarios");
        }
    }

    function renderizarPropietarios(lista) {
        tableBody.innerHTML = "";

        if (!lista.length) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7">No se encontraron propietarios.</td>
                </tr>
            `;
            return;
        }

        lista.forEach(prop => {
            tableBody.innerHTML += `
                <tr>
                    <td>${prop.id}</td>
                    <td>${prop.Nombre}</td>
                    <td>${prop.Telefono ?? ""}</td>
                    <td>${prop.Correo ?? ""}</td>
                    <td>${prop.Direccion ?? ""}</td>
                    <td>
                        <span class="badge ${prop.Estado.toLowerCase()}">
                            ${prop.Estado}
                        </span>
                    <td>
                        <button class="btn-ver" data-id="${prop.id}">Ver</button>
                        <button type="button" class="btn-editar" data-id="${prop.id}">Editar</button>
                        <button type="button" class="btn-toggle" data-id="${prop.id}">
                            ${prop.Estado.toLowerCase() === "activo" ? "Desactivar" : "Activar"}
                        </button>
                    </td>
                </tr>
            `;
        });

        document.querySelectorAll(".btn-editar").forEach(btn => {
            btn.addEventListener("click", () => editarPropietario(btn.dataset.id));
        });

        document.querySelectorAll(".btn-toggle").forEach(btn => {
            btn.addEventListener("click", () => toggleEstadoPropietario(btn.dataset.id));
        });

        document.querySelectorAll(".btn-ver").forEach(btn => {
            btn.addEventListener("click", () => verPropietario(btn.dataset.id));
        });
    }

    function aplicarFiltros() {
        const texto = buscarInput?.value.toLowerCase().trim() || "";
        const estadoFiltro = filtroEstado?.value || "activos";

        const filtrados = propietarios.filter(prop => {
            const nombre = (prop.Nombre || "").toLowerCase();
            const correo = (prop.Correo || "").toLowerCase();
            const estado = (prop.Estado || "").toLowerCase();

            const coincideTexto =
                nombre.includes(texto) ||
                correo.includes(texto);

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

    function cerrarModalPropietario() {
    modalOverlay?.classList.add("hidden");
    formNuevoPropietario?.reset();

    modoModal = "crear";
    propietarioEditandoId = null;
    modalTitle.textContent = "Nuevo Propietario";

    //volver a activar inputs
    document.querySelectorAll("#formNuevoPropietario input").forEach(input => {
        input.disabled = false;
    });
}

    btnNuevoPropietario?.addEventListener("click", function (e) {
        e.preventDefault();
        abrirModalCrear();
    });

    btnCerrarModal?.addEventListener("click", cerrarModalPropietario);
    btnCancelar?.addEventListener("click", cerrarModalPropietario);

    modalOverlay?.addEventListener("click", function (e) {
        if (e.target === modalOverlay) {
            cerrarModalPropietario();
        }
    });

    formNuevoPropietario?.addEventListener("submit", async function (e) {
    e.preventDefault();

    const datosPropietario = {
        nombre: document.getElementById("nombre").value.trim(),
        telefono: document.getElementById("telefono").value.trim(),
        correo: document.getElementById("correo").value.trim(),
        direccion: document.getElementById("direccion").value.trim()
    };

    const esEdicion = modoModal === "editar";
    const url = esEdicion ? `${API_URL}/${propietarioEditandoId}` : API_URL;
    const metodo = esEdicion ? "PUT" : "POST";

    console.log("Modo modal:", modoModal);
    console.log("Enviando datos:", datosPropietario);

    try {
        const response = await fetch(url, {
            method: metodo,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(datosPropietario)
        });

        const result = await response.json();
        console.log(`${metodo} propietario:`, result);

        if (!response.ok) {
            throw new Error(
                result.message ||
                (esEdicion ? "Error al actualizar propietario" : "Error al crear propietario")
            );
        }

        alert(
            result.message ||
            (esEdicion ? "Propietario actualizado exitosamente" : "Propietario creado exitosamente")
        );

        cerrarModalPropietario();
        await obtenerPropietarios();

    } catch (error) {
        console.error("Error en formulario:", error.message);
        alert(error.message);
    }
});

    function editarPropietario(id) {
        const propietario = propietarios.find(p => p.id == id);
        if (!propietario) return;

        abrirModalEditar(propietario);
    }

    async function toggleEstadoPropietario(id) {
        const propietario = propietarios.find(p => p.id == id);
        if (!propietario) return;

        const accion = propietario.Estado.toLowerCase() === "activo" ? "desactivar" : "activar";
        const confirmar = confirm(`¿Seguro que deseas ${accion} a ${propietario.Nombre}?`);

        if (!confirmar) return;

        try {
            const response = await fetch(`${API_URL}/${id}/toggle`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            const result = await response.json();
            console.log("PATCH propietario:", result);

            if (!response.ok) {
                throw new Error(result.message || "Error al cambiar estado");
            }

            alert(result.message || "Estado actualizado");
            await obtenerPropietarios();

        } catch (error) {
            console.error("Error al cambiar estado:", error.message);
            alert(error.message);
        }
    }

    document.addEventListener("DOMContentLoaded", () => {
        obtenerPropietarios();
    });

    buscarInput?.addEventListener("input", aplicarFiltros);
    filtroEstado?.addEventListener("change", aplicarFiltros);
})();