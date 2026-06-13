// ============================================================
// Archivo: js/veterinario/interfazCitas.js
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
    protegerRuta();
    mostrarNombreUsuarioLogueado();
    configurarCerrarSesion();
    configurarMenuMovil();
    configurarFiltroEstado();
    cargarCitasVeterinario();
});

const API_BASE_URL = `${window.API_URL}/api`;

let citasVeterinario = [];

// ============================================================
// Protección de ruta
// ============================================================
function protegerRuta() {
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "../../index.html";
        return;
    }
}

// ============================================================
// Mostrar bienvenida con nombre del usuario logueado
// ============================================================
function mostrarNombreUsuarioLogueado() {
    const tituloBienvenida = document.getElementById("titulo-bienvenida");

    if (!tituloBienvenida) return;

    const usuarioGuardado = localStorage.getItem("usuario");

    if (!usuarioGuardado) {
        tituloBienvenida.textContent = "Bienvenido Veterinari@";
        return;
    }

    let usuario = null;

    try {
        usuario = JSON.parse(usuarioGuardado);
    } catch (error) {
        usuario = usuarioGuardado;
    }

    const nombreUsuario = obtenerNombreUsuario(usuario);

    if (!nombreUsuario) {
        tituloBienvenida.textContent = "Bienvenido Veterinari@";
        return;
    }

    tituloBienvenida.textContent = `Bienvenido Veterinari@, ${nombreUsuario}`;
}

function obtenerNombreUsuario(usuario) {
    if (!usuario) return "";

    if (typeof usuario === "string") {
        return usuario.trim();
    }

    if (typeof usuario === "object") {
        return (
            usuario.Nombre_Usuario ||
            usuario.nombre_usuario ||
            usuario.nombreUsuario ||
            usuario.Nombre ||
            usuario.nombre ||
            usuario.usuario ||
            usuario.username ||
            usuario.Correo ||
            usuario.correo ||
            usuario.email ||
            ""
        ).trim();
    }

    return "";
}

// ============================================================
// Obtener ID del veterinario logueado
// ============================================================
function obtenerIdVeterinarioLogueado() {
    const usuarioGuardado = localStorage.getItem("usuario");

    if (!usuarioGuardado) return null;

    try {
        const usuario = JSON.parse(usuarioGuardado);

        return (
            usuario.IdUsuario ||
            usuario.Id_Usuario ||
            usuario.idUsuario ||
            usuario.id_usuario ||
            usuario.id ||
            usuario.Id ||
            null
        );
    } catch (error) {
        return null;
    }
}

// ============================================================
// Cargar citas desde backend
// ============================================================
async function cargarCitasVeterinario() {
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "../../index.html";
        return;
    }

    const idVeterinario = obtenerIdVeterinarioLogueado();

    let endpoint = `${API_BASE_URL}/citas`;

    if (idVeterinario) {
        endpoint = `${API_BASE_URL}/citas/veterinario/${idVeterinario}`;
    }

    try {
        const respuesta = await fetch(endpoint, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!respuesta.ok) {
            throw new Error("No se pudieron obtener las citas.");
        }

        const data = await respuesta.json();

        citasVeterinario = normalizarRespuestaCitas(data);
        renderizarCitas();
    } catch (error) {
        console.error("Error al cargar citas:", error);
        mostrarMensajeSinCitas("No se pudieron cargar las citas.");
    }
}

function normalizarRespuestaCitas(data) {
    let lista = [];

    if (Array.isArray(data)) {
        lista = data;
    } else if (Array.isArray(data.data)) {
        lista = data.data;
    } else if (Array.isArray(data.citas)) {
        lista = data.citas;
    } else if (data.data && Array.isArray(data.data.citas)) {
        lista = data.data.citas;
    }

    return lista.map((cita) => normalizarCita(cita));
}

function normalizarCita(cita) {
    const fechaHora =
        cita.FechaHora ||
        cita.fechaHora ||
        cita.fecha_hora ||
        cita.Fecha_Hora ||
        "";

    return {
        id:
            cita.IdCita ||
            cita.idCita ||
            cita.id_cita ||
            cita.Id_Cita ||
            cita.id ||
            cita.Id ||
            cita.ID ||
            "",

        mascota:
            cita.Mascota ||
            cita.mascota ||
            cita.nombreMascota ||
            cita.NombreMascota ||
            cita.nombre_mascota ||
            cita.Nombre_Mascota ||
            cita.NombreMascotaPaciente ||
            cita.nombre ||
            "Sin mascota",

        fecha:
            cita.Fecha ||
            cita.fecha ||
            cita.fecha_cita ||
            cita.Fecha_Cita ||
            obtenerFechaDesdeFechaHora(fechaHora),

        hora:
            cita.Hora ||
            cita.hora ||
            cita.hora_cita ||
            cita.Hora_Cita ||
            obtenerHoraDesdeFechaHora(fechaHora),

        estado: normalizarEstado(
            cita.Estado ||
            cita.estado ||
            cita.estado_cita ||
            cita.Estado_Cita ||
            cita.IdEstadoCita ||
            cita.idEstadoCita ||
            cita.IdEstado ||
            cita.idEstado ||
            cita.id_estado ||
            cita.Id_Estado ||
            "Pendiente"
        )
    };
}

// ============================================================
// Renderizar tabla de citas
// ============================================================
function renderizarCitas() {
    const tablaCitas = document.getElementById("tablaCitas");
    const contenedorTabla = document.getElementById("contenedorTabla");
    const mensajeSinCitas = document.getElementById("mensajeSinCitas");
    const filtroEstado = document.getElementById("filtroEstado");

    if (!tablaCitas) return;

    tablaCitas.innerHTML = "";

    const estadoSeleccionado = filtroEstado ? filtroEstado.value : "todos";

    const citasFiltradas = citasVeterinario.filter((cita) => {
        if (estadoSeleccionado === "todos") return true;
        return cita.estado === estadoSeleccionado;
    });

    if (citasFiltradas.length === 0) {
        if (contenedorTabla) {
            contenedorTabla.classList.add("hidden");
        }

        if (mensajeSinCitas) {
            mensajeSinCitas.textContent = "No hay citas para mostrar.";
            mensajeSinCitas.style.display = "block";
        }

        return;
    }

    if (contenedorTabla) {
        contenedorTabla.classList.remove("hidden");
    }

    if (mensajeSinCitas) {
        mensajeSinCitas.style.display = "none";
    }

    citasFiltradas.forEach((cita) => {
        const fila = document.createElement("tr");

        fila.innerHTML = `
            <td data-label="ID">${cita.id || "-"}</td>
            <td data-label="Mascota">${cita.mascota || "-"}</td>
            <td data-label="Fecha">${formatearFecha(cita.fecha)}</td>
            <td data-label="Hora">${formatearHora(cita.hora)}</td>
            <td data-label="Estado">
                <span class="${obtenerClaseEstado(cita.estado)}">
                    ${cita.estado}
                </span>
            </td>
            <td data-label="Acciones">
                <div class="acciones-cita-veterinario">
                    <button
                        type="button"
                        class="btn-estado btn-pendiente"
                        data-id="${cita.id}"
                        data-estado-id="1"
                        data-estado-texto="Pendiente"
                    >
                        Pendiente
                    </button>

                    <button
                        type="button"
                        class="btn-estado btn-en-curso"
                        data-id="${cita.id}"
                        data-estado-id="2"
                        data-estado-texto="En Curso"
                    >
                        En Curso
                    </button>

                    <button
                        type="button"
                        class="btn-estado btn-completada"
                        data-id="${cita.id}"
                        data-estado-id="4"
                        data-estado-texto="Completada"
                    >
                        Completar
                    </button>

                    <button
                        type="button"
                        class="btn-estado btn-cancelada"
                        data-id="${cita.id}"
                        data-estado-id="3"
                        data-estado-texto="Cancelada"
                    >
                        Cancelar
                    </button>
                </div>
            </td>
        `;

        tablaCitas.appendChild(fila);
    });

    configurarBotonesEstado();
}

function mostrarMensajeSinCitas(mensaje) {
    const tablaCitas = document.getElementById("tablaCitas");
    const contenedorTabla = document.getElementById("contenedorTabla");
    const mensajeSinCitas = document.getElementById("mensajeSinCitas");

    if (tablaCitas) {
        tablaCitas.innerHTML = "";
    }

    if (contenedorTabla) {
        contenedorTabla.classList.add("hidden");
    }

    if (mensajeSinCitas) {
        mensajeSinCitas.textContent = mensaje;
        mensajeSinCitas.style.display = "block";
    }
}

// ============================================================
// Filtro por estado
// ============================================================
function configurarFiltroEstado() {
    const filtroEstado = document.getElementById("filtroEstado");

    if (!filtroEstado) return;

    filtroEstado.addEventListener("change", () => {
        renderizarCitas();
    });
}

// ============================================================
// Botones para cambiar estado
// ============================================================
function configurarBotonesEstado() {
    const botonesEstado = document.querySelectorAll(".btn-estado");

    botonesEstado.forEach((boton) => {
        boton.addEventListener("click", async () => {
            const idCita = boton.dataset.id;
            const nuevoEstadoId = boton.dataset.estadoId;
            const nuevoEstadoTexto = boton.dataset.estadoTexto;

            await cambiarEstadoCita(idCita, nuevoEstadoId, nuevoEstadoTexto);
        });
    });
}

// ============================================================
// Cambiar estado en backend
// ============================================================
async function cambiarEstadoCita(idCita, nuevoEstadoId, nuevoEstadoTexto) {
    if (!idCita) {
        alert("No se encontró el ID de la cita.");
        return;
    }

    const confirmar = confirm(`¿Desea cambiar esta cita a "${nuevoEstadoTexto}"?`);

    if (!confirmar) return;

    const token = localStorage.getItem("token");

    try {
        const respuesta = await fetch(`${API_BASE_URL}/citas/${idCita}/estado`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                IdEstadoCita: Number(nuevoEstadoId)
            })
        });

        if (!respuesta.ok) {
            const errorData = await obtenerErrorRespuesta(respuesta);
            throw new Error(errorData || "No se pudo actualizar el estado de la cita.");
        }

        // Actualizar el array local inmediatamente para que el UI refleje el cambio
        // sin esperar a que el re-fetch complete
        const idx = citasVeterinario.findIndex(c => String(c.id) === String(idCita));
        if (idx !== -1) {
            citasVeterinario[idx] = {
                ...citasVeterinario[idx],
                estado: normalizarEstado(nuevoEstadoTexto)
            };
            renderizarCitas();
        }

        alert("Estado actualizado correctamente.");
        await cargarCitasVeterinario();
    } catch (error) {
        console.error("Error al actualizar estado:", error);
        alert(`No se pudo actualizar el estado en la base de datos. ${error.message}`);
    }
}

async function obtenerErrorRespuesta(respuesta) {
    try {
        const data = await respuesta.json();
        return data.message || data.error || "";
    } catch (error) {
        return "";
    }
}

// ============================================================
// Estados
// ============================================================
function normalizarEstado(estado) {
    const valor = String(estado).trim().toLowerCase();

    if (valor === "1" || valor === "pendiente") return "Pendiente";
    if (valor === "2" || valor === "en curso" || valor === "encurso") return "En Curso";
    if (valor === "3" || valor === "cancelada" || valor === "cancelado") return "Cancelada";
    if (valor === "4" || valor === "completada" || valor === "completado") return "Completada";

    return "Pendiente";
}

function obtenerClaseEstado(estado) {
    if (estado === "En Curso") {
        return "estado-en-curso";
    }

    if (estado === "Completada") {
        return "estado-completada";
    }

    if (estado === "Cancelada") {
        return "estado-cancelada";
    }

    return "estado-pendiente";
}

// ============================================================
// Formateo de fecha y hora
// ============================================================
function obtenerFechaDesdeFechaHora(fechaHora) {
    if (!fechaHora) return "";

    const texto = String(fechaHora);

    if (texto.includes("T")) {
        return texto.split("T")[0];
    }

    if (texto.includes(" ")) {
        return texto.split(" ")[0];
    }

    return "";
}

function obtenerHoraDesdeFechaHora(fechaHora) {
    if (!fechaHora) return "";

    const texto = String(fechaHora);

    if (texto.includes("T")) {
        const parteHora = texto.split("T")[1] || "";
        return parteHora.slice(0, 5);
    }

    if (texto.includes(" ")) {
        const parteHora = texto.split(" ")[1] || "";
        return parteHora.slice(0, 5);
    }

    return "";
}

function formatearFecha(fecha) {
    if (!fecha) return "-";

    let fechaLimpia = String(fecha);

    if (fechaLimpia.includes("T")) {
        fechaLimpia = fechaLimpia.split("T")[0];
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(fechaLimpia)) {
        const [anio, mes, dia] = fechaLimpia.split("-");
        return `${dia}/${mes}/${anio}`;
    }

    return fechaLimpia;
}

function formatearHora(hora) {
    if (!hora) return "-";

    const horaTexto = String(hora);

    if (horaTexto.length >= 5) {
        return horaTexto.slice(0, 5);
    }

    return horaTexto;
}

// ============================================================
// Cerrar sesión
// ============================================================
function configurarCerrarSesion() {
    const btnLogout = document.getElementById("cerrar-sesion");

    if (!btnLogout) return;

    btnLogout.addEventListener("click", async (e) => {
        e.preventDefault();

        const token = localStorage.getItem("token");

        try {
            await fetch(`${API_BASE_URL}/auth/logout`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }

        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        sessionStorage.clear();

        window.location.href = "../../index.html";
    });
}

// ============================================================
// Menú móvil
// ============================================================
function configurarMenuMovil() {
    const toggle = document.querySelector(".menu-toggle");
    const backdrop = document.querySelector(".sidebar-backdrop");

    function setMenu(open) {
        document.body.classList.toggle("menu-open", open);

        if (toggle) {
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
        }
    }

    if (toggle) {
        toggle.addEventListener("click", () => {
            const isOpen = document.body.classList.contains("menu-open");
            setMenu(!isOpen);
        });
    }

    if (backdrop) {
        backdrop.addEventListener("click", () => {
            setMenu(false);
        });
    }

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            setMenu(false);
        }
    });
}