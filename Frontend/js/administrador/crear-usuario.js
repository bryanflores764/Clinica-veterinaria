// ============================================================
//  Archivo: js/administrador/crear-usuario.js
// ============================================================

//define la url de la API
const API_URL = "http://localhost:3000";

//variables del DOM del html
const form = document.getElementById("crearUsuarioForm");
const nombreUsuarioInput = document.getElementById("nombreUsuario");
const contraseniaInput = document.getElementById("contrasenia");
const rolInput = document.getElementById("rol");
const correoInput = document.getElementById("correo");
const btnCrear = document.querySelector(".btn-crear");

//obtnener los web token y guardadrlo
function getAuthHeaders(extra = {}) {
    const token = localStorage.getItem("token");

    return {
        ...extra,
        Authorization: `Bearer ${token}`,
    };
}

//limpiar el form
function limpiarFormulario() {
    form.reset();
    rolInput.value = "";
    nombreUsuarioInput.focus();
}

//evento que envia el form
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombreUsuario = nombreUsuarioInput.value.trim();
    const contrasena = contraseniaInput.value.trim();
    const rolId = Number(rolInput.value);
    const correo = correoInput.value.trim();

    if (!nombreUsuario || !contrasena || !rolId || !correo) {
        alert("Por favor completa todos los campos.");
        return;
    }

    const payload = {
        nombre_usuario: nombreUsuario,
        contrasena,
        rolId,
        correo
    };

    btnCrear.disabled = true;
    btnCrear.textContent = "Creando...";

    try {
        const res = await fetch(`${API_URL}/api/usuarios`, {
            method: "POST",
            headers: getAuthHeaders({
                "Content-Type": "application/json"
            }),
            body: JSON.stringify(payload)
        });

        if (res.status === 401 || res.status === 403) {
            localStorage.removeItem("token");
            localStorage.removeItem("usuario");
            window.location.replace("../../index.html");
            return;
        }

        const json = await res.json().catch(() => ({}));

        if (!res.ok || json.success === false) {
            throw new Error(json.message || "No se pudo crear el usuario");
        }

        alert(json.message || "Usuario creado correctamente");
        limpiarFormulario();

    } catch (error) {
        //manejo de logs
        console.error("Error al crear usuario:", error);
        alert(error.message || "Ocurrió un error al crear el usuario");
    } finally {
        //restablecer el boton
        btnCrear.disabled = false;
        btnCrear.textContent = "Crear Usuario";
    }
});