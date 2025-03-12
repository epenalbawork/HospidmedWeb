// Guardar el token de autenticación
const myTokenIntercambio = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ODM3MiwibmFtZXMiOiJFZHdpbiBQZcOxYWxiYSIsImxhbmciOiJlcyIsImVtYWlsIjoiZWR3aW4ucGVuYWxiYUBjaWJlcm5ldGljYS5uZXQiLCJlbWFpbFZlcmlmaWVkIjpudWxsLCJjb21wYW55SWQiOjE4OTgsImFjdGl2ZSI6Im9mZmxpbmUiLCJzdGF0ZSI6dHJ1ZSwicHJvdmlkZXJJZCI6IjI1MDVlNTUwLTAwYmItNDlmZC05NTZhLWI1N2MyMzIzMzc2OSIsImV4dGVybmFsVG9rZW4iOiJhZWU3MzA4MS1hYWZlLTRjYmMtOTk2Zi0yNWFkYmFiODI3MGQiLCJvcGVyYXRvckFjdGl2ZSI6Im9mZmxpbmUiLCJjcmVhdGVkQnkiOjgzNzEsInByb3BlcnRpZXMiOm51bGwsInNob3VsZFJlY2VpdmVFbWFpbCI6bnVsbCwibm90aWZpY2F0aW9uU291bmQiOmZhbHNlLCJpc01pZ3JhdGVkIjpmYWxzZSwiaXNPcGVyYXRvciI6dHJ1ZSwib3BlcmF0b3JJZCI6NjI1NywidGltZXpvbmUiOiJBbWVyaWNhL0d1YXlhcXVpbCIsIm1vbml0b3JBbGxUZWFtcyI6dHJ1ZSwibG9nZ2VkSW5BdCI6IjIwMjUtMDMtMTJUMTI6MDc6MTQuMDAwWiIsImxvZ2dlZE91dEF0IjoiMjAyNS0wMi0wNVQyMDo1NToxNi4wMDBaIiwiZGVsZXRlZEF0IjpudWxsLCJjcmVhdGVkQXQiOiIyMDI0LTEwLTAxVDEzOjA2OjAyLjAwMFoiLCJ1cGRhdGVkQXQiOiIyMDI1LTAzLTEyVDE3OjA3OjE0LjAwMFoiLCJVc2VyVHdvRmFjdG9yQXV0aCI6W10sIk9wZXJhdG9yIjp7ImlkIjo2MjU3LCJuYW1lcyI6IkVkd2luIFBlw7FhbGJhIiwiZW1haWwiOiJlZHdpbi5wZW5hbGJhQGNpYmVybmV0aWNhLm5ldCIsInByb3BlcnRpZXMiOm51bGwsImNvbXBhbnlJZCI6MTg5OCwic3RhdGUiOjEsImFjdGl2ZSI6Im9mZmxpbmUiLCJwcm92aWRlcklkIjoiMjUwNWU1NTAtMDBiYi00OWZkLTk1NmEtYjU3YzIzMjMzNzY5IiwiZXhwb1Rva2VuIjpudWxsLCJsb2dnZWRPdXRBdCI6IjIwMjUtMDItMDVUMjA6NTU6MTYuMDAwWiIsImxvZ2dlZEluQXQiOiIyMDI1LTAzLTEyVDEyOjA3OjE0LjAwMFoiLCJ0ZWFtSWRzIjpbbnVsbCxudWxsLG51bGxdfSwic2Vzc2lvbklkIjoiUlh2SjZUeGVPIiwiand0X3R5cGUiOiJVU0VSIiwiaWF0IjoxNzQxNzk5MjYzLCJleHAiOjE3NDE4NDI0NjN9.5PpgELgRDgc5BvfTHM2BkuPBejYdFHnW2ZBD3iw845M';
const apiUrl = 'https://api.jelou.ai/v2/databases/3248/rows'
// Guardar el token de autenticación

document.addEventListener('DOMContentLoaded', async () => {
    window.globalDataRows = []; // Variable global para almacenar los datos
    const filterForm = document.getElementById('filter-form');
    const operarioSelect = document.getElementById('operarioSelect');
    const tableContainer = document.getElementById('table-container');

    let dataRows = []; // Para almacenar registros de la API

    // 🔹 Obtener datos al cargar la página
    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': myTokenIntercambio,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

        const jsonData = await response.json();
        dataRows = jsonData.results || [];
        window.globalDataRows = dataRows; // Guardamos los datos globalmente

        console.log("🔹 Datos cargados correctamente:", dataRows);

        // 🔹 Llenar el select de Operarios (campo "Ubicacion")
        fillOperarioSelect(dataRows);

        // 🔹 Mostrar la tabla agrupada
        displayTableGroupedByUbicacionFecha(dataRows);
    } catch (error) {
        console.error('⚠️ Error al cargar datos:', error);
        tableContainer.innerHTML = '<p>⚠️ Ocurrió un error al cargar los datos.</p>';
    }

    // 🔹 Función: llenar el select con las ubicaciones únicas
    function fillOperarioSelect(rows) {
        const uniqueUbicaciones = [...new Set(rows.map(item => item.Ubicacion || ''))].filter(op => op !== '');
        uniqueUbicaciones.forEach(op => {
            const option = document.createElement('option');
            option.value = op;
            option.textContent = op;
            operarioSelect.appendChild(option);
        });
    }

    // 🔹 Evento: filtrar al dar "Buscar"
    filterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(filterForm);
        const fechaDesde = formData.get('fechaDesde');
        const fechaHasta = formData.get('fechaHasta');
        const ubicacion = formData.get('operario');

        // 🔹 Filtrar los datos
        const filtered = dataRows.filter((item) => {
            const itemDateStr = item.Fecha; // Solo la fecha (sin horas)
            let passDate = true;
            if (fechaDesde) passDate = passDate && itemDateStr >= fechaDesde;
            if (fechaHasta) passDate = passDate && itemDateStr <= fechaHasta;
            let passUbicacion = true;
            if (ubicacion) passUbicacion = item.Ubicacion === ubicacion;

            return passDate && passUbicacion;
        });

        displayTableGroupedByUbicacionFecha(filtered);
    });

    // 🔹 Función: agrupar por Ubicación y Fecha, y renderizar la tabla
    function displayTableGroupedByUbicacionFecha(rows) {
        window.globalDataRows = rows;
        const groups = {};

        rows.forEach(item => {
            const ubicacion = item.Ubicacion.trim().toLowerCase();
            const fecha = item.Fecha;

            const key = `${ubicacion}__${fecha}`; // 🔹 Generamos la clave correctamente

            if (!groups[key]) {
                groups[key] = { ubicacion: item.Ubicacion, fecha, tachos: [], imagenes: [], operador :item.Operador};
            }

            if (item.TachoId) groups[key].tachos.push(item.TachoId);
            if (item.Imagen) groups[key].imagenes.push(item.Imagen);
        });

        let html = `
                <table class="table">
                    <thead>
                        <tr>
                            <th></th>
                            <th>Ubicación</th>
                            <th>Fecha</th>
                             <th>Operador</th>
                            <th>Imagenes</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

        Object.keys(groups).forEach(key => {
            const { ubicacion, fecha, operador,imagenes } = groups[key];

            html += `
                <tr class="group-header">
                    <td><input type="checkbox" class="row-check" data-key="${key}"></td>
                    <td>${ubicacion}</td>
                    <td>${fecha.split('-').reverse().join('/')}</td>     
                    <td>${operador}</td>
                    <td>
                        ${imagenes.map(img => `<img src="${img}" width="50" height="50" alt="Peso"/>`).join(' ')}
                    </td>
                    </td>
                </tr>
            `;
        });

        html += `</tbody></table>`;
        document.getElementById('table-container').innerHTML = html;
    }
});