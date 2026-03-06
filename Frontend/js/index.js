document.addEventListener("DOMContentLoaded", function(){

    const form = document.querySelector("form");

    form.addEventListener("submit", async function(e){
        e.preventDefault();

        const user = document.querySelector("input[type='text']").value.trim();
        const pass = document.querySelector("input[type='password']").value.trim();

        // Validación
        if(user === "" || pass === ""){
            alert("Por favor completa todos los campos");
            return;
        }

        try{

          const respuesta = await fetch("http://localhost:3000/api/auth/login",{
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body: JSON.stringify({
                    usuario:user,
                    password:pass
                })
            });

            const data = await respuesta.json();

            if(data.success){

                if(data.rol === "admin"){
                    window.location.href = "pages/administrador/interfazAdmin.html";
                }

                if(data.rol === "recepcionista"){
                    window.location.href = "pages/recepcionista/interfazRecepcionista.html";
                }

                if(data.rol === "veterinario"){
                    window.location.href = "pages/veterinario/interfazveterinario.html";
                }

            }else{
                alert("Usuario o contraseña incorrectos");
            }

        }catch(error){
            alert("Error al conectar con el servidor");
        }

    });

});