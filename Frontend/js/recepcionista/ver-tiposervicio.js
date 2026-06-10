// =========================
// VER TIPOS DE SERVICIO - RECEPCIONISTA
// Solo lectura - VetCare
// =========================

const API_BASE_URL = 'http://localhost:3000/api/tipoconsulta';

// Elementos DOM
const serviciosContainer = document.getElementById('serviciosContainer');
const buscadorInput = document.getElementById('buscadorServicios');
const infoResultados = document.getElementById('infoResultados');

let todosLosServicios = [];

// =========================
// API (SOLO GET)
// =========================

async function fetchServicios() {
    try {
        mostrarLoading();
        
        const response = await fetch(API_BASE_URL);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success && Array.isArray(result.data)) {
            todosLosServicios = result.data;
            renderizarTarjetas(todosLosServicios);
        } else {
            mostrarError('No se pudieron cargar los servicios');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error de conexión con el servidor');
    }
}

// =========================
// RENDERIZADO DE TARJETAS
// =========================

function renderizarTarjetas(servicios) {
    if (!servicios || servicios.length === 0) {
        serviciosContainer.innerHTML = `
            <div class="empty-container">
                <span>📭</span>
                <p>No hay servicios disponibles para mostrar</p>
            </div>
        `;
        infoResultados.textContent = '0 servicios encontrados';
        return;
    }
    
    // Ordenar alfabéticamente por tipo de consulta
    const serviciosOrdenados = [...servicios].sort((a, b) => 
        a.Tipo_Consulta.localeCompare(b.Tipo_Consulta, 'es')
    );
    
    serviciosContainer.innerHTML = serviciosOrdenados.map(servicio => `
        <div class="tarjeta-servicio" data-nombre="${servicio.Tipo_Consulta.toLowerCase()}" data-descripcion="${(servicio.Descripcion || '').toLowerCase()}">
            <div class="card-header">
                <div class="card-icon">
                    ${getIconForService(servicio.Tipo_Consulta)}
                </div>
                <h3>${escapeHtml(servicio.Tipo_Consulta)}</h3>
            </div>
            <div class="card-body">
                <div class="id-servicio">ID: ${servicio.Id}</div>
                <div class="descripcion-servicio">
                    ${escapeHtml(servicio.Descripcion) || '📝 Sin descripción disponible'}
                </div>
                <div class="precio-servicio">
                    <span class="precio-label">💰 Precio</span>
                    <span class="precio-valor">
                        € ${parseFloat(servicio.Precio).toFixed(2)}
                    </span>
                </div>
            </div>
        </div>
    `).join('');
    
    const cantidad = servicios.length;
    infoResultados.textContent = `${cantidad} servicio${cantidad !== 1 ? 's' : ''} encontrado${cantidad !== 1 ? 's' : ''}`;
}

// Función para asignar ícono según el tipo de servicio
function getIconForService(tipo) {
    tipo = tipo.toLowerCase();
    if (tipo.includes('consulta')) return '🏥';
    if (tipo.includes('vacuna') || tipo.includes('vacunación')) return '💉';
    if (tipo.includes('cirugía') || tipo.includes('cirugia')) return '🔪';
    if (tipo.includes('emergencia')) return '🚨';
    if (tipo.includes('odontología') || tipo.includes('dental')) return '🦷';
    if (tipo.includes('baño') || tipo.includes('estética') || tipo.includes('peluquería')) return '✂️';
    if (tipo.includes('laboratorio')) return '🔬';
    if (tipo.includes('ecografía') || tipo.includes('rayos') || tipo.includes('radiografía')) return '📷';
    return '🐾';
}

// =========================
// BÚSQUEDA EN TIEMPO REAL
// =========================

function filtrarServicios() {
    const termino = buscadorInput.value.trim().toLowerCase();
    
    if (termino === '') {
        renderizarTarjetas(todosLosServicios);
        return;
    }
    
    const filtrados = todosLosServicios.filter(servicio => 
        servicio.Tipo_Consulta.toLowerCase().includes(termino) ||
        (servicio.Descripcion && servicio.Descripcion.toLowerCase().includes(termino))
    );
    
    renderizarTarjetas(filtrados);
}

// =========================
// UTILIDADES
// =========================

function mostrarLoading() {
    serviciosContainer.innerHTML = `
        <div class="loading-container">
            <div class="spinner"></div>
            <p>Cargando servicios disponibles...</p>
        </div>
    `;
    infoResultados.textContent = 'Cargando...';
}

function mostrarError(mensaje) {
    serviciosContainer.innerHTML = `
        <div class="empty-container">
            <span>⚠️</span>
            <p>${mensaje}</p>
            <button onclick="location.reload()" style="margin-top: 16px; padding: 10px 24px; background: #42AB49; color: white; border: none; border-radius: 10px; cursor: pointer; font-family: 'Baloo Da 2', sans-serif; font-weight: 600;">
                Reintentar
            </button>
        </div>
    `;
    infoResultados.textContent = 'Error de conexión';
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// =========================
// EVENT LISTENERS
// =========================

if (buscadorInput) {
    buscadorInput.addEventListener('input', filtrarServicios);
}

// =========================
// INICIALIZACIÓN
// =========================

// =========================
// INICIALIZACIÓN
// =========================

document.addEventListener('DOMContentLoaded', () => {
    fetchServicios();
    
    // Manejar el menú hamburguesa
    const menuToggle = document.querySelector('.menu-toggle');
    const backdrop = document.querySelector('.sidebar-backdrop');
    
    if (menuToggle && backdrop) {
        menuToggle.addEventListener('click', () => {
            document.body.classList.toggle('menu-open');
        });
        
        backdrop.addEventListener('click', () => {
            document.body.classList.remove('menu-open');
        });
    }
});