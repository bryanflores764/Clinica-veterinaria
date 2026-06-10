(() => {
    const API_URL = "https://clinica-veterinaria-backend-m3mf.onrender.com/api/citas";

    let todasLasCitas = [];

    const tbody        = document.getElementById("historialBody");
    const buscar       = document.getElementById("buscarHistorial");
    const filtroEstado = document.getElementById("filtroEstadoHistorial");
    const fechaDesde   = document.getElementById("fechaDesde");
    const fechaHasta   = document.getElementById("fechaHasta");
    const btnLimpiar   = document.getElementById("btnLimpiarFiltros");
    const resumen      = document.getElementById("resumenHistorial");

    function obtenerToken() {
        return localStorage.getItem("token") || "";
    }

    function headersAuth() {
        return {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${obtenerToken()}`
        };
    }

    // =========================
    // Carga inicial
    // =========================
    async function cargarHistorial() {
        try {
            const res = await fetch(API_URL, { headers: headersAuth() });
            if (!res.ok) throw new Error("Error al cargar historial");
            const json = await res.json();
            todasLasCitas = Array.isArray(json) ? json : (json.data ?? []);
            aplicarFiltros();
        } catch (err) {
            console.error("Error:", err);
            if (tbody) {
                tbody.innerHTML = `<tr><td colspan="7" class="celda-vacia">Error al cargar el historial.</td></tr>`;
            }
            if (resumen) resumen.textContent = "";
        }
    }

    // =========================
    // Filtros
    // =========================
    function aplicarFiltros() {
        const texto  = buscar?.value.toLowerCase().trim() || "";
        const estado = filtroEstado?.value || "todos";
        const desde  = fechaDesde?.value || "";
        const hasta  = fechaHasta?.value || "";

        const filtradas = todasLasCitas.filter(c => {
            const mascota    = (c.Mascota     || "").toLowerCase();
            const vet        = (c.Veterinario || "").toLowerCase();
            const estadoCita = (c.Estado      || "").toLowerCase();
            const fechaCita  = c.FechaHora ? c.FechaHora.slice(0, 10) : "";

            const coincideTexto  = !texto  || mascota.includes(texto) || vet.includes(texto);
            const coincideEstado = estado === "todos" || estadoCita.includes(estado);
            const coincideDesde  = !desde  || fechaCita >= desde;
            const coincideHasta  = !hasta  || fechaCita <= hasta;

            return coincideTexto && coincideEstado && coincideDesde && coincideHasta;
        });

        if (resumen) {
            resumen.textContent = filtradas.length === 1
                ? "1 registro encontrado"
                : `${filtradas.length} registros encontrados`;
        }

        renderizar(filtradas);
    }

    function limpiarFiltros() {
        if (buscar)       buscar.value       = "";
        if (filtroEstado) filtroEstado.value = "todos";
        if (fechaDesde)   fechaDesde.value   = "";
        if (fechaHasta)   fechaHasta.value   = "";
        aplicarFiltros();
    }

    // =========================
    // Render
    // =========================
    function claseYTextoEstado(estadoRaw) {
        const s = (estadoRaw || "").toLowerCase();
        if (s.includes("complet"))                              return ["estado-completada", estadoRaw];
        if (s.includes("cancel"))                               return ["estado-cancelada",  estadoRaw];
        if (s.includes("curso") || s.includes("activa"))       return ["estado-encurso",     estadoRaw];
        if (s.includes("pendiente"))                            return ["estado-pendiente",   estadoRaw];
        return ["", estadoRaw];
    }

    function renderizar(lista) {
        if (!tbody) return;

        if (!lista.length) {
            tbody.innerHTML = `<tr><td colspan="7" class="celda-vacia">No se encontraron registros.</td></tr>`;
            return;
        }

        tbody.innerHTML = lista.map(c => {
            const fechaHora = new Date(c.FechaHora);
            const fecha     = fechaHora.toLocaleDateString("es-SV");
            const hora      = fechaHora.toTimeString().slice(0, 5);
            const [clase, texto] = claseYTextoEstado(c.Estado);

            return `
                <tr>
                    <td data-label="Mascota" style="font-weight:600">${c.Mascota ?? "—"}</td>
                    <td data-label="Veterinario">${c.Veterinario ?? "—"}</td>
                    <td data-label="Tipo">${c.Tipo_Consulta ?? "—"}</td>
                    <td data-label="Fecha">${fecha}</td>
                    <td data-label="Hora">${hora}</td>
                    <td data-label="Estado">
                        <span class="badge-estado ${clase}">${texto ?? "—"}</span>
                    </td>
                </tr>`;
        }).join("");
    }

    // =========================
    // Init
    // =========================
    function init() {
        buscar?.addEventListener("input",  aplicarFiltros);
        filtroEstado?.addEventListener("change", aplicarFiltros);
        fechaDesde?.addEventListener("change",   aplicarFiltros);
        fechaHasta?.addEventListener("change",   aplicarFiltros);
        btnLimpiar?.addEventListener("click",    limpiarFiltros);
        cargarHistorial();
    }

    document.addEventListener("DOMContentLoaded", init);
})();
