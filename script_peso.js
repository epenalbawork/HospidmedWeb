// 1. Guardar el nuevo token y API para la tabla de PESOS
const apiPesoUrl = "https://api.jelou.ai/v2/databases/3161/rows";
const myToken = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ODM3MiwibmFtZXMiOiJFZHdpbiBQZcOxYWxiYSIsImxhbmciOiJlcyIsImVtYWlsIjoiZWR3aW4ucGVuYWxiYUBjaWJlcm5ldGljYS5uZXQiLCJlbWFpbFZlcmlmaWVkIjpudWxsLCJjb21wYW55SWQiOjE4OTgsImFjdGl2ZSI6Im9mZmxpbmUiLCJzdGF0ZSI6dHJ1ZSwicHJvdmlkZXJJZCI6IjI1MDVlNTUwLTAwYmItNDlmZC05NTZhLWI1N2MyMzIzMzc2OSIsImV4dGVybmFsVG9rZW4iOiJhZWU3MzA4MS1hYWZlLTRjYmMtOTk2Zi0yNWFkYmFiODI3MGQiLCJvcGVyYXRvckFjdGl2ZSI6Im9mZmxpbmUiLCJjcmVhdGVkQnkiOjgzNzEsInByb3BlcnRpZXMiOm51bGwsInNob3VsZFJlY2VpdmVFbWFpbCI6bnVsbCwibm90aWZpY2F0aW9uU291bmQiOmZhbHNlLCJpc01pZ3JhdGVkIjpmYWxzZSwiaXNPcGVyYXRvciI6dHJ1ZSwib3BlcmF0b3JJZCI6NjI1NywidGltZXpvbmUiOiJBbWVyaWNhL0d1YXlhcXVpbCIsIm1vbml0b3JBbGxUZWFtcyI6dHJ1ZSwibG9nZ2VkSW5BdCI6IjIwMjUtMDMtMTNUMDg6MTU6MDMuMDAwWiIsImxvZ2dlZE91dEF0IjoiMjAyNS0wMi0wNVQyMDo1NToxNi4wMDBaIiwiZGVsZXRlZEF0IjpudWxsLCJjcmVhdGVkQXQiOiIyMDI0LTEwLTAxVDEzOjA2OjAyLjAwMFoiLCJ1cGRhdGVkQXQiOiIyMDI1LTAzLTEzVDEzOjE1OjAzLjAwMFoiLCJVc2VyVHdvRmFjdG9yQXV0aCI6W10sIk9wZXJhdG9yIjp7ImlkIjo2MjU3LCJuYW1lcyI6IkVkd2luIFBlw7FhbGJhIiwiZW1haWwiOiJlZHdpbi5wZW5hbGJhQGNpYmVybmV0aWNhLm5ldCIsInByb3BlcnRpZXMiOm51bGwsImNvbXBhbnlJZCI6MTg5OCwic3RhdGUiOjEsImFjdGl2ZSI6Im9mZmxpbmUiLCJwcm92aWRlcklkIjoiMjUwNWU1NTAtMDBiYi00OWZkLTk1NmEtYjU3YzIzMjMzNzY5IiwiZXhwb1Rva2VuIjpudWxsLCJsb2dnZWRPdXRBdCI6IjIwMjUtMDItMDVUMjA6NTU6MTYuMDAwWiIsImxvZ2dlZEluQXQiOiIyMDI1LTAzLTEzVDA4OjE1OjAzLjAwMFoiLCJ0ZWFtSWRzIjpbbnVsbCxudWxsLG51bGxdfSwic2Vzc2lvbklkIjoib2tiSlNPZjkzIiwiand0X3R5cGUiOiJVU0VSIiwiaWF0IjoxNzQxODcxNzUxLCJleHAiOjE3NDE5MTQ5NTF9.bPgdlRed0ggS02R5zu7tCqTzgGQae6a1yBmF7CbBqy0";

document.addEventListener('DOMContentLoaded', async () => {
    window.globalPesoRows = []; // Variable global para almacenar los datos
    const tablePesoContainer = document.getElementById('table-peso-container');

    let pesoRows = []; // Para almacenar registros de la API

    // 🔹 Obtener datos de la API de Pesos
    try {
        const response = await fetch(apiPesoUrl, {
            method: 'GET',
            headers: {
                'Authorization': myToken,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

        const jsonData = await response.json();
        pesoRows = jsonData.results || [];
        window.globalPesoRows = pesoRows; // Guardamos los datos globalmente

        console.log("🔹 Datos de PESOS cargados correctamente:", pesoRows);

        // 🔹 Normalizar la fecha (extraer solo YYYY-MM-DD)
        pesoRows.forEach(item => {
            if (item.createdAt) {
                item.Fecha = item.createdAt.split('T')[0]; // Extrae solo la parte de la fecha
            }
        });

        // 🔹 Mostrar la tabla de pesos agrupada
        displayTablePesoGrouped(pesoRows);
    } catch (error) {
        console.error('⚠️ Error al cargar datos de PESOS:', error);
        tablePesoContainer.innerHTML = '<p>⚠️ Ocurrió un error al cargar los datos de PESOS.</p>';
    }

    // 🔹 Función: agrupar por Ubicación y Fecha, y renderizar la tabla
    function displayTablePesoGrouped(rows) {
        window.globalPesoRows = rows;
        const groups = {};

        rows.forEach(item => {
            const ubicacion = (item.ubicación || 'Sin Ubicación').trim().toLowerCase();
            const fecha = item.Fecha;

            const key = `${ubicacion}__${fecha}`; // 🔹 Generamos la clave correctamente

            if (!groups[key]) {
                groups[key] = { 
                    ubicacion: item.ubicación, 
                    fecha, 
                    tachos: [], 
                    pesos: [], 
                    imagenesTacho: [], // Guardamos las imágenes de los tachos
                    imagenesPeso: [] // Guardamos las imágenes del peso
                };
            }

            if (item.tacho) groups[key].tachos.push(item.tacho);
            if (item.peso) groups[key].pesos.push(item.peso);
            if (item.Url_Imagen) groups[key].imagenesTacho.push(item.Url_Imagen);
            if (item.Url_imagen_peso) groups[key].imagenesPeso.push(item.Url_imagen_peso);
        });

        let html = `
            <table class="table">
                <thead>
                    <tr>
                        <th></th>
                        <th>Ubicación</th>
                        <th>Fecha</th>
                        <th>Tacho</th>
                        <th>Peso</th>
                        <th>Imagen Tacho</th>
                        <th>Imagen Peso</th>
                    </tr>
                </thead>
                <tbody>
        `;

        Object.keys(groups).forEach(key => {
            const { ubicacion, fecha, tachos, pesos, imagenesTacho, imagenesPeso } = groups[key];

            html += `
                <tr class="group-header">
                    <td><input type="checkbox" class="row-check-peso" data-key="${key}"></td>
                    <td>${ubicacion}</td>
                    <td>${fecha.split('-').reverse().join('/')}</td>
                    <td>${tachos.join(', ')}</td>
                    <td>${pesos.join(', ')}</td>
                    <td>
                        ${imagenesTacho.map(img => `<img src="${img}" width="50" height="50" alt="Peso"/>`).join(' ')}
                    </td>
                         <td>
                        ${imagenesPeso.map(img => `<img src="${img}" width="50" height="50" alt="Peso"/>`).join(' ')}
                    </td>
                </tr>
            `;
        });

        html += `</tbody></table>`;
        document.getElementById('table-peso-container').innerHTML = html;
    }
});
