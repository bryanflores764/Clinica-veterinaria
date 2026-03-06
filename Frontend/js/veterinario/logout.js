document.addEventListener("DOMContentLoaded", () => {
  const btnLogout = document.getElementById("cerrar-sesion");/*Busca un elemnto donde se llame cerrar-sesion y se almacena en btnlogout*/ 
  
  if (!btnLogout) return;/*Si no exite btnlogout detiene el script*/

  btnLogout.addEventListener("click", (e) => {/*Cuando el boton haga click en el boton cerrrar sesion hace el evento*/
    e.preventDefault();/*Evita q se recargue la pagina*/

    // 1 Limpia y redirige INMEDIATO (rápido)
    localStorage.clear();/*Borrar los daatos guardados localstorage como token usuario o rol*/
    sessionStorage.clear();/*Borra todos los datos guardados en localStorage*/
    window.location.href = "../../index.html"; /*Redirige el usuario a otra pagina como Frontend/index.html que es el login*/

    // 2 Notifica al backend SIN esperar respuesta (no bloquea)
    fetch("http://localhost:3000/api/auth/logout", {/*Envia solicitud al backend para avisar que usuario cerro sesion*/
      method: "POST", /*Se esta enviando una accion a logout*/
    }).catch(() => {});
  });
});

