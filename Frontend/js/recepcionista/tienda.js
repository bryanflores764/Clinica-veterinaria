// ── Datos de ejemplo (hardcoded) ─────────────────────────────
const productosData = [
    {
        id: 1,
        nombre: "Amoxicilina 500mg",
        descripcion: "Antibiótico de amplio espectro para perros y gatos",
        categoria: "Medicamento",
        precioVenta: 45.00,
        stockInicial: 120
    },
    {
        id: 2,
        nombre: "Royal Canin Adulto 15kg",
        descripcion: "Alimento seco premium para perros adultos de todas las razas",
        categoria: "Alimento",
        precioVenta: 680.00,
        stockInicial: 30
    },
    {
        id: 3,
        nombre: "Collar antipulgas",
        descripcion: "Collar repelente de pulgas y garrapatas, duración 8 meses",
        categoria: "Accesorio",
        precioVenta: 95.00,
        stockInicial: 50
    },
    {
        id: 4,
        nombre: "Shampoo medicado",
        descripcion: "Shampoo dermatológico para piel sensible y dermatitis",
        categoria: "Higiene",
        precioVenta: 120.00,
        stockInicial: 8
    },
    {
        id: 5,
        nombre: "Frontline Plus",
        descripcion: "Antipulgas y garrapatas en pipeta mensual para perros",
        categoria: "Medicamento",
        precioVenta: 210.00,
        stockInicial: 45
    },
    {
        id: 6,
        nombre: "Whiskas Adulto 3kg",
        descripcion: "Alimento seco completo y balanceado para gatos adultos",
        categoria: "Alimento",
        precioVenta: 155.00,
        stockInicial: 60
    },
    {
        id: 7,
        nombre: "Cepillo dental canino",
        descripcion: "Kit de higiene dental con cepillo y pasta sabor pollo",
        categoria: "Higiene",
        precioVenta: 75.00,
        stockInicial: 25
    },
    {
        id: 8,
        nombre: "Comedero acero inox",
        descripcion: "Comedero antideslizante de acero inoxidable para mascotas",
        categoria: "Accesorio",
        precioVenta: 55.00,
        stockInicial: 40
    },
];

let productos = [...productosData];

// ── Render tabla ──────────────────────────────────────────────
function renderTabla() {
    const tbody = document.querySelector("#tablaProductos tbody");
    if (!tbody) return;

    if (productos.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center; padding:40px; color:#999; font-size:15px;">
                    No hay productos registrados.
                </td>
            </tr>`;
        return;
    }

    tbody.innerHTML = productos.map(p => `
        <tr>
            <td data-label="Nombre">${p.nombre}</td>
            <td class="td-descripcion" data-label="Descripción" title="${p.descripcion}">${p.descripcion}</td>
            <td data-label="Categoría">
                <span class="badge-categoria badge-cat-${p.categoria.toLowerCase()}">${p.categoria}</span>
            </td>
            <td class="td-precio" data-label="Precio">$${p.precioVenta.toFixed(2)}</td>
            <td data-label="Stock" class="${p.stockInicial <= 10 ? 'stock-bajo' : 'stock-normal'}">${p.stockInicial}</td>
            <td data-label="Acciones">
                <div class="acciones-container">
                    <button class="btn-tabla btn-editar-tabla" onclick="editarProducto(${p.id})">Editar</button>
                    <button class="btn-tabla btn-cancelar-tabla" onclick="eliminarProducto(${p.id})">Eliminar</button>
                </div>
            </td>
        </tr>
    `).join("");
}

// ── Modal añadir producto ─────────────────────────────────────
function abrirModalProducto() {
    document.getElementById("formProducto").reset();
    limpiarErrores();
    document.getElementById("modalProducto").classList.remove("hidden");
}

function cerrarModalProducto() {
    document.getElementById("modalProducto").classList.add("hidden");
}

document.getElementById("btnNuevaCita")?.addEventListener("click", (e) => {
    e.preventDefault();
    abrirModalProducto();
});

document.getElementById("cerrarModalProducto")?.addEventListener("click", cerrarModalProducto);
document.getElementById("cerrarModalProductoBtn")?.addEventListener("click", cerrarModalProducto);

// ── Validación de campos ──────────────────────────────────────
function limpiarErrores() {
    document.querySelectorAll(".field-error").forEach(el => el.classList.remove("field-error"));
    document.querySelectorAll(".field-error-msg").forEach(el => el.remove());
}

function marcarError(id, msg) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.add("field-error");
    const span = document.createElement("span");
    span.className = "field-error-msg";
    span.textContent = msg;
    el.parentNode.appendChild(span);
}

function validarFormulario() {
    limpiarErrores();
    let valido = true;

    const nombre      = document.getElementById("prodNombre")?.value.trim();
    const descripcion = document.getElementById("prodDescripcion")?.value.trim();
    const categoria   = document.getElementById("prodCategoria")?.value;
    const precio      = parseFloat(document.getElementById("prodPrecio")?.value);
    const stock       = parseInt(document.getElementById("prodStock")?.value, 10);

    if (!nombre) {
        marcarError("prodNombre", "El nombre es obligatorio.");
        valido = false;
    }

    if (!descripcion) {
        marcarError("prodDescripcion", "La descripción es obligatoria.");
        valido = false;
    }

    if (!categoria) {
        marcarError("prodCategoria", "Selecciona una categoría.");
        valido = false;
    }

    if (isNaN(precio) || precio <= 0) {
        marcarError("prodPrecio", "El precio debe ser un valor positivo mayor a 0.");
        valido = false;
    }

    if (isNaN(stock) || stock < 0) {
        marcarError("prodStock", "El stock debe ser un número positivo (mínimo 0).");
        valido = false;
    }

    return valido;
}

// ── Guardar nuevo producto ────────────────────────────────────
document.getElementById("formProducto")?.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!validarFormulario()) return;

    const nuevo = {
        id:           productos.length > 0 ? Math.max(...productos.map(p => p.id)) + 1 : 1,
        nombre:       document.getElementById("prodNombre").value.trim(),
        descripcion:  document.getElementById("prodDescripcion").value.trim(),
        categoria:    document.getElementById("prodCategoria").value,
        precioVenta:  parseFloat(document.getElementById("prodPrecio").value),
        stockInicial: parseInt(document.getElementById("prodStock").value, 10),
    };

    productos.push(nuevo);
    cerrarModalProducto();
    renderTabla();
    mostrarExito(`Producto "${nuevo.nombre}" agregado correctamente.`);
});

// ── Eliminar producto ─────────────────────────────────────────
function eliminarProducto(id) {
    const producto = productos.find(p => p.id === id);
    if (!producto) return;
    productos = productos.filter(p => p.id !== id);
    renderTabla();
    mostrarExito(`Producto "${producto.nombre}" eliminado.`);
}

// ── Editar producto (placeholder) ────────────────────────────
function editarProducto(id) {
    mostrarAlerta("La función de edición estará disponible próximamente.");
}

// ── Mensajes de éxito / error ─────────────────────────────────
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

// ── Inicializar tabla ─────────────────────────────────────────
renderTabla();
