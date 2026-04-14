let propietarios = [
    {
        id: 1,
        nombre: "Juan Pérez",
        telefono: "7777-7777",
        correo: "juan@gmail.com",
        direccion: "San Miguel",
        activo: true
    },
    {
        id: 2,
        nombre: "María López",
        telefono: "7888-9999",
        correo: "maria@gmail.com",
        direccion: "Usulután",
        activo: false
    },
    {
        id: 3,
        nombre: "Carlos Ramírez",
        telefono: "7555-1234",
        correo: "carlos@gmail.com",
        direccion: "La Unión",
        activo: true
    }
];

const tableBody = document.getElementById("ownersTableBody");
const buscarInput = document.getElementById("buscarPropietario");
const filtroEstado = document.getElementById("filtroEstado");

function renderizarPropietarios(lista) {
    tableBody.innerHTML = "";

    if (lista.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7">No se encontraron propietarios.</td>
            </tr>
        `;
        return;
    }

    lista.forEach(propietario => {
        tableBody.innerHTML += `
            <tr>
                <td>${propietario.id}</td>
                <td>${propietario.nombre}</td>
                <td>${propietario.telefono}</td>
                <td>${propietario.correo}</td>
                <td>${propietario.direccion}</td>
                <td>${propietario.activo ? "Activo" : "Inactivo"}</td>
                <td>
                    <button onclick="verPropietario(${propietario.id})">Ver</button>
                    <button onclick="editarPropietario(${propietario.id})">Editar</button>
                    <button onclick="toggleEstado(${propietario.id})">
                        ${propietario.activo ? "Desactivar" : "Activar"}
                    </button>
                </td>
            </tr>
        `;
    });
}

function aplicarFiltros() {
    const texto = buscarInput.value.toLowerCase().trim();
    const estado = filtroEstado.value;

    let filtrados = propietarios.filter(prop => {
        const coincideTexto =
            prop.nombre.toLowerCase().includes(texto) ||
            prop.correo.toLowerCase().includes(texto);

        let coincideEstado = true;

        if (estado === "activos") coincideEstado = prop.activo === true;
        if (estado === "inactivos") coincideEstado = prop.activo === false;

        return coincideTexto && coincideEstado;
    });

    renderizarPropietarios(filtrados);
}

buscarInput.addEventListener("input", aplicarFiltros);
filtroEstado.addEventListener("change", aplicarFiltros);

renderizarPropietarios(propietarios);

function verPropietario(id) {
    const propietario = propietarios.find(p => p.id === id);
    alert(`
Nombre: ${propietario.nombre}
Teléfono: ${propietario.telefono}
Correo: ${propietario.correo}
Dirección: ${propietario.direccion}
Estado: ${propietario.activo ? "Activo" : "Inactivo"}
    `);
}

function editarPropietario(id) {
    const propietario = propietarios.find(p => p.id === id);
    alert("Aquí luego abrirás el modal de editar de: " + propietario.nombre);
}

function toggleEstado(id) {
    const propietario = propietarios.find(p => p.id === id);

    const confirmacion = confirm(
        `¿Seguro que deseas ${propietario.activo ? "desactivar" : "activar"} a ${propietario.nombre}?`
    );

    if (!confirmacion) return;

    propietario.activo = !propietario.activo;
    aplicarFiltros();
}