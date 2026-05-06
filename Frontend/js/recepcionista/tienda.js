const API_BASE       = "http://localhost:3000";
const API_PRODUCTOS  = `${API_BASE}/api/productos`;
const API_CATEGORIAS = `${API_BASE}/api/categorias`;

let todosLosProductos = [];

// ── Cargar categorías en el select del modal ──────────────────
async function cargarCategorias() {
    const select = document.getElementById("prodCategoria");
    if (!select) return;
    select.innerHTML = `<option value="">Cargando...</option>`;
    try {
        const res  = await fetch(API_CATEGORIAS);
        const json = await res.json();
        const cats = Array.isArray(json) ? json : (json.data ?? []);
        select.innerHTML = `<option value="">Seleccionar...</option>`;
        cats.forEach(c => {
            select.innerHTML += `<option value="${c.Id}">${c.Nombre_Categoria}</option>`;
        });
    } catch (err) {
        select.innerHTML = `<option value="">Error al cargar categorías</option>`;
        console.warn("No se pudieron cargar las categorías:", err.message);
    }
}

// ── Cargar productos desde la API ────────────────────────────
async function cargarProductos() {
    const tbody = document.querySelector("#tablaProductos tbody");
    if (!tbody) return;
    tbody.innerHTML = `
        <tr>
            <td colspan="6" style="text-align:center; padding:40px; color:#999; font-size:14px;">
                Cargando productos...
            </td>
        </tr>`;
    try {
        const res  = await fetch(API_PRODUCTOS);
        const json = await res.json();
        todosLosProductos = Array.isArray(json) ? json : (json.data ?? []);
        filtrarYRenderizar();
    } catch (err) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center; padding:40px; color:#e53e3e; font-size:14px;">
                    Error al cargar los productos. Verifica que el servidor esté activo.
                </td>
            </tr>`;
        console.error("Error al cargar productos:", err);
    }
}

// ── Filtrar y renderizar según el select ──────────────────────
function filtrarYRenderizar() {
    const filtro = document.getElementById("filtroEstado")?.value ?? "todos";
    let lista = todosLosProductos;
    if (filtro === "activo")   lista = todosLosProductos.filter(p => p.Estado === "activo");
    if (filtro === "inactivo") lista = todosLosProductos.filter(p => p.Estado === "inactivo");
    renderTabla(lista);
}

// ── Render tabla ──────────────────────────────────────────────
function renderTabla(productos) {
    const tbody = document.querySelector("#tablaProductos tbody");
    if (!tbody) return;

    if (!productos || productos.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center; padding:40px; color:#999; font-size:15px;">
                    No hay productos para mostrar.
                </td>
            </tr>`;
        return;
    }

    tbody.innerHTML = productos.map(p => {
        const catNombre  = p.Categoria ?? "Otro";
        const catClass   = "badge-cat-" + catNombre
            .toLowerCase()
            .normalize("NFD").replace(/[̀-ͯ]/g, "")
            .replace(/\s+/g, "-");
        const stockClass = parseInt(p.Stock) <= 10 ? "stock-bajo" : "stock-normal";
        const estado     = p.Estado ?? "activo";
        const nombre     = (p.Nombre_Producto ?? "").replace(/'/g, "\\'");

        return `
        <tr>
            <td data-label="Nombre">${p.Nombre_Producto}</td>
            <td data-label="Categoría">
                <span class="badge-categoria ${catClass}">${catNombre}</span>
            </td>
            <td class="td-precio" data-label="Precio">$${parseFloat(p.Precio).toFixed(2)}</td>
            <td data-label="Stock" class="${stockClass}">${p.Stock}</td>
            <td data-label="Estado">
                <span class="badge-estado badge-estado-${estado}">${estado === "activo" ? "Activo" : "Inactivo"}</span>
            </td>
            <td data-label="Acciones">
                <div class="acciones-container">
                    <button class="btn-tabla btn-editar-tabla" onclick="editarProducto(${p.Id})">Editar</button>
                    ${estado === "activo"
                        ? `<button class="btn-tabla btn-cancelar-tabla" onclick="toggleEstadoProducto(${p.Id}, '${nombre}', 'desactivar')">Desactivar</button>`
                        : `<button class="btn-tabla btn-activar-tabla"  onclick="toggleEstadoProducto(${p.Id}, '${nombre}', 'activar')">Activar</button>`
                    }
                </div>
            </td>
        </tr>`;
    }).join("");
}

// ── Modal añadir producto ─────────────────────────────────────
async function abrirModalProducto() {
    document.getElementById("formProducto").reset();
    limpiarErrores();
    await cargarCategorias();
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
document.getElementById("formProducto")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;

    const body = {
        idCategoria:     parseInt(document.getElementById("prodCategoria").value),
        nombre_producto: document.getElementById("prodNombre").value.trim(),
        descripcion:     document.getElementById("prodDescripcion").value.trim(),
        precio:          parseFloat(document.getElementById("prodPrecio").value),
        stock:           parseInt(document.getElementById("prodStock").value, 10),
    };

    try {
        const res  = await fetch(API_PRODUCTOS, {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify(body),
        });
        const json = await res.json();

        if (res.ok && json.success) {
            cerrarModalProducto();
            await cargarProductos();
            mostrarExito(`Producto "${body.nombre_producto}" creado correctamente.`);
        } else {
            mostrarAlerta(json.message ?? "No se pudo guardar el producto.");
        }
    } catch (err) {
        mostrarAlerta("Error de conexión. Verifica que el servidor esté activo.");
        console.error(err);
    }
});

// ── Modal de confirmación personalizado (Promise) ─────────────
function confirmar(mensaje, titulo = "Confirmar acción", btnClass = "btn-primary") {
    return new Promise((resolve) => {
        const modal      = document.getElementById("modalConfirmar");
        const btnAceptar = document.getElementById("confirmarAceptar");

        document.getElementById("confirmarTitulo").textContent  = titulo;
        document.getElementById("confirmarMensaje").textContent = mensaje;
        btnAceptar.className = btnClass;
        modal.classList.remove("hidden");

        function resolver(resultado) {
            modal.classList.add("hidden");
            btnAceptar.removeEventListener("click",  onAceptar);
            document.getElementById("confirmarCancelar").removeEventListener("click", onCancelar);
            document.getElementById("cerrarConfirmar").removeEventListener("click",   onCancelar);
            resolve(resultado);
        }

        function onAceptar()  { resolver(true);  }
        function onCancelar() { resolver(false); }

        btnAceptar.addEventListener("click",  onAceptar);
        document.getElementById("confirmarCancelar").addEventListener("click", onCancelar);
        document.getElementById("cerrarConfirmar").addEventListener("click",   onCancelar);
    });
}

// ── Activar / Desactivar producto ────────────────────────────
async function toggleEstadoProducto(id, nombre, accion) {
    const mensaje = accion === "activar"
        ? `¿Deseas activar el producto "${nombre}"?`
        : `¿Deseas desactivar el producto "${nombre}"?`;
    const titulo   = accion === "activar" ? "Activar producto" : "Desactivar producto";
    const btnClass = accion === "activar" ? "btn-success" : "btn-danger";

    const confirmado = await confirmar(mensaje, titulo, btnClass);
    if (!confirmado) return;

    try {
        const res  = await fetch(`${API_PRODUCTOS}/${id}/${accion}`, { method: "PATCH" });
        const json = await res.json();

        if (res.ok && json.success) {
            await cargarProductos();
            const msg = accion === "activar"
                ? `Producto "${nombre}" activado correctamente.`
                : `Producto "${nombre}" desactivado correctamente.`;
            mostrarExito(msg);
        } else {
            mostrarAlerta(json.message ?? `No se pudo ${accion} el producto.`);
        }
    } catch (err) {
        mostrarAlerta(`Error de conexión al intentar ${accion} el producto.`);
        console.error(err);
    }
}

// ── Editar producto (próximamente) ────────────────────────────
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

// ── Filtro de estado ──────────────────────────────────────────
document.getElementById("filtroEstado")?.addEventListener("change", filtrarYRenderizar);

// ── Inicializar ───────────────────────────────────────────────
cargarProductos();
