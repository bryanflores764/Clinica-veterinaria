const API_BASE      = "http://localhost:3000";
const API_PRODUCTOS = `${API_BASE}/api/productos`;

let productosDisponibles = [];

// ── Utilidades ────────────────────────────────────────────────
function fechaHoy() {
    const hoy = new Date();
    return hoy.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function usuarioActual() {
    try {
        const raw = localStorage.getItem("usuario");
        if (!raw) return "Desconocido";
        const u = JSON.parse(raw);
        return u.Nombre_Usuario ?? "Desconocido";
    } catch {
        return "Desconocido";
    }
}

// ── Cargar productos disponibles (activos) ────────────────────
async function cargarProductosDisponibles() {
    try {
        const res  = await fetch(API_PRODUCTOS);
        const json = await res.json();
        const todos = Array.isArray(json) ? json : (json.data ?? []);
        productosDisponibles = todos.filter(p => p.Estado === "activo");
    } catch {
        productosDisponibles = [];
    }
}

// ── Modal nueva venta ─────────────────────────────────────────
async function abrirModalVenta() {
    document.getElementById("ventaFecha").textContent   = fechaHoy();
    document.getElementById("ventaUsuario").textContent = usuarioActual();
    document.getElementById("tbodyProductosVenta").innerHTML = "";
    actualizarTotal();
    await cargarProductosDisponibles();
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

// ── Filas de producto ─────────────────────────────────────────
function crearFilaProducto() {
    const tr = document.createElement("tr");

    const opcionesHTML = productosDisponibles.length
        ? productosDisponibles.map(p =>
            `<option value="${p.Id}" data-precio="${p.Precio}">${p.Nombre_Producto}</option>`
          ).join("")
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

    const select   = tr.querySelector(".select-producto");
    const inputCnt = tr.querySelector(".input-cantidad");
    const spanPrecio   = tr.querySelector(".venta-precio-unit");
    const spanSubtotal = tr.querySelector(".venta-subtotal");
    const btnEliminar  = tr.querySelector(".btn-eliminar-fila");

    function recalcularFila() {
        const opt    = select.options[select.selectedIndex];
        const precio = opt ? parseFloat(opt.dataset.precio) || 0 : 0;
        const cant   = parseInt(inputCnt.value) || 0;
        spanPrecio.textContent   = `$${precio.toFixed(2)}`;
        spanSubtotal.textContent = `$${(precio * cant).toFixed(2)}`;
        actualizarTotal();
    }

    select.addEventListener("change", recalcularFila);
    inputCnt.addEventListener("input", recalcularFila);
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

// ── Total ─────────────────────────────────────────────────────
function actualizarTotal() {
    const subtotales = [...document.querySelectorAll("#tbodyProductosVenta .venta-subtotal")];
    const total = subtotales.reduce((acc, el) => {
        return acc + parseFloat(el.textContent.replace("$", "")) || acc;
    }, 0);
    document.getElementById("ventaTotal").textContent = `$${total.toFixed(2)}`;
}

// ── Guardar venta ─────────────────────────────────────────────
document.getElementById("btnGuardarVenta")?.addEventListener("click", () => {
    const filas = [...document.querySelectorAll("#tbodyProductosVenta tr")];

    if (filas.length === 0) {
        mostrarAlerta("Agrega al menos un producto antes de registrar la venta.");
        return;
    }

    const items = filas.map(tr => {
        const select = tr.querySelector(".select-producto");
        const cant   = parseInt(tr.querySelector(".input-cantidad").value) || 0;
        const opt    = select.options[select.selectedIndex];
        return {
            idProducto: parseInt(select.value),
            nombre:     opt?.text ?? "",
            cantidad:   cant,
            precio:     parseFloat(opt?.dataset.precio) || 0,
        };
    });

    const sinSeleccionar = items.some(i => !i.idProducto);
    if (sinSeleccionar) {
        mostrarAlerta("Hay filas sin producto seleccionado. Completa o elimínalas.");
        return;
    }

    const cantidadInvalida = items.some(i => i.cantidad <= 0);
    if (cantidadInvalida) {
        mostrarAlerta("La cantidad de cada producto debe ser mayor a 0.");
        return;
    }

    // TODO: enviar al endpoint de ventas cuando esté disponible
    const total = parseFloat(document.getElementById("ventaTotal").textContent.replace("$", ""));
    console.log("Venta a registrar:", { fecha: fechaHoy(), usuario: usuarioActual(), items, total });

    cerrarModalVenta();
    mostrarExito(`Venta registrada correctamente. Total: $${total.toFixed(2)}`);
});

// ── Mensajes ──────────────────────────────────────────────────
function mostrarExito(mensaje = "Operación realizada correctamente.") {
    const modal  = document.getElementById("modalExito");
    const titulo = document.getElementById("exitoTitulo");
    const p      = document.getElementById("exitoMensaje");
    const btn    = modal?.querySelector("button");
    if (titulo) titulo.textContent = "✅ Éxito";
    if (p)      p.textContent      = mensaje;
    if (btn)    btn.style.background = "#28a745";
    if (modal)  modal.classList.remove("hidden");
}

function mostrarAlerta(mensaje) {
    const modal  = document.getElementById("modalExito");
    const titulo = document.getElementById("exitoTitulo");
    const p      = document.getElementById("exitoMensaje");
    const btn    = modal?.querySelector("button");
    if (titulo) titulo.textContent = "⚠️ Atención";
    if (p)      p.textContent      = mensaje;
    if (btn)    btn.style.background = "#e67e22";
    if (modal)  modal.classList.remove("hidden");
}

document.getElementById("cerrarExito")?.addEventListener("click", () => {
    document.getElementById("modalExito").classList.add("hidden");
});
