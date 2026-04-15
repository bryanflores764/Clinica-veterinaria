(() => {
    const API_URL = "http://localhost:3000/api/propietarios";
    const token = localStorage.getItem("token");

    let propietarios = [];

    /*Constantes para el modal dinamico */
    let modoModal = "crear";
    let propietariosEditandoId = null;
    const modalTitle = document.getElementById("modalTitle");

    const tableBody = document.getElementById("ownersTableBody");
    const buscarInput = document.getElementById("buscarPropietario");
    const filtroEstado = document.getElementById("filtroEstado");

    const modalOverlay = document.getElementById("modalOverlay");
    const btnNuevoPropietario = document.getElementById("nuevo-propietario");
    const btnCerrarModal = document.getElementById("cerrarModal");
    const btnCancelar = document.getElementById("cancelar");
    const formNuevoPropietario = document.getElementById("formNuevoPropietario");

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
                    <td>${prop.Estado}</td>
                    <td>
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

    function abrirModalPropietario() {
        modalOverlay?.classList.remove("hidden");
    }

    function cerrarModalPropietario() {
        modalOverlay?.classList.add("hidden");
        formNuevoPropietario?.reset();
    }

    btnNuevoPropietario?.addEventListener("click", function (e) {
        e.preventDefault();
        abrirModalPropietario();
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

        const nuevoPropietario = {
            nombre: document.getElementById("nombre").value.trim(),
            telefono: document.getElementById("telefono").value.trim(),
            correo: document.getElementById("correo").value.trim(),
            direccion: document.getElementById("direccion").value.trim()
        };

        console.log("Enviando propietario:", nuevoPropietario);

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(nuevoPropietario)
            });

            const result = await response.json();
            console.log("POST propietario:", result);

            if (!response.ok) {
                throw new Error(result.message || "Error al crear propietario");
            }

            alert(result.message || "Propietario creado exitosamente");
            cerrarModalPropietario();
            await obtenerPropietarios();

        } catch (error) {
            console.error("Error al crear propietario:", error.message);
            alert(error.message);
        }
    });

    async function editarPropietario(id) {
        const propietario = propietarios.find(p => p.id == id);
        if (!propietario) return;

        const nombre = prompt("Nuevo nombre:", propietario.Nombre || "");
        if (nombre === null) return;

        const telefono = prompt("Nuevo teléfono:", propietario.Telefono || "");
        if (telefono === null) return;

        const correo = prompt("Nuevo correo:", propietario.Correo || "");
        if (correo === null) return;

        const direccion = prompt("Nueva dirección:", propietario.Direccion || "");
        if (direccion === null) return;

        const datosActualizados = {
            nombre: nombre.trim(),
            telefono: telefono.trim(),
            correo: correo.trim(),
            direccion: direccion.trim()
        };

        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(datosActualizados)
            });

            const result = await response.json();
            console.log("PUT propietario:", result);

            if (!response.ok) {
                throw new Error(result.message || "Error al actualizar propietario");
            }

            alert(result.message || "Propietario actualizado");
            await obtenerPropietarios();

        } catch (error) {
            console.error("Error al editar propietario:", error.message);
            alert(error.message);
        }
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