document.addEventListener("DOMContentLoaded", () => {
    const btnLogout = document.getElementById("cerrar-sesion");

    if (!btnLogout) return;

    btnLogout.addEventListener("click", async (e) => {
        e.preventDefault();

        localStorage.clear();
        sessionStorage.clear();

        try {
            await fetch("http://localhost:3000/api/auth/logout", {
                method: "POST",
            });
        } catch (error) {
            console.log("No se pudo notificar al backend, pero se cerró sesión local.");
        }

        window.location.href = "../../index.html";
    });
});