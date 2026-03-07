document.addEventListener("DOMContentLoaded", function(){

    const form = document.querySelector("form");

    form.addEventListener("submit", async function(e){
        e.preventDefault();

        const user = document.querySelector("input[type='text']").value.trim();
        const pass = document.querySelector("input[type='password']").value.trim();

        if(user === "" || pass === ""){
            alert("Por favor completa todos los campos");
            return;
        }

        try {
            const respuesta = await fetch("http://localhost:3000/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                correo: user,
                contrasena: pass
            })
            });

            const data = await respuesta.json();

            if(data.success){
                const rolId = data.data.usuario.RolId;

                // Guarda el token para usarlo después
                localStorage.setItem("token", data.data.token);
                localStorage.setItem("usuario", JSON.stringify(data.data.usuario));

                if(rolId === 1){
                    window.location.href = "pages/administrador/interfazAdmin.html";
                } else if(rolId === 2){
                    window.location.href = "pages/recepcionista/interfazRecepcionista.html";
                } else if(rolId === 3){
                    window.location.href = "pages/veterinario/interfazveterinario.html";
                } else {
                    alert("Rol no reconocido");
                }

            } else {
                alert(data.message || "Usuario o contraseña incorrectos");
            }

        } catch(error) {
            alert("Error al conectar con el servidor");
        }

    });

});