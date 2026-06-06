// ============================================================
//  Archivo: js/recepcionista/ventas.js
// ============================================================

const API_BASE        = "https://clinica-veterinaria-79jk.onrender.com";
const API_PRODUCTOS   = `${API_BASE}/api/productos`;
const API_VENTAS      = `${API_BASE}/api/ventas`;
const API_PROPIETARIOS = `${API_BASE}/api/propietarios`;

let productosDisponibles   = [];
let propietariosDisponibles = [];

// ─────────────────────────────────────────────
// TOKEN, HEADERS Y AUTENTICACIÓN
// ─────────────────────────────────────────────
function obtenerToken() {
    return localStorage.getItem("token");
}

function obtenerHeadersAuth() {
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${obtenerToken()}`
    };
}

function verificarSesion() {
    const token = obtenerToken();
    if (!token || token === "null" || token === "undefined") {
        localStorage.removeItem("token");
        window.location.replace("../../index.html");
    }
}

verificarSesion();

// ─────────────────────────────────────────────
// TOAST (reemplaza mostrarAlerta / mostrarExito)
// ─────────────────────────────────────────────
function mostrarToast(mensaje, tipo = "error") {
    document.querySelector(".vc-toast")?.remove();

    const config = {
        success: { color: "#2e7d6b", border: "#22c55e", icon: "✔" },
        error:   { color: "#c0392b", border: "#ef4444", icon: "✖" },
        warning: { color: "#b45309", border: "#f59e0b", icon: "⚠" },
    };

    const { color, border, icon } = config[tipo] ?? config.error;

    if (!document.getElementById("vc-toast-styles")) {
        const style = document.createElement("style");
        style.id = "vc-toast-styles";
        style.textContent = `
            .vc-toast {
                position: fixed; 
                top: 24px; 
                right: 24px; 
                z-index: 999999 !important;  /* ← Cambiado de 9999 a 999999 */
                display: flex; 
                align-items: flex-start; 
                gap: 12px;
                padding: 16px 20px; 
                border-radius: 12px; 
                border-left: 5px solid;
                background: #fff; 
                box-shadow: 0 8px 24px rgba(0,0,0,.12);
                max-width: 360px; 
                font-family: 'Baloo Da 2', sans-serif;
                animation: vcSlideIn .3s ease;
            }
            .vc-toast-icon { font-size: 20px; font-weight: 700; flex-shrink: 0; margin-top: 1px; }
            .vc-toast-body p { margin: 0; font-size: 14px; font-weight: 500; color: #1e293b; line-height: 1.5; }
            .vc-toast.saliendo { animation: vcSlideOut .3s ease forwards; }
            @keyframes vcSlideIn { from{opacity:0;transform:translateX(60px)} to{opacity:1;transform:translateX(0)} }
            @keyframes vcSlideOut { from{opacity:1;transform:translateX(0)} to{opacity:0;transform:translateX(60px)} }
        `;
        document.head.appendChild(style);
    }

    const toast = document.createElement("div");
    toast.className = "vc-toast";
    toast.style.borderColor = border;
    toast.innerHTML = `
        <span class="vc-toast-icon" style="color:${color}">${icon}</span>
        <div class="vc-toast-body"><p>${mensaje}</p></div>
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add("saliendo");
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// Aliases para compatibilidad con el resto del código
const mostrarExito  = (msg) => mostrarToast(msg, "success");
const mostrarAlerta = (msg) => mostrarToast(msg, "warning");

// ─────────────────────────────────────────────
// UTILIDADES
// ─────────────────────────────────────────────
function fechaHoy() {
    return new Date().toLocaleDateString("es-ES", {
        day: "2-digit", month: "2-digit", year: "numeric"
    });
}

function formatearFecha(fechaISO) {
    if (!fechaISO) return "—";
    return new Date(fechaISO).toLocaleDateString("es-ES", {
        day: "2-digit", month: "2-digit", year: "numeric"
    });
}

function usuarioActual() {
    try {
        const raw = localStorage.getItem("usuario");
        if (!raw) return "Desconocido";
        return JSON.parse(raw).Nombre_Usuario ?? "Desconocido";
    } catch { return "Desconocido"; }
}

function obtenerClaseEstado(estado) {
    const e = estado?.toLowerCase();
    if (e === "confirmada") return "estado-confirmada";
    if (e === "anulada")    return "estado-anulada";
    return "estado-activa";
}

function formatearMetodoPago(metodo) {
    const mapa = { efectivo: "💵 Efectivo", tarjeta: "💳 Tarjeta", transferencia: "🏦 Transferencia" };
    return mapa[metodo?.toLowerCase()] ?? metodo ?? "—";
}

// ─────────────────────────────────────────────
// CARGAR VENTAS EN TABLA
// ─────────────────────────────────────────────
async function cargarVentas() {
    const tbody = document.getElementById("tbodyVentas");
    const empty = document.getElementById("ventasEmpty");
    if (!tbody) return;

    try {
        const res  = await fetch(API_VENTAS, { headers: obtenerHeadersAuth() });
        const json = await res.json();

        if (!res.ok || json.success === false) {
            throw new Error(json.message || "No se pudieron obtener las ventas.");
        }

        const ventas = Array.isArray(json) ? json : json.data ?? [];
        tbody.innerHTML = "";

        if (ventas.length === 0) { empty?.classList.remove("hidden"); return; }
        empty?.classList.add("hidden");

        ventas.forEach((venta) => {
            const tr = document.createElement("tr");

            const idVenta    = venta.Id    ?? venta.id;
            const fechaVenta = venta.Fecha_Venta ?? venta.fecha_venta ?? venta.fecha;
            const propietario = venta.Propietario ?? venta.Nombre_Propietario ?? `Propietario #${venta.Id_Propietario ?? "N/A"}`;
            const totalVenta  = venta.Total ?? venta.total ?? 0;
            const estado      = venta.Estado ?? venta.estado ?? "activa";
            const metodo      = venta.Metodo_Pago ?? venta.metodo_pago ?? null;

            const fecha        = formatearFecha(fechaVenta);
            const total        = parseFloat(totalVenta).toFixed(2);
            const claseEstado  = obtenerClaseEstado(estado);
            const anulada      = estado?.toLowerCase() === "anulada";

            tr.innerHTML = `
                <td>${fecha}</td>
                <td>${propietario}</td>
                <td>$${total}</td>
                <td>
                    ${metodo
                        ? `<span class="venta-metodo">${formatearMetodoPago(metodo)}</span>`
                        : "—"
                    }
                </td>
                <td><span class="venta-estado ${claseEstado}">${estado}</span></td>
                <td>
                    <div class="ventas-actions">
                        <button type="button" class="btn-detalle-venta" data-id="${idVenta}">Detalle</button>
                        <button type="button" class="btn-factura-venta"
                            data-id="${idVenta}" data-estado="${estado}"
                            ${anulada ? "disabled" : ""}>Factura</button>
                        <button type="button" class="btn-anular-venta"
                            data-id="${idVenta}" data-estado="${estado}"
                            ${anulada ? "disabled" : ""}>
                            ${anulada ? "Anulada" : "Anular"}
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
// CARGAR PRODUCTOS Y PROPIETARIOS
// ─────────────────────────────────────────────
async function cargarProductosDisponibles() {
    try {
        const res  = await fetch(API_PRODUCTOS, { headers: obtenerHeadersAuth() });
        const json = await res.json();
        if (!res.ok || json.success === false) throw new Error(json.message);
        const todos = Array.isArray(json) ? json : json.data ?? [];
        productosDisponibles = todos.filter(p => p.Estado === "activo");
    } catch (error) {
        console.error("Error al cargar productos:", error);
        productosDisponibles = [];
    }
}

async function cargarPropietariosDisponibles() {
    const select = document.getElementById("selectPropietarioVenta");
    if (!select) return;

    try {
        const res  = await fetch(API_PROPIETARIOS, { headers: obtenerHeadersAuth() });
        const json = await res.json();
        if (!res.ok || json.success === false) throw new Error(json.message);
        propietariosDisponibles = Array.isArray(json) ? json : json.data ?? [];

        select.innerHTML = `<option value="">Seleccionar propietario...</option>`;
        propietariosDisponibles.forEach((p) => {
            const op = document.createElement("option");
            op.value       = p.Id ?? p.id;
            op.textContent = p.Nombre ?? p.nombre ?? `Propietario #${op.value}`;
            select.appendChild(op);
        });
    } catch (error) {
        console.error("Error al cargar propietarios:", error);
        select.innerHTML = `<option value="">No se pudieron cargar propietarios</option>`;
    }
}

// ─────────────────────────────────────────────
// MÉTODO DE PAGO — lógica de UI
// ─────────────────────────────────────────────
function inicializarMetodoPago() {
    const radios       = document.querySelectorAll('input[name="metodoPago"]');
    const filaMonto    = document.getElementById("filaMontoPago");
    const filaCambio   = document.getElementById("filaCambio");
    const inputMonto   = document.getElementById("inputMontoRecibido");

    function actualizarVisibilidad() {
        const esEfectivo = document.querySelector('input[name="metodoPago"]:checked')?.value === "efectivo";
        filaMonto?.classList.toggle("hidden", !esEfectivo);
        filaCambio?.classList.toggle("hidden", !esEfectivo);
        if (!esEfectivo) {
            if (inputMonto) inputMonto.value = "";
            const cambioEl = document.getElementById("ventaCambio");
            if (cambioEl) cambioEl.textContent = "$0.00";
        }
        actualizarCambio();
    }

    radios.forEach(r => r.addEventListener("change", actualizarVisibilidad));
    inputMonto?.addEventListener("input", actualizarCambio);

    // Estado inicial
    actualizarVisibilidad();
}

function actualizarCambio() {
    const metodo     = document.querySelector('input[name="metodoPago"]:checked')?.value;
    const totalEl    = document.getElementById("ventaTotal");
    const cambioEl   = document.getElementById("ventaCambio");
    const inputMonto = document.getElementById("inputMontoRecibido");

    if (!cambioEl) return;

    if (metodo !== "efectivo") {
        cambioEl.textContent = "$0.00";
        cambioEl.classList.remove("cambio-negativo");
        return;
    }

    const total  = parseFloat(totalEl?.textContent?.replace("$", "")) || 0;
    const monto  = parseFloat(inputMonto?.value) || 0;
    const cambio = monto - total;

    cambioEl.textContent = `$${Math.max(cambio, 0).toFixed(2)}`;
    cambioEl.classList.toggle("cambio-negativo", cambio < 0 && monto > 0);
}

// ─────────────────────────────────────────────
// MODAL NUEVA VENTA
// ─────────────────────────────────────────────
async function abrirModalVenta() {
    document.getElementById("ventaFecha").textContent   = fechaHoy();
    document.getElementById("ventaUsuario").textContent = usuarioActual();
    document.getElementById("tbodyProductosVenta").innerHTML = "";

    // Resetear pago
    const radios = document.querySelectorAll('input[name="metodoPago"]');
    radios.forEach(r => { r.checked = r.value === "efectivo"; });

    const inputMonto = document.getElementById("inputMontoRecibido");
    if (inputMonto) inputMonto.value = "";

    const cambioEl = document.getElementById("ventaCambio");
    if (cambioEl) cambioEl.textContent = "$0.00";

    document.getElementById("filaMontoPago")?.classList.remove("hidden");
    document.getElementById("filaCambio")?.classList.remove("hidden");

    actualizarTotal();

    await cargarProductosDisponibles();
    await cargarPropietariosDisponibles();

    inicializarMetodoPago();

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
        ? productosDisponibles.map((p) => {
            const id     = p.Id ?? p.id;
            const nombre = p.Nombre_Producto ?? p.nombre ?? p.Nombre ?? "Sin nombre";
            const precio = p.Precio ?? p.precio ?? 0;
            return `<option value="${id}" data-precio="${precio}">${nombre}</option>`;
        }).join("")
        : `<option value="">Sin productos disponibles</option>`;

    tr.innerHTML = `
        <td>
            <select class="select-producto">
                <option value="">Seleccionar...</option>
                ${opcionesHTML}
            </select>
        </td>
        <td><input type="number" class="input-cantidad" value="1" min="1"></td>
        <td><span class="venta-precio-unit">$0.00</span></td>
        <td><span class="venta-subtotal">$0.00</span></td>
        <td><button type="button" class="btn-eliminar-fila" title="Eliminar">✕</button></td>
    `;

    const select       = tr.querySelector(".select-producto");
    const inputCantidad = tr.querySelector(".input-cantidad");
    const spanPrecio   = tr.querySelector(".venta-precio-unit");
    const spanSubtotal = tr.querySelector(".venta-subtotal");

    function recalcularFila() {
        const option   = select.options[select.selectedIndex];
        const precio   = parseFloat(option?.dataset.precio) || 0;
        const cantidad = parseInt(inputCantidad.value) || 0;
        spanPrecio.textContent   = `$${precio.toFixed(2)}`;
        spanSubtotal.textContent = `$${(precio * cantidad).toFixed(2)}`;
        actualizarTotal();
        actualizarCambio();
    }

    select.addEventListener("change", recalcularFila);
    inputCantidad.addEventListener("input", () => {
        if (parseInt(inputCantidad.value) < 1) inputCantidad.value = 1;
        recalcularFila();
    });
    tr.querySelector(".btn-eliminar-fila").addEventListener("click", () => {
        tr.remove();
        actualizarTotal();
        actualizarCambio();
    });

    return tr;
}

document.getElementById("btnAgregarProducto")?.addEventListener("click", () => {
    document.getElementById("tbodyProductosVenta").appendChild(crearFilaProducto());
    actualizarTotal();
});

// ─────────────────────────────────────────────
// TOTAL
// ─────────────────────────────────────────────
function actualizarTotal() {
    const total = [...document.querySelectorAll("#tbodyProductosVenta .venta-subtotal")]
        .reduce((acc, el) => acc + (parseFloat(el.textContent.replace("$", "")) || 0), 0);

    const ventaTotalEl = document.getElementById("ventaTotal");
    if (ventaTotalEl) ventaTotalEl.textContent = `$${total.toFixed(2)}`;

    actualizarCambio();
}

// ─────────────────────────────────────────────
// OBTENER ITEMS DE LA VENTA
// ─────────────────────────────────────────────
function obtenerItemsVenta() {
    return [...document.querySelectorAll("#tbodyProductosVenta tr")].map((tr) => {
        const select   = tr.querySelector(".select-producto");
        const input    = tr.querySelector(".input-cantidad");
        const option   = select.options[select.selectedIndex];
        return {
            idProducto: parseInt(select.value),
            nombre:     option?.textContent.trim() ?? "",
            cantidad:   parseInt(input.value) || 0,
            precio:     parseFloat(option?.dataset.precio) || 0
        };
    });
}

// ─────────────────────────────────────────────
// GUARDAR Y CONFIRMAR VENTA
// ─────────────────────────────────────────────
document.getElementById("btnGuardarVenta")?.addEventListener("click", async () => {
    const selectPropietario = document.getElementById("selectPropietarioVenta");
    const filas = [...document.querySelectorAll("#tbodyProductosVenta tr")];

    if (!selectPropietario?.value) {
        mostrarAlerta("Selecciona un propietario para registrar la venta.");
        return;
    }

    if (filas.length === 0) {
        mostrarAlerta("Agrega al menos un producto antes de registrar la venta.");
        return;
    }

    const items = obtenerItemsVenta();

    if (items.some(i => !i.idProducto)) {
        mostrarAlerta("Hay filas sin producto seleccionado. Completa o elimínalas.");
        return;
    }

    if (items.some(i => i.cantidad <= 0)) {
        mostrarAlerta("La cantidad de cada producto debe ser mayor a 0.");
        return;
    }

    // ── Validar pago ────────────────────────────────────────
    const metodoPago = document.querySelector('input[name="metodoPago"]:checked')?.value;
    if (!metodoPago) {
        mostrarAlerta("Selecciona un método de pago.");
        return;
    }

    let montoRecibido = null;

    if (metodoPago === "efectivo") {
        const inputMonto = document.getElementById("inputMontoRecibido");
        montoRecibido = parseFloat(inputMonto?.value);

        if (!montoRecibido || montoRecibido <= 0) {
            mostrarAlerta("Ingresa el monto recibido del cliente.");
            return;
        }

        const total = parseFloat(
            document.getElementById("ventaTotal")?.textContent?.replace("$", "")
        ) || 0;

        if (montoRecibido < total) {
            mostrarAlerta(`El monto recibido ($${montoRecibido.toFixed(2)}) es menor al total ($${total.toFixed(2)}).`);
            return;
        }
    }

    const btnGuardar = document.getElementById("btnGuardarVenta");
    btnGuardar.disabled    = true;
    btnGuardar.textContent = "Registrando...";

    try {
        const idPropietario = parseInt(selectPropietario.value);

        // 1. Crear cabecera de venta
        const resVenta = await fetch(API_VENTAS, {
            method:  "POST",
            headers: obtenerHeadersAuth(),
            body:    JSON.stringify({ idPropietario })
        });
        const jsonVenta = await resVenta.json();
        if (!resVenta.ok || jsonVenta.success === false) {
            throw new Error(jsonVenta.message || "No se pudo crear la venta.");
        }

        const idVenta = jsonVenta.data?.id ?? jsonVenta.data?.Id;
        if (!idVenta) throw new Error("La API no devolvió el ID de la venta creada.");

        // 2. Agregar productos al detalle
        for (const item of items) {
            const resDetalle = await fetch(`${API_VENTAS}/${idVenta}/detalle`, {
                method:  "POST",
                headers: obtenerHeadersAuth(),
                body:    JSON.stringify({ idProducto: item.idProducto, cantidad: item.cantidad })
            });
            const jsonDetalle = await resDetalle.json();
            if (!resDetalle.ok || jsonDetalle.success === false) {
                throw new Error(jsonDetalle.message || "No se pudo agregar un producto al detalle.");
            }
        }

        // 3. Confirmar venta con datos de pago
        const payloadConfirmar = { metodoPago };
        if (metodoPago === "efectivo") payloadConfirmar.montoRecibido = montoRecibido;

        const resConfirmar = await fetch(`${API_VENTAS}/${idVenta}/confirmar`, {
            method:  "PATCH",
            headers: obtenerHeadersAuth(),
            body:    JSON.stringify(payloadConfirmar)
        });
        const jsonConfirmar = await resConfirmar.json();
        if (!resConfirmar.ok || jsonConfirmar.success === false) {
            throw new Error(jsonConfirmar.message || "No se pudo confirmar la venta.");
        }

        // 4. Mostrar resumen del cambio si es efectivo
        const cambio = jsonConfirmar.data?.cambio ?? 0;
        const msgExito = metodoPago === "efectivo"
            ? `Venta registrada correctamente. Cambio a entregar: $${parseFloat(cambio).toFixed(2)}`
            : "Venta registrada y confirmada correctamente.";

        cerrarModalVenta();
        mostrarExito(msgExito);
        await cargarVentas();

    } catch (error) {
        console.error("Error al registrar venta:", error);
        mostrarAlerta(error.message || "Ocurrió un error al registrar la venta.");
    } finally {
        btnGuardar.disabled    = false;
        btnGuardar.textContent = "✓ Registrar venta";
    }
});

// ─────────────────────────────────────────────
// DETALLE DE VENTA
// ─────────────────────────────────────────────
async function abrirDetalleVenta(idVenta) {
    if (!idVenta) { mostrarAlerta("No se encontró el ID de la venta."); return; }

    try {
        const res  = await fetch(`${API_VENTAS}/${idVenta}`, { headers: obtenerHeadersAuth() });
        const json = await res.json();
        if (!res.ok || json.success === false) throw new Error(json.message);
        pintarDetalleVenta(json.data);
        document.getElementById("modalDetalleVenta").classList.remove("hidden");
    } catch (error) {
        console.error("Error al obtener detalle:", error);
        mostrarAlerta(error.message || "Ocurrió un error al obtener el detalle.");
    }
}

function pintarDetalleVenta(venta) {
    document.getElementById("detalleFecha").textContent       = formatearFecha(venta.Fecha_Venta ?? venta.fecha_venta);
    document.getElementById("detallePropietario").textContent = venta.Propietario ?? venta.Nombre_Propietario ?? "Sin propietario";
    document.getElementById("detalleEstado").textContent      = venta.Estado ?? venta.estado ?? "activa";
    document.getElementById("detalleTotal").textContent       = `$${parseFloat(venta.Total ?? venta.total ?? 0).toFixed(2)}`;

    // ── Datos de pago ──────────────────────────────────────
    const resumen      = document.getElementById("detallePagoResumen");
    const metodoPago   = venta.Metodo_Pago   ?? venta.metodo_pago   ?? null;
    const montoRecibido = venta.Monto_Recibido ?? venta.monto_recibido ?? null;
    const cambio       = venta.Cambio         ?? venta.cambio         ?? null;

    if (resumen) {
        if (metodoPago) {
            resumen.classList.remove("hidden");
            document.getElementById("detalleMetodoPago").textContent    = formatearMetodoPago(metodoPago);
            document.getElementById("detalleMontoRecibido").textContent = montoRecibido != null ? `$${parseFloat(montoRecibido).toFixed(2)}` : "—";
            document.getElementById("detalleCambio").textContent        = cambio != null ? `$${parseFloat(cambio).toFixed(2)}` : "—";
        } else {
            resumen.classList.add("hidden");
        }
    }

    // ── Productos ──────────────────────────────────────────
    const tbody         = document.getElementById("tbodyDetalleVenta");
    const detalleEmpty  = document.getElementById("detalleEmptyMsg");
    const detalle       = venta.detalle ?? venta.Detalle ?? venta.productos ?? [];

    tbody.innerHTML = "";

    if (!Array.isArray(detalle) || detalle.length === 0) {
        detalleEmpty?.classList.remove("hidden");
        return;
    }

    detalleEmpty?.classList.add("hidden");

    detalle.forEach((item) => {
        const cantidad      = item.Cantidad ?? item.cantidad ?? 0;
        const precioUnit    = item.Precio_Unitario ?? item.precio ?? 0;
        const subtotal      = item.Subtotal ?? item.subtotal ?? cantidad * precioUnit;
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${item.Nombre_Producto ?? item.nombre ?? "Sin nombre"}</td>
            <td>${cantidad}</td>
            <td>$${parseFloat(precioUnit).toFixed(2)}</td>
            <td>$${parseFloat(subtotal).toFixed(2)}</td>
        `;
        tbody.appendChild(tr);
    });
}

function cerrarModalDetalleVenta() {
    document.getElementById("modalDetalleVenta").classList.add("hidden");
}

document.getElementById("cerrarModalDetalleVenta")?.addEventListener("click", cerrarModalDetalleVenta);
document.getElementById("cerrarModalDetalleVentaBtn")?.addEventListener("click", cerrarModalDetalleVenta);

// ─────────────────────────────────────────────
// ANULAR VENTA
// ─────────────────────────────────────────────
let idVentaSeleccionadaParaAnular = null;

document.getElementById("tbodyVentas")?.addEventListener("click", (e) => {
    const btnDetalle = e.target.closest(".btn-detalle-venta");
    if (btnDetalle) { abrirDetalleVenta(btnDetalle.dataset.id); return; }

    const btnAnular = e.target.closest(".btn-anular-venta");
    if (!btnAnular) return;

    const { id, estado } = btnAnular.dataset;
    if (!id) { mostrarAlerta("No se encontró el ID de la venta."); return; }
    if (estado?.toLowerCase() === "anulada") { mostrarAlerta("Esta venta ya está anulada."); return; }
    abrirModalAnularVenta(id);
});

document.getElementById("tbodyVentas")?.addEventListener("click", (e) => {
    const btnFactura = e.target.closest(".btn-factura-venta");
    if (!btnFactura) return;
    const { id, estado } = btnFactura.dataset;
    if (!id) { mostrarAlerta("No se encontró el ID de la venta."); return; }
    if (estado?.toLowerCase() === "anulada") { mostrarAlerta("No se puede generar factura de una venta anulada."); return; }
    abrirModalFacturaVenta(id);
});

function abrirModalAnularVenta(idVenta) {
    idVentaSeleccionadaParaAnular = idVenta;
    const msg = document.getElementById("anularVentaMensaje");
    if (msg) msg.textContent = `¿Estás seguro de que deseas anular la venta #${idVenta}?`;
    document.getElementById("modalAnularVenta")?.classList.remove("hidden");
}

function cerrarModalAnularVenta() {
    idVentaSeleccionadaParaAnular = null;
    document.getElementById("modalAnularVenta")?.classList.add("hidden");
}

document.getElementById("btnCancelarAnularVenta")?.addEventListener("click", cerrarModalAnularVenta);

document.getElementById("btnConfirmarAnularVenta")?.addEventListener("click", async () => {
    if (!idVentaSeleccionadaParaAnular) { mostrarAlerta("No se encontró la venta seleccionada."); return; }

    const btn = document.getElementById("btnConfirmarAnularVenta");

    try {
        btn.disabled    = true;
        btn.textContent = "Anulando...";

        const res  = await fetch(`${API_VENTAS}/${idVentaSeleccionadaParaAnular}/anular`, {
            method: "PATCH", headers: obtenerHeadersAuth()
        });
        const json = await res.json();
        if (!res.ok || json.success === false) throw new Error(json.message || "No se pudo anular la venta.");

        cerrarModalAnularVenta();
        mostrarExito(json.message || `Venta #${idVentaSeleccionadaParaAnular} anulada correctamente.`);
        await cargarVentas();

    } catch (error) {
        console.error("Error al anular:", error);
        cerrarModalAnularVenta();
        mostrarAlerta(error.message || "Ocurrió un error al anular la venta.");
    } finally {
        btn.disabled    = false;
        btn.textContent = "Sí, anular venta";
    }
});

// ─────────────────────────────────────────────
// FACTURA
// ─────────────────────────────────────────────
let idVentaSeleccionadaParaFactura        = null;
let correoDestinoFacturaSeleccionada      = null;

async function abrirModalFacturaVenta(idVenta) {
    if (!idVenta) { mostrarAlerta("No se encontró el ID de la venta."); return; }
    idVentaSeleccionadaParaFactura = idVenta;

    try {
        const res  = await fetch(`${API_VENTAS}/${idVenta}`, { headers: obtenerHeadersAuth() });
        const json = await res.json();
        if (!res.ok || json.success === false) throw new Error(json.message);
        pintarVistaPreviaFactura(json.data);
        await consultarFacturaExistente(idVenta);
        document.getElementById("modalFacturaVenta")?.classList.remove("hidden");
    } catch (error) {
        console.error("Error al abrir factura:", error);
        mostrarAlerta(error.message || "Ocurrió un error al cargar la factura.");
    }
}

function pintarVistaPreviaFactura(venta) {
    document.getElementById("facturaFecha").textContent       = formatearFecha(venta.Fecha_Venta ?? venta.fecha_venta);
    document.getElementById("facturaCliente").textContent     = venta.Propietario ?? venta.Nombre_Propietario ?? "Sin cliente";
    document.getElementById("facturaEstadoVenta").textContent = venta.Estado ?? venta.estado ?? "activa";
    document.getElementById("facturaTotal").textContent       = `$${parseFloat(venta.Total ?? venta.total ?? 0).toFixed(2)}`;
    document.getElementById("facturaNumeroControl").textContent    = "Sin generar";
    document.getElementById("facturaCodigoGeneracion").textContent = "Factura pendiente de generación";

    correoDestinoFacturaSeleccionada = null;

    const btnGenerar = document.getElementById("btnGenerarFactura");
    const btnEnviar  = document.getElementById("btnEnviarFacturaVisual");
    if (btnGenerar) { btnGenerar.disabled = false; btnGenerar.textContent = "Generar factura"; }
    if (btnEnviar)  { btnEnviar.disabled  = true;  btnEnviar.textContent  = "Enviar factura"; }

    // ── Productos y servicios ──────────────────────────────
    const productos = venta.detalle   ?? venta.Detalle   ?? venta.productos ?? [];
    const servicios = venta.servicios ?? venta.Servicios ?? [];

    const tbodyP = document.getElementById("tbodyFacturaProductos");
    const tbodyS = document.getElementById("tbodyFacturaServicios");
    tbodyP.innerHTML = "";
    tbodyS.innerHTML = "";

    const renderItems = (items, tbody, emptyId) => {
        if (!Array.isArray(items) || items.length === 0) {
            document.getElementById(emptyId)?.classList.remove("hidden");
            return;
        }
        document.getElementById(emptyId)?.classList.add("hidden");
        items.forEach((item) => {
            const cantidad = item.Cantidad        ?? item.cantidad ?? 0;
            const precio   = item.Precio_Unitario ?? item.precio   ?? 0;
            const subtotal = item.Subtotal        ?? item.subtotal ?? cantidad * precio;
            const nombre   = item.Nombre_Producto ?? item.Nombre_Servicio ?? item.nombre ?? "Sin nombre";
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${nombre}</td>
                <td>${cantidad}</td>
                <td>$${parseFloat(precio).toFixed(2)}</td>
                <td>$${parseFloat(subtotal).toFixed(2)}</td>
            `;
            tbody.appendChild(tr);
        });
    };

    renderItems(productos, tbodyP, "facturaProductosEmpty");
    renderItems(servicios, tbodyS, "facturaServiciosEmpty");

    // ── Resumen de pago ────────────────────────────────────
    const pagoResumen   = document.getElementById("facturaPagoResumen");
    const metodoPago    = venta.Metodo_Pago    ?? venta.metodo_pago    ?? null;
    const montoRecibido = venta.Monto_Recibido ?? venta.monto_recibido ?? null;
    const cambio        = venta.Cambio         ?? venta.cambio         ?? null;

    if (pagoResumen) {
        if (metodoPago) {
            pagoResumen.classList.remove("hidden");
            document.getElementById("facturaPagoMetodo").textContent = formatearMetodoPago(metodoPago);

            const esEfectivo        = metodoPago.toLowerCase() === "efectivo";
            const filaMontoRecibido = document.getElementById("facturaFilaMontoRecibido");
            const filaCambio        = document.getElementById("facturaFilaCambio");

            if (filaMontoRecibido) {
                filaMontoRecibido.classList.toggle("hidden", !esEfectivo);
                document.getElementById("facturaPagoMonto").textContent =
                    montoRecibido != null ? `$${parseFloat(montoRecibido).toFixed(2)}` : "—";
            }
            if (filaCambio) {
                filaCambio.classList.toggle("hidden", !esEfectivo);
                document.getElementById("facturaPagoCambio").textContent =
                    cambio != null ? `$${parseFloat(cambio).toFixed(2)}` : "—";
            }
        } else {
            pagoResumen.classList.add("hidden");
        }
    }
}

async function consultarFacturaExistente(idVenta) {
    const btnGenerar = document.getElementById("btnGenerarFactura");
    const btnEnviar  = document.getElementById("btnEnviarFacturaVisual");

    try {
        const res  = await fetch(`${API_VENTAS}/${idVenta}/factura`, { headers: obtenerHeadersAuth() });
        const json = await res.json();
        if (!res.ok || json.success === false) return;

        const factura = json.data;
        correoDestinoFacturaSeleccionada = factura.CorreoDestino ?? factura.correoDestino ?? null;

        document.getElementById("facturaNumeroControl").textContent    = factura.NumeroControl    ?? "Factura generada";
        document.getElementById("facturaCodigoGeneracion").textContent = factura.CodigoGeneracion ?? "—";

        if (btnGenerar) { btnGenerar.disabled = true; btnGenerar.textContent = "Factura generada"; }
        if (btnEnviar) {
            btnEnviar.disabled = false;
            const envio = (factura.EstadoEnvio ?? factura.estadoEnvio ?? "").toLowerCase();
            btnEnviar.textContent = envio === "enviado" ? "Reenviar factura" : "Enviar factura";
        }
    } catch { /* la venta aún no tiene factura */ }
}

function cerrarModalFacturaVenta() {
    idVentaSeleccionadaParaFactura = null;
    document.getElementById("modalFacturaVenta")?.classList.add("hidden");
}

document.getElementById("cerrarModalFacturaVenta")?.addEventListener("click", cerrarModalFacturaVenta);
document.getElementById("cerrarModalFacturaVentaBtn")?.addEventListener("click", cerrarModalFacturaVenta);

document.getElementById("btnGenerarFactura")?.addEventListener("click", async () => {
    if (!idVentaSeleccionadaParaFactura) { mostrarAlerta("No se encontró la venta seleccionada."); return; }

    const btn = document.getElementById("btnGenerarFactura");
    btn.disabled    = true;
    btn.textContent = "Generando...";

    try {
        const res  = await fetch(`${API_VENTAS}/${idVentaSeleccionadaParaFactura}/factura/generar`, {
            method:  "POST",
            headers: obtenerHeadersAuth(),
            body:    JSON.stringify({ requiereFactura: true })
        });
        const json = await res.json();
        if (!res.ok || json.success === false) throw new Error(json.message || "No se pudo generar la factura.");

        document.getElementById("facturaNumeroControl").textContent    = json.data?.numeroControl    ?? "Factura generada";
        document.getElementById("facturaCodigoGeneracion").textContent = json.data?.codigoGeneracion ?? "—";

        btn.textContent = "Factura generada";
        mostrarExito(json.message || "Factura generada correctamente.");
        await consultarFacturaExistente(idVentaSeleccionadaParaFactura);

    } catch (error) {
        console.error("Error al generar factura:", error);
        btn.disabled    = false;
        btn.textContent = "Generar factura";
        mostrarAlerta(error.message || "Ocurrió un error al generar la factura.");
    }
});

// ── Enviar factura ────────────────────────────────────────────
function abrirModalEnviarFactura() {
    if (!idVentaSeleccionadaParaFactura) { mostrarAlerta("No se encontró la venta seleccionada."); return; }
    if (!correoDestinoFacturaSeleccionada) { mostrarAlerta("No hay correo destino para enviar la factura."); return; }

    const correoEl = document.getElementById("correoDestinoFactura");
    const mensajeEl = document.getElementById("enviarFacturaMensaje");
    if (correoEl)  correoEl.textContent  = correoDestinoFacturaSeleccionada;
    if (mensajeEl) mensajeEl.textContent = "Se enviará la factura al siguiente correo:";

    document.getElementById("modalEnviarFactura")?.classList.remove("hidden");
}

function cerrarModalEnviarFactura() {
    document.getElementById("modalEnviarFactura")?.classList.add("hidden");
}

async function enviarFacturaCorreo() {
    if (!idVentaSeleccionadaParaFactura) { mostrarAlerta("No se encontró la venta."); return; }

    const btnConfirmar = document.getElementById("btnConfirmarEnvioFactura");
    const btnEnviar    = document.getElementById("btnEnviarFacturaVisual");

    try {
        btnConfirmar.disabled    = true;
        btnConfirmar.textContent = "Enviando...";
        if (btnEnviar) { btnEnviar.disabled = true; btnEnviar.textContent = "Enviando..."; }

        const res  = await fetch(`${API_VENTAS}/${idVentaSeleccionadaParaFactura}/factura/enviar`, {
            method: "POST", headers: obtenerHeadersAuth(), body: JSON.stringify({})
        });
        const json = await res.json();
        if (!res.ok || json.success === false) throw new Error(json.message || "No se pudo enviar la factura.");

        cerrarModalEnviarFactura();
        if (btnEnviar) { btnEnviar.disabled = false; btnEnviar.textContent = "Reenviar factura"; }
        mostrarExito(json.message || "Factura enviada correctamente.");
        await consultarFacturaExistente(idVentaSeleccionadaParaFactura);

    } catch (error) {
        console.error("Error al enviar factura:", error);
        cerrarModalEnviarFactura();
        if (btnEnviar) { btnEnviar.disabled = false; btnEnviar.textContent = "Enviar factura"; }
        mostrarAlerta(error.message || "Ocurrió un error al enviar la factura.");
    } finally {
        btnConfirmar.disabled    = false;
        btnConfirmar.textContent = "Sí, enviar factura";
    }
}

document.getElementById("btnEnviarFacturaVisual")?.addEventListener("click", abrirModalEnviarFactura);
document.getElementById("btnCancelarEnvioFactura")?.addEventListener("click", cerrarModalEnviarFactura);
document.getElementById("btnConfirmarEnvioFactura")?.addEventListener("click", enviarFacturaCorreo);

// ─────────────────────────────────────────────
// CARGA INICIAL
// ─────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
    cargarVentas();
});