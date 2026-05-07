const API_BASE = "http://localhost:3000";

const API_PRODUCTOS = `${API_BASE}/api/productos`;
const API_VENTAS = `${API_BASE}/api/ventas`;
const API_PROPIETARIOS = `${API_BASE}/api/propietarios`;

let productosDisponibles = [];
let propietariosDisponibles = [];

// ─────────────────────────────────────────────
// TOKEN Y HEADERS
// ─────────────────────────────────────────────
function obtenerToken() {
    return localStorage.getItem("token");
}

function obtenerHeadersAuth() {
    const token = obtenerToken();

    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
}

// ─────────────────────────────────────────────
// UTILIDADES
// ─────────────────────────────────────────────
function fechaHoy() {
    const hoy = new Date();

    return hoy.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });
}

function formatearFecha(fechaISO) {
    if (!fechaISO) return "—";

    const fecha = new Date(fechaISO);

    return fecha.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });
}

function usuarioActual() {
    try {
        const raw = localStorage.getItem("usuario");

        if (!raw) return "Desconocido";

        const usuario = JSON.parse(raw);

        return usuario.Nombre_Usuario ?? "Desconocido";
    } catch {
        return "Desconocido";
    }
}

function obtenerClaseEstado(estado) {
    const estadoNormalizado = estado?.toLowerCase();

    if (estadoNormalizado === "confirmada") return "estado-confirmada";
    if (estadoNormalizado === "anulada") return "estado-anulada";

    return "estado-activa";
}

// ─────────────────────────────────────────────
// EVENTO PARA BOTÓN DETALLE
// ─────────────────────────────────────────────
document.getElementById("tbodyVentas")?.addEventListener("click", (e) => {
    const btnDetalle = e.target.closest(".btn-detalle-venta");

    if (!btnDetalle) return;

    const idVenta = btnDetalle.dataset.id;

    abrirDetalleVenta(idVenta);
});

// ─────────────────────────────────────────────
// CARGAR VENTAS EN TABLA
// ─────────────────────────────────────────────
async function cargarVentas() {
    const token = obtenerToken();

    if (!token) {
        mostrarAlerta("No hay sesión activa. Inicia sesión nuevamente.");
        return;
    }

    const tbody = document.getElementById("tbodyVentas");
    const empty = document.getElementById("ventasEmpty");

    if (!tbody) return;

    try {
        const res = await fetch(API_VENTAS, {
            method: "GET",
            headers: obtenerHeadersAuth()
        });

        const json = await res.json();

        console.log("Respuesta ventas:", json);

        if (!res.ok || json.success === false) {
            throw new Error(json.message || "No se pudieron obtener las ventas.");
        }

        const ventas = Array.isArray(json) ? json : json.data ?? [];

        tbody.innerHTML = "";

        if (ventas.length === 0) {
            empty?.classList.remove("hidden");
            return;
        }

        empty?.classList.add("hidden");

        ventas.forEach((venta) => {
            const tr = document.createElement("tr");

            const idVenta = venta.Id ?? venta.id;

            const fechaVenta =
                venta.Fecha_Venta ??
                venta.fecha_venta ??
                venta.fechaVenta ??
                venta.fecha;

            const idPropietario =
                venta.Id_Propietario ??
                venta.idPropietario ??
                venta.id_propietario;

            const propietario =
                venta.Propietario ??
                venta.Nombre_Propietario ??
                venta.Nombre ??
                venta.nombre ??
                `Propietario #${idPropietario ?? "N/A"}`;

            const totalVenta =
                venta.Total ??
                venta.total ??
                0;

            const estado =
                venta.Estado ??
                venta.estado ??
                "activa";

            const fecha = formatearFecha(fechaVenta);
            const total = parseFloat(totalVenta ?? 0).toFixed(2);
            const claseEstado = obtenerClaseEstado(estado);

            tr.innerHTML = `
                <td>${fecha}</td>

                <td>${propietario}</td>

                <td>$${total}</td>

                <td>
                    <span class="venta-estado ${claseEstado}">
                        ${estado}
                    </span>
                </td>

                <td>
                    <div class="ventas-actions">
                        <button 
                            type="button" 
                            class="btn-detalle-venta"
                            data-id="${idVenta}"
                        >
                            Detalle
                        </button>

                        <button 
                            type="button" 
                            class="btn-editar-venta"
                            data-id="${idVenta}"
                        >
                            Editar
                        </button>
                    </div>
                </td>
            `;

            tbody.appendChild(tr);
        });

    } catch (error) {
        console.error("Error al cargar ventas:", error);
        mostrarAlerta(error.message || "No se pudieron cargar las ventas.");
    }
}

// ─────────────────────────────────────────────
// CARGAR PRODUCTOS DISPONIBLES
// ─────────────────────────────────────────────
async function cargarProductosDisponibles() {
    try {
        const res = await fetch(API_PRODUCTOS, {
            method: "GET",
            headers: obtenerHeadersAuth()
        });

        const json = await res.json();

        console.log("Respuesta productos:", json);

        if (!res.ok || json.success === false) {
            throw new Error(json.message || "No se pudieron cargar los productos.");
        }

        const todos = Array.isArray(json) ? json : json.data ?? [];

        productosDisponibles = todos.filter((producto) => {
            return producto.Estado === "activo";
        });

    } catch (error) {
        console.error("Error al cargar productos:", error);
        productosDisponibles = [];
    }
}

// ─────────────────────────────────────────────
// CARGAR PROPIETARIOS
// ─────────────────────────────────────────────
async function cargarPropietariosDisponibles() {
    const select = document.getElementById("selectPropietarioVenta");

    if (!select) return;

    try {
        const res = await fetch(API_PROPIETARIOS, {
            method: "GET",
            headers: obtenerHeadersAuth()
        });

        const json = await res.json();

        console.log("Respuesta propietarios:", json);

        if (!res.ok || json.success === false) {
            throw new Error(json.message || "No se pudieron cargar los propietarios.");
        }

        propietariosDisponibles = Array.isArray(json) ? json : json.data ?? [];

        select.innerHTML = `<option value="">Seleccionar propietario...</option>`;

        propietariosDisponibles.forEach((propietario) => {
            const option = document.createElement("option");

            const idPropietario = propietario.Id ?? propietario.id;

            const nombrePropietario =
                propietario.Nombre ??
                propietario.nombre ??
                propietario.Nombre_Propietario ??
                propietario.Propietario ??
                `Propietario #${idPropietario ?? "N/A"}`;

            option.value = idPropietario;
            option.textContent = nombrePropietario;

            select.appendChild(option);
        });

    } catch (error) {
        console.error("Error al cargar propietarios:", error);

        select.innerHTML = `
            <option value="">No se pudieron cargar propietarios</option>
        `;
    }
}

// ─────────────────────────────────────────────
// MODAL NUEVA VENTA
// ─────────────────────────────────────────────
async function abrirModalVenta() {
    const token = obtenerToken();

    if (!token) {
        mostrarAlerta("No hay sesión activa. Inicia sesión nuevamente.");
        return;
    }

    document.getElementById("ventaFecha").textContent = fechaHoy();
    document.getElementById("ventaUsuario").textContent = usuarioActual();

    document.getElementById("tbodyProductosVenta").innerHTML = "";

    const selectPropietario = document.getElementById("selectPropietarioVenta");

    if (selectPropietario) {
        selectPropietario.value = "";
    }

    actualizarTotal();

    await cargarProductosDisponibles();
    await cargarPropietariosDisponibles();

    document.getElementById("modalVenta").classList.remove("hidden");
}

function cerrarModalVenta() {
    document.getElementById("modalVenta").classList.add("hidden");
}

document.getElementById("btnNuevaVenta")?.addEventListener("click", (e) => {
    e.preventDefault();
    abrirModalVenta();
});

document.getElementById("cerrarModalVenta")?.addEventListener("click", cerrarModalVenta);
document.getElementById("cerrarModalVentaBtn")?.addEventListener("click", cerrarModalVenta);

// ─────────────────────────────────────────────
// FILAS DE PRODUCTOS
// ─────────────────────────────────────────────
function crearFilaProducto() {
    const tr = document.createElement("tr");

    const opcionesHTML = productosDisponibles.length
        ? productosDisponibles.map((producto) => {
            const idProducto = producto.Id ?? producto.id;

            const nombreProducto =
                producto.Nombre_Producto ??
                producto.nombre ??
                producto.Nombre ??
                "Producto sin nombre";

            const precioProducto = producto.Precio ?? producto.precio ?? 0;

            return `
                <option 
                    value="${idProducto}" 
                    data-precio="${precioProducto}"
                >
                    ${nombreProducto}
                </option>
            `;
        }).join("")
        : `<option value="">Sin productos disponibles</option>`;

    tr.innerHTML = `
        <td>
            <select class="select-producto">
                <option value="">Seleccionar...</option>
                ${opcionesHTML}
            </select>
        </td>

        <td>
            <input 
                type="number" 
                class="input-cantidad" 
                value="1" 
                min="1"
            >
        </td>

        <td>
            <span class="venta-precio-unit">$0.00</span>
        </td>

        <td>
            <span class="venta-subtotal">$0.00</span>
        </td>

        <td>
            <button 
                type="button" 
                class="btn-eliminar-fila" 
                title="Eliminar"
            >
                ✕
            </button>
        </td>
    `;

    const select = tr.querySelector(".select-producto");
    const inputCantidad = tr.querySelector(".input-cantidad");
    const spanPrecio = tr.querySelector(".venta-precio-unit");
    const spanSubtotal = tr.querySelector(".venta-subtotal");
    const btnEliminar = tr.querySelector(".btn-eliminar-fila");

    function recalcularFila() {
        const option = select.options[select.selectedIndex];
        const precio = option ? parseFloat(option.dataset.precio) || 0 : 0;
        const cantidad = parseInt(inputCantidad.value) || 0;

        spanPrecio.textContent = `$${precio.toFixed(2)}`;
        spanSubtotal.textContent = `$${(precio * cantidad).toFixed(2)}`;

        actualizarTotal();
    }

    select.addEventListener("change", recalcularFila);

    inputCantidad.addEventListener("input", () => {
        if (parseInt(inputCantidad.value) < 1) {
            inputCantidad.value = 1;
        }

        recalcularFila();
    });

    btnEliminar.addEventListener("click", () => {
        tr.remove();
        actualizarTotal();
    });

    return tr;
}

document.getElementById("btnAgregarProducto")?.addEventListener("click", () => {
    const tbody = document.getElementById("tbodyProductosVenta");

    tbody.appendChild(crearFilaProducto());

    actualizarTotal();
});

// ─────────────────────────────────────────────
// TOTAL
// ─────────────────────────────────────────────
function actualizarTotal() {
    const subtotales = [
        ...document.querySelectorAll("#tbodyProductosVenta .venta-subtotal")
    ];

    const total = subtotales.reduce((acc, elemento) => {
        const valor = parseFloat(elemento.textContent.replace("$", "")) || 0;
        return acc + valor;
    }, 0);

    const ventaTotal = document.getElementById("ventaTotal");

    if (ventaTotal) {
        ventaTotal.textContent = `$${total.toFixed(2)}`;
    }
}

// ─────────────────────────────────────────────
// OBTENER ITEMS DE LA VENTA
// ─────────────────────────────────────────────
function obtenerItemsVenta() {
    const filas = [...document.querySelectorAll("#tbodyProductosVenta tr")];

    return filas.map((tr) => {
        const select = tr.querySelector(".select-producto");
        const inputCantidad = tr.querySelector(".input-cantidad");
        const option = select.options[select.selectedIndex];

        return {
            idProducto: parseInt(select.value),
            nombre: option?.textContent.trim() ?? "",
            cantidad: parseInt(inputCantidad.value) || 0,
            precio: parseFloat(option?.dataset.precio) || 0
        };
    });
}

// ─────────────────────────────────────────────
// GUARDAR Y CONFIRMAR VENTA EN API
// ─────────────────────────────────────────────
document.getElementById("btnGuardarVenta")?.addEventListener("click", async () => {
    const token = obtenerToken();

    if (!token) {
        mostrarAlerta("No hay sesión activa. Inicia sesión nuevamente.");
        return;
    }

    const filas = [...document.querySelectorAll("#tbodyProductosVenta tr")];
    const selectPropietario = document.getElementById("selectPropietarioVenta");

    if (!selectPropietario?.value) {
        mostrarAlerta("Selecciona un propietario para registrar la venta.");
        return;
    }

    if (filas.length === 0) {
        mostrarAlerta("Agrega al menos un producto antes de registrar la venta.");
        return;
    }

    const items = obtenerItemsVenta();

    const sinSeleccionar = items.some((item) => !item.idProducto);

    if (sinSeleccionar) {
        mostrarAlerta("Hay filas sin producto seleccionado. Completa o elimínalas.");
        return;
    }

    const cantidadInvalida = items.some((item) => item.cantidad <= 0);

    if (cantidadInvalida) {
        mostrarAlerta("La cantidad de cada producto debe ser mayor a 0.");
        return;
    }

    try {
        const idPropietario = parseInt(selectPropietario.value);

        console.log("Valor del select propietario:", selectPropietario.value);
        console.log("Id propietario seleccionado:", idPropietario);
        console.log("Token enviado:", token);
        console.log("Authorization:", `Bearer ${token}`);

        // 1. Crear cabecera de venta
        const resVenta = await fetch(API_VENTAS, {
            method: "POST",
            headers: obtenerHeadersAuth(),
            body: JSON.stringify({
                idPropietario: idPropietario,
                Id_Propietario: idPropietario
            })
        });

        const jsonVenta = await resVenta.json();

        console.log("Respuesta crear venta:", jsonVenta);

        if (!resVenta.ok || jsonVenta.success === false) {
            throw new Error(jsonVenta.message || "No se pudo crear la venta.");
        }

        const idVenta = jsonVenta.data?.id ?? jsonVenta.data?.Id;

        if (!idVenta) {
            throw new Error("La API no devolvió el ID de la venta creada.");
        }

        // 2. Agregar cada producto al detalle
        for (const item of items) {
            const resDetalle = await fetch(`${API_VENTAS}/${idVenta}/detalle`, {
                method: "POST",
                headers: obtenerHeadersAuth(),
                body: JSON.stringify({
                    idProducto: item.idProducto,
                    Id_Producto: item.idProducto,
                    cantidad: item.cantidad,
                    Cantidad: item.cantidad
                })
            });

            const jsonDetalle = await resDetalle.json();

            console.log("Respuesta detalle venta:", jsonDetalle);

            if (!resDetalle.ok || jsonDetalle.success === false) {
                throw new Error(jsonDetalle.message || "No se pudo agregar un producto al detalle.");
            }
        }

        // 3. Confirmar venta automáticamente
        const resConfirmar = await fetch(`${API_VENTAS}/${idVenta}/confirmar`, {
            method: "PATCH",
            headers: obtenerHeadersAuth()
        });

        const jsonConfirmar = await resConfirmar.json();

        console.log("Respuesta confirmar venta:", jsonConfirmar);

        if (!resConfirmar.ok || jsonConfirmar.success === false) {
            throw new Error(jsonConfirmar.message || "No se pudo confirmar la venta.");
        }

        cerrarModalVenta();

        mostrarExito("Venta registrada y confirmada correctamente.");

        await cargarVentas();

    } catch (error) {
        console.error("Error al registrar venta:", error);
        mostrarAlerta(error.message || "Ocurrió un error al registrar la venta.");
    }
});

// ─────────────────────────────────────────────
// MODAL DETALLE DE VENTA
// ─────────────────────────────────────────────
async function abrirDetalleVenta(idVenta) {
    const token = obtenerToken();

    if (!token) {
        mostrarAlerta("No hay sesión activa. Inicia sesión nuevamente.");
        return;
    }

    if (!idVenta) {
        mostrarAlerta("No se encontró el ID de la venta.");
        return;
    }

    try {
        const res = await fetch(`${API_VENTAS}/${idVenta}`, {
            method: "GET",
            headers: obtenerHeadersAuth()
        });

        const json = await res.json();

        console.log("Respuesta detalle venta:", json);

        if (!res.ok || json.success === false) {
            throw new Error(json.message || "No se pudo obtener el detalle de la venta.");
        }

        const venta = json.data;

        pintarDetalleVenta(venta);

        document.getElementById("modalDetalleVenta").classList.remove("hidden");

    } catch (error) {
        console.error("Error al obtener detalle de venta:", error);
        mostrarAlerta(error.message || "Ocurrió un error al obtener el detalle de la venta.");
    }
}

function pintarDetalleVenta(venta) {
    const detalleFecha = document.getElementById("detalleFecha");
    const detallePropietario = document.getElementById("detallePropietario");
    const detalleEstado = document.getElementById("detalleEstado");
    const detalleTotal = document.getElementById("detalleTotal");
    const tbodyDetalle = document.getElementById("tbodyDetalleVenta");
    const detalleEmptyMsg = document.getElementById("detalleEmptyMsg");

    const fechaVenta =
        venta.Fecha_Venta ??
        venta.fecha_venta ??
        venta.fechaVenta ??
        venta.fecha;

    const propietario =
        venta.Propietario ??
        venta.Nombre_Propietario ??
        venta.Nombre ??
        venta.nombre ??
        "Sin propietario";

    const estado =
        venta.Estado ??
        venta.estado ??
        "activa";

    const totalVenta =
        venta.Total ??
        venta.total ??
        0;

    const detalle =
        venta.detalle ??
        venta.Detalle ??
        venta.productos ??
        [];

    detalleFecha.textContent = formatearFecha(fechaVenta);
    detallePropietario.textContent = propietario;
    detalleEstado.textContent = estado;
    detalleTotal.textContent = `$${parseFloat(totalVenta ?? 0).toFixed(2)}`;

    tbodyDetalle.innerHTML = "";

    if (!Array.isArray(detalle) || detalle.length === 0) {
        detalleEmptyMsg?.classList.remove("hidden");
        return;
    }

    detalleEmptyMsg?.classList.add("hidden");

    detalle.forEach((item) => {
        const tr = document.createElement("tr");

        const nombreProducto =
            item.Nombre_Producto ??
            item.Producto ??
            item.nombreProducto ??
            item.nombre ??
            "Producto sin nombre";

        const cantidad =
            item.Cantidad ??
            item.cantidad ??
            0;

        const precioUnitario =
            item.Precio_Unitario ??
            item.precioUnitario ??
            item.precio ??
            0;

        const subtotal =
            item.Subtotal ??
            item.subtotal ??
            cantidad * precioUnitario;

        tr.innerHTML = `
            <td>${nombreProducto}</td>
            <td>${cantidad}</td>
            <td>$${parseFloat(precioUnitario).toFixed(2)}</td>
            <td>$${parseFloat(subtotal).toFixed(2)}</td>
        `;

        tbodyDetalle.appendChild(tr);
    });
}

function cerrarModalDetalleVenta() {
    document.getElementById("modalDetalleVenta").classList.add("hidden");
}

document.getElementById("cerrarModalDetalleVenta")?.addEventListener("click", cerrarModalDetalleVenta);
document.getElementById("cerrarModalDetalleVentaBtn")?.addEventListener("click", cerrarModalDetalleVenta);

// ─────────────────────────────────────────────
// MODAL DE MENSAJES
// ─────────────────────────────────────────────
function mostrarExito(mensaje = "Operación realizada correctamente.") {
    const modal = document.getElementById("modalExito");
    const titulo = document.getElementById("exitoTitulo");
    const p = document.getElementById("exitoMensaje");
    const btn = modal?.querySelector("button");

    if (titulo) titulo.textContent = "✅ Éxito";
    if (p) p.textContent = mensaje;
    if (btn) btn.style.background = "#28a745";
    if (modal) modal.classList.remove("hidden");
}

function mostrarAlerta(mensaje) {
    const modal = document.getElementById("modalExito");
    const titulo = document.getElementById("exitoTitulo");
    const p = document.getElementById("exitoMensaje");
    const btn = modal?.querySelector("button");

    if (titulo) titulo.textContent = "⚠️ Atención";
    if (p) p.textContent = mensaje;
    if (btn) btn.style.background = "#e67e22";
    if (modal) modal.classList.remove("hidden");
}

document.getElementById("cerrarExito")?.addEventListener("click", () => {
    document.getElementById("modalExito").classList.add("hidden");
});

// ─────────────────────────────────────────────
// CARGA INICIAL
// ─────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
    cargarVentas();
});