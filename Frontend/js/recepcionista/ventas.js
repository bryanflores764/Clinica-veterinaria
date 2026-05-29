const API_BASE = "http://localhost:3000";

const API_PRODUCTOS = `${API_BASE}/api/productos`;
const API_VENTAS = `${API_BASE}/api/ventas`;
const API_PROPIETARIOS = `${API_BASE}/api/propietarios`;

let productosDisponibles = [];
let propietariosDisponibles = [];

// ─────────────────────────────────────────────
// TOKEN Y HEADERS Y AUTENTICACIÓN
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

function verificarSesion() {
    const tokenActual = obtenerToken();

    if (!tokenActual || tokenActual === "null" || tokenActual === "undefined") {
        localStorage.removeItem("token");
        window.location.replace("../../index.html");
    }
}

verificarSesion();

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
// evento para boton anular venta
// ─────────────────────────────────────────────
let idVentaSeleccionadaParaAnular = null;

document.getElementById("tbodyVentas")?.addEventListener("click", (e) => {
    const btnAnular = e.target.closest(".btn-anular-venta");

    if (!btnAnular) return;

    const idVenta = btnAnular.dataset.id;
    const estado = btnAnular.dataset.estado?.toLowerCase();

    if (!idVenta) {
        mostrarAlerta("No se encontró el ID de la venta.");
        return;
    }

    if (estado === "anulada") {
        mostrarAlerta("Esta venta ya está anulada.");
        return;
    }

    abrirModalAnularVenta(idVenta);
});

function abrirModalAnularVenta(idVenta) {
    idVentaSeleccionadaParaAnular = idVenta;

    const mensaje = document.getElementById("anularVentaMensaje");

    if (mensaje) {
        mensaje.textContent = `¿Estás seguro de que deseas anular la venta #${idVenta}?`;
    }

    document.getElementById("modalAnularVenta")?.classList.remove("hidden");
}

function cerrarModalAnularVenta() {
    idVentaSeleccionadaParaAnular = null;

    document.getElementById("modalAnularVenta")?.classList.add("hidden");
}

document.getElementById("btnCancelarAnularVenta")?.addEventListener("click", cerrarModalAnularVenta);

document.getElementById("btnConfirmarAnularVenta")?.addEventListener("click", async () => {
    if (!idVentaSeleccionadaParaAnular) {
        mostrarAlerta("No se encontró la venta seleccionada.");
        return;
    }

    await anularVenta(idVentaSeleccionadaParaAnular);
});

// ─────────────────────────────────────────────
// EVENTO PARA BOTÓN FACTURA
// ─────────────────────────────────────────────
let idVentaSeleccionadaParaFactura = null;

document.getElementById("tbodyVentas")?.addEventListener("click", (e) => {
    const btnFactura = e.target.closest(".btn-factura-venta");

    if (!btnFactura) return;

    const idVenta = btnFactura.dataset.id;
    const estado = btnFactura.dataset.estado?.toLowerCase();

    if (!idVenta) {
        mostrarAlerta("No se encontró el ID de la venta.");
        return;
    }

    if (estado === "anulada") {
        mostrarAlerta("No se puede generar factura de una venta anulada.");
        return;
    }

    abrirModalFacturaVenta(idVenta);
});

// ─────────────────────────────────────────────
// anular venta
// ─────────────────────────────────────────────
async function anularVenta(idVenta) {
    const token = obtenerToken();

    if (!token) {
        mostrarAlerta("No hay sesión activa. Inicia sesión nuevamente.");
        return;
    }

    const btnConfirmar = document.getElementById("btnConfirmarAnularVenta");

    try {
        if (btnConfirmar) {
            btnConfirmar.disabled = true;
            btnConfirmar.textContent = "Anulando...";
        }

        const res = await fetch(`${API_VENTAS}/${idVenta}/anular`, {
            method: "PATCH",
            headers: obtenerHeadersAuth()
        });

        const json = await res.json();

        console.log("Respuesta anular venta:", json);

        if (!res.ok || json.success === false) {
            throw new Error(json.message || "No se pudo anular la venta.");
        }

        cerrarModalAnularVenta();

        mostrarExito(json.message || `Venta #${idVenta} anulada correctamente.`);

        await cargarVentas();

    } catch (error) {
        console.error("Error al anular venta:", error);

        cerrarModalAnularVenta();

        mostrarAlerta(error.message || "Ocurrió un error al anular la venta.");

    } finally {
        if (btnConfirmar) {
            btnConfirmar.disabled = false;
            btnConfirmar.textContent = "Sí, anular venta";
        }
    }
}

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
                            class="btn-factura-venta"
                            data-id="${idVenta}"
                            data-estado="${estado}"
                            ${estado?.toLowerCase() === "anulada" ? "disabled" : ""}
                        >
                            Factura
                        </button>

                        <button 
                            type="button" 
                            class="btn-anular-venta"
                            data-id="${idVenta}"
                            data-estado="${estado}"
                            ${estado?.toLowerCase() === "anulada" ? "disabled" : ""}
                        >
                            ${estado?.toLowerCase() === "anulada" ? "Anulada" : "Anular"}
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
// MODAL FACTURA DE VENTA
// ─────────────────────────────────────────────
async function abrirModalFacturaVenta(idVenta) {
    const token = obtenerToken();

    if (!token) {
        mostrarAlerta("No hay sesión activa. Inicia sesión nuevamente.");
        return;
    }

    if (!idVenta) {
        mostrarAlerta("No se encontró el ID de la venta.");
        return;
    }

    idVentaSeleccionadaParaFactura = idVenta;

    try {
        const res = await fetch(`${API_VENTAS}/${idVenta}`, {
            method: "GET",
            headers: obtenerHeadersAuth()
        });

        const json = await res.json();

        console.log("Respuesta venta para factura:", json);

        if (!res.ok || json.success === false) {
            throw new Error(json.message || "No se pudo obtener la información de la venta.");
        }

        const venta = json.data;

        pintarVistaPreviaFactura(venta);
        await consultarFacturaExistente(idVenta);

        document.getElementById("modalFacturaVenta")?.classList.remove("hidden");

    } catch (error) {
        console.error("Error al abrir factura:", error);
        mostrarAlerta(error.message || "Ocurrió un error al cargar la factura.");
    }
}

function pintarVistaPreviaFactura(venta) {
    const facturaFecha = document.getElementById("facturaFecha");
    const facturaCliente = document.getElementById("facturaCliente");
    const facturaEstadoVenta = document.getElementById("facturaEstadoVenta");
    const facturaTotal = document.getElementById("facturaTotal");

    const tbodyProductos = document.getElementById("tbodyFacturaProductos");
    const tbodyServicios = document.getElementById("tbodyFacturaServicios");

    const productosEmpty = document.getElementById("facturaProductosEmpty");
    const serviciosEmpty = document.getElementById("facturaServiciosEmpty");

    const facturaNumeroControl = document.getElementById("facturaNumeroControl");
    const facturaCodigoGeneracion = document.getElementById("facturaCodigoGeneracion");

    const btnGenerarFactura = document.getElementById("btnGenerarFactura");

    const fechaVenta =
        venta.Fecha_Venta ??
        venta.fecha_venta ??
        venta.fechaVenta ??
        venta.fecha;

    const cliente =
        venta.Propietario ??
        venta.Nombre_Propietario ??
        venta.Nombre ??
        venta.nombre ??
        "Sin cliente";

    const estado =
        venta.Estado ??
        venta.estado ??
        "activa";

    const total =
        venta.Total ??
        venta.total ??
        0;

    const productos =
        venta.detalle ??
        venta.Detalle ??
        venta.productos ??
        [];

    const servicios =
        venta.servicios ??
        venta.Servicios ??
        [];

    facturaFecha.textContent = formatearFecha(fechaVenta);
    facturaCliente.textContent = cliente;
    facturaEstadoVenta.textContent = estado;
    facturaTotal.textContent = `$${parseFloat(total ?? 0).toFixed(2)}`;

    facturaNumeroControl.textContent = "Sin generar";
    facturaCodigoGeneracion.textContent = "Factura pendiente de generación";

    if (btnGenerarFactura) {
        btnGenerarFactura.disabled = false;
        btnGenerarFactura.textContent = "Generar factura";
    }

    tbodyProductos.innerHTML = "";
    tbodyServicios.innerHTML = "";

    if (!Array.isArray(productos) || productos.length === 0) {
        productosEmpty?.classList.remove("hidden");
    } else {
        productosEmpty?.classList.add("hidden");

        productos.forEach((item) => {
            const tr = document.createElement("tr");

            const nombre =
                item.Nombre_Producto ??
                item.Producto ??
                item.nombreProducto ??
                item.nombre ??
                "Producto sin nombre";

            const cantidad =
                item.Cantidad ??
                item.cantidad ??
                0;

            const precio =
                item.Precio_Unitario ??
                item.precioUnitario ??
                item.precio ??
                0;

            const subtotal =
                item.Subtotal ??
                item.subtotal ??
                cantidad * precio;

            tr.innerHTML = `
                <td>${nombre}</td>
                <td>${cantidad}</td>
                <td>$${parseFloat(precio).toFixed(2)}</td>
                <td>$${parseFloat(subtotal).toFixed(2)}</td>
            `;

            tbodyProductos.appendChild(tr);
        });
    }

    if (!Array.isArray(servicios) || servicios.length === 0) {
        serviciosEmpty?.classList.remove("hidden");
    } else {
        serviciosEmpty?.classList.add("hidden");

        servicios.forEach((item) => {
            const tr = document.createElement("tr");

            const nombre =
                item.Nombre_Servicio ??
                item.Servicio ??
                item.nombreServicio ??
                item.nombre ??
                "Servicio sin nombre";

            const cantidad =
                item.Cantidad ??
                item.cantidad ??
                1;

            const precio =
                item.Precio_Unitario ??
                item.precioUnitario ??
                item.precio ??
                0;

            const subtotal =
                item.Subtotal ??
                item.subtotal ??
                cantidad * precio;

            tr.innerHTML = `
                <td>${nombre}</td>
                <td>${cantidad}</td>
                <td>$${parseFloat(precio).toFixed(2)}</td>
                <td>$${parseFloat(subtotal).toFixed(2)}</td>
            `;

            tbodyServicios.appendChild(tr);
        });
    }
}

async function consultarFacturaExistente(idVenta) {
    const btnGenerarFactura = document.getElementById("btnGenerarFactura");
    const facturaNumeroControl = document.getElementById("facturaNumeroControl");
    const facturaCodigoGeneracion = document.getElementById("facturaCodigoGeneracion");

    try {
        const res = await fetch(`${API_VENTAS}/${idVenta}/factura`, {
            method: "GET",
            headers: obtenerHeadersAuth()
        });

        const json = await res.json();

        console.log("Factura existente:", json);

        if (!res.ok || json.success === false) {
            return;
        }

        const factura = json.data;

        facturaNumeroControl.textContent =
            factura.NumeroControl ??
            factura.numeroControl ??
            "Factura generada";

        facturaCodigoGeneracion.textContent =
            factura.CodigoGeneracion ??
            factura.codigoGeneracion ??
            "Código no disponible";

        if (btnGenerarFactura) {
            btnGenerarFactura.disabled = true;
            btnGenerarFactura.textContent = "Factura generada";
        }

    } catch (error) {
        console.log("La venta aún no tiene factura generada.");
    }
}

function cerrarModalFacturaVenta() {
    idVentaSeleccionadaParaFactura = null;
    document.getElementById("modalFacturaVenta")?.classList.add("hidden");
}

document.getElementById("btnGenerarFactura")?.addEventListener("click", async () => {
    if (!idVentaSeleccionadaParaFactura) {
        mostrarAlerta("No se encontró la venta seleccionada.");
        return;
    }

    const btnGenerarFactura = document.getElementById("btnGenerarFactura");

    try {
        if (btnGenerarFactura) {
            btnGenerarFactura.disabled = true;
            btnGenerarFactura.textContent = "Generando...";
        }

        const res = await fetch(`${API_VENTAS}/${idVentaSeleccionadaParaFactura}/factura/generar`, {
            method: "POST",
            headers: obtenerHeadersAuth(),
            body: JSON.stringify({
                requiereFactura: true
            })
        });

        const json = await res.json();

        console.log("Respuesta generar factura:", json);

        if (!res.ok || json.success === false) {
            throw new Error(json.message || "No se pudo generar la factura.");
        }

        const data = json.data;

        document.getElementById("facturaNumeroControl").textContent =
            data.numeroControl ??
            data.NumeroControl ??
            "Factura generada";

        document.getElementById("facturaCodigoGeneracion").textContent =
            data.codigoGeneracion ??
            data.CodigoGeneracion ??
            "Código no disponible";

        if (btnGenerarFactura) {
            btnGenerarFactura.disabled = true;
            btnGenerarFactura.textContent = "Factura generada";
        }

        mostrarExito(json.message || "Factura generada correctamente.");

    } catch (error) {
        console.error("Error al generar factura:", error);

        if (btnGenerarFactura) {
            btnGenerarFactura.disabled = false;
            btnGenerarFactura.textContent = "Generar factura";
        }

        mostrarAlerta(error.message || "Ocurrió un error al generar la factura.");
    }
});
document.getElementById("cerrarModalFacturaVenta")?.addEventListener("click", cerrarModalFacturaVenta);

document.getElementById("cerrarModalFacturaVentaBtn")?.addEventListener("click", cerrarModalFacturaVenta);

// ─────────────────────────────────────────────
// CARGA INICIAL
// ─────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
    cargarVentas();
});