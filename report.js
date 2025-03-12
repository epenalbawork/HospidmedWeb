document.addEventListener("DOMContentLoaded", () => {
    const generateBtn = document.getElementById("generate-report-btn");
    if (!generateBtn) return;

    generateBtn.addEventListener("click", async () => {
        await generateReport();
    });
});

async function generateReport() {
    try {
        const selectedChecks = document.querySelectorAll(".row-check:checked");
        const selectedPesoChecks = document.querySelectorAll(".row-check-peso:checked");

        if (selectedChecks.length === 0 && selectedPesoChecks.length === 0) {
            alert("⚠️ No has seleccionado ningún registro.");
            return;
        }

        const selectedKeys = new Set([
            ...Array.from(selectedChecks).map(chk => chk.dataset.key),
            ...Array.from(selectedPesoChecks).map(chk => chk.dataset.key)
        ]);

        const allRows = window.globalDataRows || [];
        const allPesoRows = window.globalPesoRows || [];

        const normalizeText = text => (text || "").trim().toLowerCase();

        // 🔹 Agrupar por ubicación y fecha
        const groupedData = {};

        // 🔹 Procesar Intercambio de Contenedores
        allRows.forEach(item => {
            const key = `${normalizeText(item.Ubicacion)}__${item.Fecha}`;
            if (!selectedKeys.has(key)) return;

            if (!groupedData[key]) {
                groupedData[key] = {
                    ubicacion: item.Ubicacion,
                    fecha: item.Fecha,
                    intercambio: { imagenes: [] },
                    pesaje: { imagenesPeso: [], imagenesTacho: [], tachos: [] }
                };
            }

            if (item.Imagen) groupedData[key].intercambio.imagenes.push(item.Imagen);
        });

        // 🔹 Procesar Pesaje de Contenedores
        allPesoRows.forEach(item => {
            const key = `${normalizeText(item.ubicación)}__${item.Fecha}`;
            if (!selectedKeys.has(key)) return;

            if (!groupedData[key]) {
                groupedData[key] = {
                    ubicacion: item.ubicación,
                    fecha: item.Fecha,
                    intercambio: { imagenes: [] },
                    pesaje: { imagenesPeso: [], imagenesTacho: [], tachos: [] }
                };
            }

            if (item.Url_imagen_peso) groupedData[key].pesaje.imagenesPeso.push(item.Url_imagen_peso);
            if (item.Url_Imagen) groupedData[key].pesaje.imagenesTacho.push(item.Url_Imagen);
            if (item.tacho) groupedData[key].pesaje.tachos.push(item.tacho);
        });

        // 🔹 Convertir en Array y Guardar en localStorage
        const reporteData = Object.values(groupedData);
        localStorage.setItem("reporteData", JSON.stringify(reporteData));

        // 🔹 Abrir la página del reporte
        window.open("reporte.html", "_blank");

    } catch (err) {
        console.error("⚠️ Error generando reporte:", err);
        alert("⚠️ Error generando reporte.");
    }
}
