document.addEventListener("DOMContentLoaded", function(){

    const form = document.querySelector("form");

    form.addEventListener("submit", function(e){
        e.preventDefault();

        const user = document.querySelector("input[type='text']").value.trim();
        const pass = document.querySelector("input[type='password']").value.trim();

/*Si se utiliza el user  y pass tendria q dar la alerta de formulario valido*/ 
/*Si Falta campos que rellenar daria una alerta*/ 

        if(user === "" || pass === ""){
            alert("Por favor completa todos los campos");
            return;
        }

        alert("Formulario válido");
    });

});