document.addEventListener("DOMContentLoaded", () => {
    const generateBtn = document.getElementById("generate-report-btn");
    if (!generateBtn) return;

    generateBtn.addEventListener("click", async () => {
        await generateReport();
    });
});

async function generateReport() {
    try {
        // 🔹 Obtener las selecciones de ambas tablas
        const selectedChecks = document.querySelectorAll(".row-check:checked");
        const selectedPesoChecks = document.querySelectorAll(".row-check-peso:checked");

        if (selectedChecks.length === 0 && selectedPesoChecks.length === 0) {
            alert("⚠️ No has seleccionado ningún registro.");
            return;
        }

        // 🔹 Obtener las claves de ambos conjuntos
        const selectedKeys = new Set([
            ...Array.from(selectedChecks).map(chk => chk.dataset.key),
            ...Array.from(selectedPesoChecks).map(chk => chk.dataset.key)
        ]);

        const allRows = window.globalDataRows || [];
        const allPesoRows = window.globalPesoRows || [];

        const normalizeText = text => (text || "").trim().toLowerCase();

        // 🔹 Filtrar los datos de Intercambio y Pesaje según la selección
        const selectedItems = allRows.filter(item => {
            const fecha = item.Fecha;
            const key = `${normalizeText(item.Ubicacion)}__${fecha}`;
            return selectedKeys.has(key);
        });

        const selectedPesos = allPesoRows.filter(item => {
            const fecha = item.Fecha;
            const key = `${normalizeText(item.ubicación)}__${fecha}`;
            return selectedKeys.has(key);
        });

        if (selectedItems.length === 0 && selectedPesos.length === 0) {
            alert("⚠️ No se encontraron registros seleccionados.");
            return;
        }

        // 🔹 Agrupar por Ubicación y Fecha
        const intercambioContenedores = {};
        const pesajeContenedores = {};

        // 🔹 Procesar datos de Intercambio
        selectedItems.forEach(item => {
            const ubicacion = item.Ubicacion?.trim();
            const fecha = item.Fecha;
            const key = `${ubicacion}__${fecha}`;

            if (!intercambioContenedores[key]) {
                intercambioContenedores[key] = {
                    ubicacion,
                    fecha,
                    imagenes: [],
                };
            }

            if (item.Imagen) intercambioContenedores[key].imagenes.push(item.Imagen);
        });

        // 🔹 Procesar datos de Pesaje
        selectedPesos.forEach(item => {
            const ubicacion = item.ubicación?.trim();
            const fecha = item.Fecha;
            const key = `${ubicacion}__${fecha}`;

            if (!pesajeContenedores[key]) {
                pesajeContenedores[key] = {
                    ubicacion,
                    fecha,
                    imagenesPeso: [],
                    imagenesTacho: [],
                    tachos: []
                };
            }

            if (item.Url_imagen_peso) pesajeContenedores[key].imagenesPeso.push(item.Url_imagen_peso);
            if (item.Url_Imagen) pesajeContenedores[key].imagenesTacho.push(item.Url_Imagen);
            if (item.tacho) pesajeContenedores[key].tachos.push(item.tacho);
        });

        // 🔹 Crear el PDF en orientación horizontal
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF("l", "pt", "letter");
        let yPos = 50;
        const pageWidth = doc.internal.pageSize.getWidth();

        // 🔹 Insertar LOGO
        const logo = await getBase64FromUrl("img/logo-gr.png");
        if (logo) {
            doc.addImage(logo, "PNG", 10, yPos - 45, 60, 60);
        }
        doc.setFontSize(14);
        doc.text("CONTROL DE PESO DIARIO", pageWidth / 2, yPos, { align: "center" });
        yPos += 20;
        doc.setFontSize(11);
        doc.text("PROYECTO: CIUDAD DE LA SALUD", 40, yPos);
        doc.text("CAJA DE SEGURO SOCIAL", pageWidth - 250, yPos);
        yPos += 40;

        let fotoCount = 1;
        let cuadrosEnPagina = 0;
        const sortedKeys = [...Object.keys(intercambioContenedores), ...Object.keys(pesajeContenedores)].sort();

        for (const key of sortedKeys) {
            let isPesaje = !!pesajeContenedores[key];
            let data = isPesaje ? pesajeContenedores[key] : intercambioContenedores[key];

            // Si la página está llena, agregar una nueva
            if (cuadrosEnPagina >= 2) {
                doc.addPage();
                yPos = 50;
                cuadrosEnPagina = 0;
            }

            // 🔹 CREAR CUADRO DE REPORTE (2 por página)
            doc.setDrawColor(0);
            doc.setLineWidth(1);
            doc.rect(40, yPos, 720, 220);
            doc.line(330, yPos, 330, yPos + 220);

            // 🔹 SECCIÓN IZQUIERDA
            doc.setFontSize(10);
            let textStartY = yPos + 30;
            doc.text(`Fotografía ${fotoCount}.`, 48, textStartY);
            doc.line(40, textStartY + 5, 320, textStartY + 5);
            textStartY += 30;

            doc.text(`Ubicación: ${data.ubicacion}`, 48, textStartY);
            doc.line(40, textStartY + 5, 320, textStartY + 5);
            textStartY += 30;

            doc.text(`Generador: Hospimed`, 48, textStartY);
            doc.line(40, textStartY + 5, 320, textStartY + 5);
            textStartY += 30;

            doc.text(`Fecha: ${data.fecha.split("-").reverse().join("/")}`, 48, textStartY);
            doc.line(40, textStartY + 5, 320, textStartY + 5);
            textStartY += 30;

            doc.setFontSize(9);
            doc.text("Comentarios:", 48, textStartY);
            textStartY += 15;
            const comments = isPesaje
                ? "Pesaje de contenedores con desechos."
                : "Intercambio de contenedores con desechos por contenedores limpios.";

            doc.text(doc.splitTextToSize(comments, 260), 48, textStartY);

            // 🔹 SECCIÓN DERECHA
            let imgX = 340;
            let imgY = yPos + 10;
            const imgW = 150;
            const imgH = 130;
            let imgCount = 0;

            const imgList = isPesaje ? [...data.imagenesPeso, ...data.imagenesTacho] : [...data.imagenes];

            for (let imgData of imgList) {
                if (!imgData) continue;
                const base64Img = await getBase64FromUrl(imgData);
                if (base64Img) {
                    doc.addImage(base64Img, "PNG", imgX, imgY, imgW, imgH);
                    imgX += imgW + 10;
                    imgCount++;

                    if (imgCount % 2 === 0) {
                        imgX = 340;
                        imgY += imgH + 10;
                    }
                }
            }

            yPos += 250;
            fotoCount++;
            cuadrosEnPagina++;
        }

        doc.save("reporte.pdf");

    } catch (err) {
        console.error("⚠️ Error generando reporte:", err);
        alert("⚠️ Error generando reporte.");
    }
}

 
/**
 * 🔹 Convierte una imagen URL a Base64
 */
async function getBase64FromUrl(url) {
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Error al obtener imagen: ${res.status}`);
        const blob = await res.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error("⚠️ Error convirtiendo imagen a Base64:", url, error);
        return null;
    }
}