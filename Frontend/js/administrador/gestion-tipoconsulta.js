// =========================
// GESTIÓN DE TIPOS DE CONSULTA - VetCare
// =========================

const API_URL = window.API_URL;
const API_BASE_URL = `${API_URL}/api/tipoconsulta`; 

// Elementos DOM
const tablaBody = document.getElementById('tabla-body');
const modal = document.getElementById('modalTipoConsulta');
const modalEliminar = document.getElementById('modalEliminar');
const form = document.getElementById('formTipoConsulta');
const modalTitulo = document.getElementById('modalTitulo');
const tipoIdInput = document.getElementById('tipoId');
const tipoNombreInput = document.getElementById('tipoNombre');
const tipoDescripcionInput = document.getElementById('tipoDescripcion');
const tipoPrecioInput = document.getElementById('tipoPrecio');
const btnAbrirCrear = document.getElementById('btnAbrirCrear');
const btnCancelarModal = document.getElementById('btnCancelarModal');
const btnCancelarEliminar = document.getElementById('btnCancelarEliminar');
const btnConfirmarEliminar = document.getElementById('btnConfirmarEliminar');
const eliminarNombreSpan = document.getElementById('eliminarNombre');

let currentDeleteId = null;

// =========================
// FUNCIONES DE API
// =========================

async function fetchTiposConsulta() {
    try {
        const response = await fetch(API_BASE_URL);
        const result = await response.json();
        
        if (result.success && Array.isArray(result.data)) {
            renderTabla(result.data);
        } else {
            mostrarError('Error al cargar los datos');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarError('No se pudo conectar con el servidor');
    }
}

async function crearTipoConsulta(tipo, descripcion, precio) {
    const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo, descripcion, precio })
    });
    return await response.json();
}

async function actualizarTipoConsulta(id, tipo, descripcion, precio) {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo, descripcion, precio })
    });
    return await response.json();
}

async function eliminarTipoConsulta(id) {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE'
    });
    return await response.json();
}

// =========================
// RENDERIZADO DE TABLA
// =========================

function renderTabla(tipos) {
    if (!tipos || tipos.length === 0) {
        tablaBody.innerHTML = '<tr class="fila-vacia"><td colspan="5">📋 No hay tipos de consulta registrados</td></tr>';
        return;
    }
    
    tablaBody.innerHTML = tipos.map(tipo => `
        <tr>
            <td>${tipo.Id}</td>
            <td><strong>${escapeHtml(tipo.Tipo_Consulta)}</strong></td>
            <td>${escapeHtml(tipo.Descripcion || '-')}</td>
            <td>💰 $ ${parseFloat(tipo.Precio).toFixed(2)}</td>
            <td>
                <button class="btn-editar" onclick="editarTipo(${tipo.Id})">✏️ Editar</button>
                <button class="btn-eliminar" onclick="confirmarEliminar(${tipo.Id}, '${escapeHtml(tipo.Tipo_Consulta).replace(/'/g, "\\'")}')">🗑️ Eliminar</button>
            </td>
        </tr>
    `).join('');
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// =========================
// MANEJO DEL MODAL CREAR/EDITAR
// =========================

function abrirModalCrear() {
    modalTitulo.textContent = 'Crear Tipo de Consulta';
    tipoIdInput.value = '';
    tipoNombreInput.value = '';
    tipoDescripcionInput.value = '';
    tipoPrecioInput.value = '';
    modal.style.display = 'flex';
}

function editarTipo(id) {
    fetch(`${API_BASE_URL}/${id}`)
        .then(res => res.json())
        .then(result => {
            if (result.success && result.data) {
                const tipo = result.data;
                modalTitulo.textContent = 'Editar Tipo de Consulta';
                tipoIdInput.value = tipo.Id;
                tipoNombreInput.value = tipo.Tipo_Consulta;
                tipoDescripcionInput.value = tipo.Descripcion || '';
                tipoPrecioInput.value = tipo.Precio;
                modal.style.display = 'flex';
            } else {
                mostrarError('No se pudo cargar el tipo de consulta');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            mostrarError('Error al cargar los datos');
        });
}

function cerrarModal() {
    modal.style.display = 'none';
    form.reset();
}

// =========================
// MANEJO DEL MODAL ELIMINAR
// =========================

function confirmarEliminar(id, nombre) {
    currentDeleteId = id;
    eliminarNombreSpan.textContent = nombre;
    modalEliminar.style.display = 'flex';
}

function cerrarModalEliminar() {
    modalEliminar.style.display = 'none';
    currentDeleteId = null;
}

async function eliminarTipoConfirmado() {
    if (!currentDeleteId) return;
    
    try {
        const result = await eliminarTipoConsulta(currentDeleteId);
        
        if (result.success) {
            mostrarMensajeExito(result.message || 'Tipo de consulta eliminado correctamente');
            cerrarModalEliminar();
            fetchTiposConsulta();
        } else {
            mostrarError(result.message || 'Error al eliminar');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error al conectar con el servidor');
    }
}

// =========================
// ENVÍO DEL FORMULARIO
// =========================

async function onSubmitForm(event) {
    event.preventDefault();
    
    const id = tipoIdInput.value;
    const tipo = tipoNombreInput.value.trim();
    const descripcion = tipoDescripcionInput.value.trim();
    const precio = parseFloat(tipoPrecioInput.value);
    
    if (!tipo) {
        mostrarError('El tipo de consulta es obligatorio');
        return;
    }
    
    if (isNaN(precio) || precio < 0) {
        mostrarError('El precio debe ser un número válido mayor o igual a 0');
        return;
    }
    
    const btnGuardar = document.getElementById('btnGuardar');
    btnGuardar.disabled = true;
    btnGuardar.textContent = 'Guardando...';
    
    try {
        let result;
        if (id) {
            result = await actualizarTipoConsulta(id, tipo, descripcion, precio);
        } else {
            result = await crearTipoConsulta(tipo, descripcion, precio);
        }
        
        if (result.success) {
            mostrarMensajeExito(result.message);
            cerrarModal();
            fetchTiposConsulta();
        } else {
            mostrarError(result.message || 'Error al guardar');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error al conectar con el servidor');
    } finally {
        btnGuardar.disabled = false;
        btnGuardar.textContent = 'Guardar';
    }
}

// =========================
// NOTIFICACIONES
// =========================

function mostrarMensajeExito(mensaje) {
    mostrarToast(mensaje, 'success');
}

function mostrarError(mensaje) {
    mostrarToast(mensaje, 'error');
}

function mostrarToast(mensaje, tipo) {
    const toast = document.createElement('div');
    toast.className = `toast-message toast-${tipo}`;
    toast.textContent = tipo === 'success' ? '✅ ' + mensaje : '❌ ' + mensaje;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// =========================
// INICIALIZACIÓN
// =========================

// Event Listeners
if (btnAbrirCrear) btnAbrirCrear.addEventListener('click', abrirModalCrear);
if (btnCancelarModal) btnCancelarModal.addEventListener('click', cerrarModal);
if (btnCancelarEliminar) btnCancelarEliminar.addEventListener('click', cerrarModalEliminar);
if (btnConfirmarEliminar) btnConfirmarEliminar.addEventListener('click', eliminarTipoConfirmado);
if (form) form.addEventListener('submit', onSubmitForm);

// Cerrar modales al hacer click fuera
window.addEventListener('click', (event) => {
    if (event.target === modal) cerrarModal();
    if (event.target === modalEliminar) cerrarModalEliminar();
});

// Cerrar modales con tecla ESC
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        if (modal && modal.style.display === 'flex') cerrarModal();
        if (modalEliminar && modalEliminar.style.display === 'flex') cerrarModalEliminar();
    }
});

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    fetchTiposConsulta();
});

// Exponer funciones globales para los onclick de la tabla
window.editarTipo = editarTipo;
window.confirmarEliminar = confirmarEliminar;