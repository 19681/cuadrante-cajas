const TABLA_HORAS = {
    "8:30-15:15": 6.75,
    "8:45-15:30": 6.75,
    "8:30-15:30": 7.00,
    "9:00-15:45": 6.75,
    "10:00-16:45": 6.75,
    "11:00-16:00": 5.00,
    "14:00-22:30": 8.50,
    "15:00-20:00": 5.00,
    "15:00-21:15": 6.25,
    "15:15-22:00": 6.75,
    "15:30-22:30": 7.00,
    "15:45-22:30": 6.75,
    "17:00-22:00": 5.00,
    "LIBRE": 0.00,
    "VAC.": 0.00,
    "CALIDAD": 6.75,
    "J.C.": 8.00
};

const OPCIONES_TURNO = Object.keys(TABLA_HORAS);

const plantillaBase = [
    {
        nombreBloque: "TURNO MAÑANA",
        empleados: [
            { nombre: "Maricarmen", dias: ["8:30-15:15", "8:30-15:15", "8:30-15:15", "8:30-15:15", "8:30-15:15", "8:30-15:15"] },
            { nombre: "Paula", dias: ["11:00-16:00", "11:00-16:00", "11:00-16:00", "11:00-16:00", "11:00-16:00", "11:00-16:00"] },
            { nombre: "Irma", dias: ["VAC.", "VAC.", "VAC.", "VAC.", "9:00-15:45", "9:00-15:45"] },
            { nombre: "M. José", dias: ["10:00-16:45", "10:00-16:45", "10:00-16:45", "10:00-16:45", "10:00-16:45", "10:00-16:45"] },
            { nombre: "Manolo", dias: ["LIBRE", "LIBRE", "LIBRE", "LIBRE", "LIBRE", "9:00-15:45"] }
        ]
    },
    {
        nombreBloque: "TURNO TARDE",
        empleados: [
            { nombre: "Farah", dias: ["15:15-22:00", "15:15-22:00", "15:15-22:00", "15:15-22:00", "15:45-22:30", "15:45-22:30"] },
            { nombre: "Marta", dias: ["8:45-15:30", "8:45-15:30", "8:45-15:30", "8:45-15:30", "8:45-15:30", "J.C."] },
            { nombre: "Mari", dias: ["LIBRE", "15:00-21:15", "15:00-21:15", "15:00-21:15", "15:00-21:15", "15:00-21:15"] },
            { nombre: "L. Fernanda", dias: ["15:15-22:00", "15:15-22:00", "15:15-22:00", "15:15-22:00", "15:45-22:30", "CALIDAD"] },
            { nombre: "Carolina", dias: ["15:15-22:00", "15:15-22:00", "15:15-22:00", "15:15-22:00", "15:15-22:00", "15:45-22:30"] },
            { nombre: "Rosio", dias: ["17:00-22:00", "17:00-22:00", "17:00-22:00", "17:00-22:00", "17:00-22:00", "17:00-22:00"] },
            { nombre: "Verónica", dias: ["LIBRE", "LIBRE", "LIBRE", "LIBRE", "14:00-22:30", "14:00-22:30"] }
        ]
    },
    {
        nombreBloque: "ROTATIVO / APOYO",
        empleados: [
            { nombre: "Sergio", dias: ["15:15-22:00", "15:15-22:00", "15:15-22:00", "15:15-22:00", "8:30-15:30", "15:30-22:30"] },
            { nombre: "Marcela", dias: ["8:30-15:15", "8:30-15:15", "8:30-15:15", "15:15-22:00", "15:30-22:30", "CALIDAD"] }
        ]
    }
];

let historicoSemanas = JSON.parse(localStorage.getItem("cuadrante_historico")) || {
    "SEMANA: Del 9 al 14 de Noviembre": JSON.parse(JSON.stringify(plantillaBase))
};

let semanaActiva = localStorage.getItem("cuadrante_semana_activa") || "SEMANA: Del 9 al 14 de Noviembre";

if (!historicoSemanas[semanaActiva]) {
    semanaActiva = Object.keys(historicoSemanas)[0];
}

function actualizarSelectHistorico() {
    const select = document.getElementById("select-semana");
    select.innerHTML = "";
    Object.keys(historicoSemanas).forEach(nombreSemana => {
        let opt = document.createElement("option");
        opt.value = nombreSemana;
        opt.textContent = nombreSemana;
        if (nombreSemana === semanaActiva) opt.selected = true;
        select.appendChild(opt);
    });
}

function renderizarCuadrante() {
    actualizarSelectHistorico();
    document.getElementById("titulo-semana").textContent = semanaActiva;

    const bloquesActuales = historicoSemanas[semanaActiva];
    const contenedor = document.getElementById("tabla-contenedor");
    contenedor.innerHTML = "";

    bloquesActuales.forEach((bloque, bIndex) => {
        let html = `
            <table>
                <thead>
                    <tr>
                        <th>${bloque.nombreBloque}</th>
                        <th>Lunes</th>
                        <th>Martes</th>
                        <th>Miércoles</th>
                        <th>Jueves</th>
                        <th>Viernes</th>
                        <th>Sábado</th>
                        <th>Total Horas</th>
                        <th>Días Libres</th>
                    </tr>
                </thead>
                <tbody>
        `;

        bloque.empleados.forEach((emp, eIndex) => {
            let totalHoras = 0;
            let diasLibres = 0;

            html += `<tr>`;
            html += `<td class="empleado-nombre">${emp.nombre}</td>`;

            emp.dias.forEach((turnoActual, dIndex) => {
                totalHoras += TABLA_HORAS[turnoActual] || 0;
                if (turnoActual === "LIBRE") diasLibres++;

                let claseExtra = "";
                if (turnoActual === "LIBRE") claseExtra = "celda-libre";
                if (turnoActual === "VAC.") claseExtra = "celda-vac";

                html += `<td class="${claseExtra}">`;
                html += `<select onchange="cambiarTurno(${bIndex}, ${eIndex}, ${dIndex}, this.value)">`;
                
                OPCIONES_TURNO.forEach(opcion => {
                    let seleccionada = opcion === turnoActual ? "selected" : "";
                    html += `<option value="${opcion}" ${seleccionada}>${opcion}</option>`;
                });

                html += `</select></td>`;
            });

            html += `<td class="total-horas">${totalHoras.toFixed(2)} h</td>`;
            html += `<td>${diasLibres}</td>`;
            html += `</tr>`;
        });

        html += `</tbody></table>`;
        contenedor.innerHTML += html;
    });
}

function cambiarTurno(bIndex, eIndex, dIndex, nuevoValor) {
    historicoSemanas[semanaActiva][bIndex].empleados[eIndex].dias[dIndex] = nuevoValor;
    renderizarCuadrante();
    guardarEnMemoria();
}

function cambiarSemanaHistorica(nombreSemana) {
    semanaActiva = nombreSemana;
    localStorage.setItem("cuadrante_semana_activa", semanaActiva);
    renderizarCuadrante();
}

function crearNuevaSemana() {
    let nuevaSemana = prompt("Introduce el nombre de la nueva semana (Ej: SEMANA: Del 16 al 21 de Noviembre):", "SEMANA: Del 16 al 21 de Noviembre");
    if (nuevaSemana) {
        nuevaSemana = nuevaSemana.trim();
        if (historicoSemanas[nuevaSemana]) {
            alert("¡Esta semana ya existe en el histórico! Seleccionándola...");
        } else {
            let clonar = confirm("¿Quieres copiar los turnos de la semana anterior? (Pulsa Cancelar para empezar la semana en blanco con todo LIBRE)");
            
            let nuevaEstructura;
            if (clonar) {
                nuevaEstructura = JSON.parse(JSON.stringify(historicoSemanas[semanaActiva]));
            } else {
                nuevaEstructura = JSON.parse(JSON.stringify(plantillaBase));
                nuevaEstructura.forEach(b => b.empleados.forEach(e => e.dias = e.dias.fill("LIBRE")));
            }
            
            historicoSemanas[nuevaSemana] = nuevaEstructura;
        }
        semanaActiva = nuevaSemana;
        guardarEnMemoria();
        renderizarCuadrante();
        alert(`¡Semana "${semanaActiva}" lista!`);
    }
}

// ⚙️ GESTIÓN VISUAL DE PERSONAL
function abrirGestionPersonal() {
    renderizarListaPersonal();
    document.getElementById("modal-personal").style.display = "flex";
}

function renderizarListaPersonal() {
    let html = "";
    const bloquesActuales = historicoSemanas[semanaActiva];

    bloquesActuales.forEach((bloque, bIndex) => {
        html += `<div style="background: #f8fafc; padding: 5px 10px; font-weight: bold; margin-top: 8px; border-radius: 4px; font-size: 12px; color: #3b3532;">${bloque.nombreBloque}</div>`;
        
        bloque.empleados.forEach((emp, eIndex) => {
            html += `
                <div class="item-personal-gestion">
                    <span>${emp.nombre}</span>
                    <button onclick="eliminarEmpleado(${bIndex}, ${eIndex})" class="btn-danger">🗑️ Eliminar</button>
                </div>
            `;
        });
    });

    document.getElementById("lista-gestion-personal").innerHTML = html;
}

function agregarEmpleado() {
    let nombreInput = document.getElementById("input-nombre-nuevo");
    let nombre = nombreInput.value.trim();
    let bIndex = parseInt(document.getElementById("select-bloque-nuevo").value);

    if (!nombre) {
        alert("Por favor, introduce un nombre válido.");
        return;
    }

    // Añadimos el empleado a la semana activa con todos los días libres por defecto
    historicoSemanas[semanaActiva][bIndex].empleados.push({
        nombre: nombre,
        dias: ["LIBRE", "LIBRE", "LIBRE", "LIBRE", "LIBRE", "LIBRE"]
    });

    nombreInput.value = "";
    renderizarListaPersonal();
    renderizarCuadrante();
    guardarEnMemoria();
    alert(`¡Trabajador/a "${nombre}" añadido correctamente!`);
}

function eliminarEmpleado(bIndex, eIndex) {
    let empNombre = historicoSemanas[semanaActiva][bIndex].empleados[eIndex].nombre;
    if (confirm(`¿Seguro que quieres eliminar a ${empNombre} de esta semana?`)) {
        historicoSemanas[semanaActiva][bIndex].empleados.splice(eIndex, 1);
        renderizarListaPersonal();
        renderizarCuadrante();
        guardarEnMemoria();
    }
}

function guardarDatos() {
    guardarEnMemoria();
    alert("¡Cuadrante guardado correctamente en el histórico!");
}

function guardarEnMemoria() {
    localStorage.setItem("cuadrante_historico", JSON.stringify(historicoSemanas));
    localStorage.setItem("cuadrante_semana_activa", semanaActiva);
}

// 1. GENERAR MENSAJE WHATSAPP
function generarMensajeWhatsApp() {
    let texto = `📋 *${semanaActiva}*\n\n`;
    historicoSemanas[semanaActiva].forEach(bloque => {
        texto += `*--- ${bloque.nombreBloque} ---*\n`;
        bloque.empleados.forEach(emp => {
            texto += `• *${emp.nombre}*: ${emp.dias.join(", ")}\n`;
        });
        texto += `\n`;
    });
    document.getElementById("texto-whatsapp").value = texto;
    document.getElementById("modal-whatsapp").style.display = "flex";
}

// 2. RESUMEN MENSUAL ACUMULADO
function abrirResumenMensual() {
    let acumulado = {};

    Object.keys(historicoSemanas).forEach(sem => {
        historicoSemanas[sem].forEach(bloque => {
            bloque.empleados.forEach(emp => {
                if (!acumulado[emp.nombre]) acumulado[emp.nombre] = { horas: 0, semanasTrabajadas: 0 };
                
                let horasSemana = 0;
                emp.dias.forEach(t => horasSemana += TABLA_HORAS[t] || 0);
                
                acumulado[emp.nombre].horas += horasSemana;
                if (horasSemana > 0) acumulado[emp.nombre].semanasTrabajadas++;
            });
        });
    });

    let html = `
        <table class="tabla-resumen-mes">
            <thead>
                <tr>
                    <th>Empleado/a</th>
                    <th>Semanas Registradas</th>
                    <th>Total Horas Acumuladas</th>
                </tr>
            </thead>
            <tbody>
    `;

    Object.keys(acumulado).forEach(nombre => {
        html += `
            <tr>
                <td class="empleado-nombre">${nombre}</td>
                <td>${acumulado[nombre].semanasTrabajadas}</td>
                <td class="total-horas">${acumulado[nombre].horas.toFixed(2)} h</td>
            </tr>
        `;
    });

    html += `</tbody></table>`;
    document.getElementById("contenido-resumen-mes").innerHTML = html;
    document.getElementById("modal-mes").style.display = "flex";
}

// 3. DESCARGAR CSV (EXCEL)
function exportarACSV() {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += `"${semanaActiva}"\n`;
    csvContent += "Bloque,Empleado,Lunes,Martes,Miércoles,Jueves,Viernes,Sábado,Total Horas\n";

    historicoSemanas[semanaActiva].forEach(bloque => {
        bloque.empleados.forEach(emp => {
            let totalH = 0;
            let fila = [`"${bloque.nombreBloque}"`, `"${emp.nombre}"`];
            emp.dias.forEach(t => {
                fila.push(`"${t}"`);
                totalH += TABLA_HORAS[t] || 0;
            });
            fila.push(`"${totalH.toFixed(2)}h"`);
            csvContent += fila.join(",") + "\n";
        });
    });

    let encodedUri = encodeURI(csvContent);
    let link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `cuadrante_${semanaActiva.replace(/[^a-zA-Z0-9]/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function cerrarModal(idModal) {
    document.getElementById(idModal).style.display = "none";
}

function copiarAlPortapapeles() {
    const textarea = document.getElementById("texto-whatsapp");
    textarea.select();
    document.execCommand("copy");
    alert("¡Mensaje copiado al portapapeles!");
    cerrarModal('modal-whatsapp');
}

// Inicializar
renderizarCuadrante();
