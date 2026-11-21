const TABLA_HORAS = {
    "": 0.00,
    "8:30-15:15": 6.75,
    "8:45-15:30": 6.75,
    "8:30-15:30": 7.00,
    "9:00-15:45": 6.75,
    "9:00-17:30": 8.50,
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
    "CAMBIO": 0.00,
    "BAJA": 0.00,
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
    }
];

let historicoSemanas = JSON.parse(localStorage.getItem("cuadrante_historico")) || {
    "SEMANA: Del 9 al 14 de Noviembre": JSON.parse(JSON.stringify(plantillaBase))
};

// Quitar el bloque "ROTATIVO / APOYO" de cualquier semana ya guardada
Object.keys(historicoSemanas).forEach(nombreSemana => {
    if (Array.isArray(historicoSemanas[nombreSemana])) {
        historicoSemanas[nombreSemana] = historicoSemanas[nombreSemana].filter(
            bloque => bloque.nombreBloque !== "ROTATIVO / APOYO"
        );
    }
});
localStorage.setItem("cuadrante_historico", JSON.stringify(historicoSemanas));

let semanaActiva = localStorage.getItem("cuadrante_semana_activa") || "SEMANA: Del 9 al 14 de Noviembre";

if (!historicoSemanas[semanaActiva]) {
    semanaActiva = Object.keys(historicoSemanas)[0];
}

let fechasCambios = JSON.parse(localStorage.getItem("cuadrante_fechas_cambios")) || {};

function obtenerClaveCambio(sem, bIndex, eIndex, dIndex) {
    return `${sem}__${bIndex}__${eIndex}__${dIndex}`;
}

function guardarFechaCambio(bIndex, eIndex, dIndex, valorFecha) {
    const clave = obtenerClaveCambio(semanaActiva, bIndex, eIndex, dIndex);
    const limpio = valorFecha.trim();
    if (limpio) {
        fechasCambios[clave] = limpio;
    } else {
        delete fechasCambios[clave];
    }
    localStorage.setItem("cuadrante_fechas_cambios", JSON.stringify(fechasCambios));
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

function generarFilaCobertura(bloquesParaContar) {
    const numDias = 6;
    const totalDia = new Array(numDias).fill(0);
    const mananaDia = new Array(numDias).fill(0);
    const tardeDia = new Array(numDias).fill(0);

    bloquesParaContar.forEach(bloque => {
        bloque.empleados.forEach(emp => {
            emp.dias.forEach((turno, dIndex) => {
                if (!turno || turno === "LIBRE" || turno === "VAC." || turno === "BAJA" || turno === "CAMBIO") {
                    return;
                }

                totalDia[dIndex]++;

                if (turno.includes("-")) {
                    const horaInicio = turno.split("-")[0].trim();
                    const horaNum = parseFloat(horaInicio.replace(":", "."));
                    if (!isNaN(horaNum)) {
                        if (horaNum < 12) {
                            mananaDia[dIndex]++;
                        } else {
                            tardeDia[dIndex]++;
                        }
                    }
                } else if (turno === "CALIDAD" || turno === "J.C.") {
                    mananaDia[dIndex]++;
                }
            });
        });
    });

    let html = `
        <tr class="fila-cobertura" style="background: #f1f5f9; font-weight: bold;">
            <td style="text-align: left; padding: 6px 8px;">Personas por día</td>
    `;

    for (let i = 0; i < numDias; i++) {
        html += `
            <td style="padding: 6px 4px; font-size: 12px; line-height: 1.35;">
                <div>Trabajan: ${totalDia[i]}</div>
                <div style="font-size: 11px; font-weight: normal;">Mañana: ${mananaDia[i]} · Tarde: ${tardeDia[i]}</div>
            </td>
        `;
    }

    html += `
            <td colspan="2" style="font-size: 11px; font-weight: normal; color: #475569;">Solo turnos activos</td>
        </tr>
    `;

    return html;
}

function renderizarCuadrante() {
    actualizarSelectHistorico();
    document.getElementById("titulo-semana").textContent = semanaActiva;
    cargarNotasSemana();

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
                        <th class="dia-fuerte">Viernes</th>
                        <th class="dia-fuerte">Sábado</th>
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
                if (!turnoActual) {
                    claseExtra = "";
                } else if (turnoActual === "LIBRE") {
                    claseExtra = "celda-libre";
                } else if (turnoActual === "VAC." || turnoActual === "BAJA") {
                    claseExtra = "celda-vac-baja";
                } else if (turnoActual === "CAMBIO") {
                    claseExtra = "celda-cambio";
                } else if (turnoActual.includes("-")) {
                    const horaInicio = turnoActual.split("-")[0].trim();
                    const horaNum = parseFloat(horaInicio.replace(":", "."));
                    if (!isNaN(horaNum)) {
                        claseExtra = horaNum < 12 ? "celda-manana" : "celda-tarde";
                    }
                }

                html += `<td class="${claseExtra}">`;
                html += `<select class="select-turno" onchange="cambiarTurno(${bIndex}, ${eIndex}, ${dIndex}, this.value)">`;

                OPCIONES_TURNO.forEach(opcion => {
                    let seleccionada = opcion === turnoActual ? "selected" : "";
                    let etiqueta = opcion === "" ? "" : opcion;
                    html += `<option value="${opcion}" ${seleccionada}>${etiqueta}</option>`;
                });

                html += `</select>`;

                if (turnoActual === "CAMBIO") {
                    const clave = obtenerClaveCambio(semanaActiva, bIndex, eIndex, dIndex);
                    const fechaGuardada = (fechasCambios[clave] || "").replace(/"/g, "&quot;");
                    html += `
                        <div style="margin-top: 4px;">
                            <input
                                type="text"
                                value="${fechaGuardada}"
                                placeholder="Fecha (ej. 6/12)"
                                onchange="guardarFechaCambio(${bIndex}, ${eIndex}, ${dIndex}, this.value)"
                                style="width: 95%; box-sizing: border-box; padding: 3px 4px; font-size: 11px; text-align: center; border: 1px solid #d97706; border-radius: 3px; background: #fffbeb;"
                            >
                        </div>
                    `;
                }

                html += `</td>`;
            });

            html += `<td class="total-horas">${totalHoras.toFixed(2)} h</td>`;
            html += `<td>${diasLibres}</td>`;
            html += `</tr>`;
        });

        html += generarFilaCobertura([bloque]);
        html += `</tbody></table>`;
        contenedor.innerHTML += html;
    });
}

function cambiarTurno(bIndex, eIndex, dIndex, nuevoValor) {
    historicoSemanas[semanaActiva][bIndex].empleados[eIndex].dias[dIndex] = nuevoValor;
    if (nuevoValor !== "CAMBIO") {
        const clave = obtenerClaveCambio(semanaActiva, bIndex, eIndex, dIndex);
        delete fechasCambios[clave];
        localStorage.setItem("cuadrante_fechas_cambios", JSON.stringify(fechasCambios));
    }
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
    guardarNotasSemana();
    localStorage.setItem("cuadrante_historico", JSON.stringify(historicoSemanas));
    localStorage.setItem("cuadrante_semana_activa", semanaActiva);
    localStorage.setItem("cuadrante_fechas_cambios", JSON.stringify(fechasCambios));
}

// 1. GENERAR MENSAJE WHATSAPP (NO SE USA POR POLÍTICA DE EMPRESA)
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

// 3B. COPIA DE SEGURIDAD COMPLETA EN JSON (EXPORTAR E IMPORTAR)
function exportarCopiaJSON() {
    // Guarda las notas actuales antes de generar el archivo de respaldo
    guardarNotasSemana();

    // Reúne en un solo objeto todas las claves guardadas en localStorage
    const copiaSeguridad = {
        app: "Gestion de Cuadrante - Cajas (Family Cash)",
        fechaExportacion: new Date().toISOString(),
        cuadrante_historico: historicoSemanas,
        cuadrante_semana_activa: semanaActiva,
        cuadrante_fechas_cambios: fechasCambios,
        cuadrante_notas_semanas: notasSemanas
    };

    // Convierte el objeto a texto JSON legible con sangría de 2 espacios
    const contenidoJSON = JSON.stringify(copiaSeguridad, null, 2);

    // Prepara un archivo descargable local sin depender de ningún servidor
    const blob = new Blob([contenidoJSON], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    // Compone el nombre del archivo con la fecha de hoy (AAAAMMDD)
    const hoy = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = `copia_cuadrante_${hoy}.json`;

    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);

    // Libera la URL temporal creada en memoria
    URL.revokeObjectURL(url);
}

function abrirSelectorJSON() {
    // Abre el selector de archivos del equipo usando el input oculto
    const inputArchivo = document.getElementById("input-importar-json");
    if (!inputArchivo) return;
    inputArchivo.value = "";
    inputArchivo.click();
}

function importarCopiaJSON(evento) {
    const archivo = evento.target.files && evento.target.files[0];
    if (!archivo) return;

    const lector = new FileReader();

    lector.onload = function(e) {
        try {
            // Convierte el texto del archivo JSON en un objeto JavaScript
            const datos = JSON.parse(e.target.result);

            // Verifica que el archivo tenga la estructura mínima del cuadrante
            if (!datos || typeof datos !== "object" || !datos.cuadrante_historico) {
                alert("El archivo seleccionado no es una copia de seguridad válida del cuadrante.");
                return;
            }

            // Pide confirmación antes de sobrescribir los datos actuales del navegador
            const confirmar = confirm(
                "¿Quieres restaurar esta copia de seguridad? Se reemplazarán los datos actuales guardados en este navegador."
            );
            if (!confirmar) return;

            // Carga en memoria el histórico, fechas de cambio y notas de la copia
            historicoSemanas = datos.cuadrante_historico;
            fechasCambios = datos.cuadrante_fechas_cambios || {};
            notasSemanas = datos.cuadrante_notas_semanas || {};

            // Elimina cualquier bloque "ROTATIVO / APOYO" si el archivo provenía de una versión anterior
            Object.keys(historicoSemanas).forEach(nombreSemana => {
                if (Array.isArray(historicoSemanas[nombreSemana])) {
                    historicoSemanas[nombreSemana] = historicoSemanas[nombreSemana].filter(
                        bloque => bloque.nombreBloque !== "ROTATIVO / APOYO"
                    );
                }
            });

            // Selecciona la semana activa de la copia o, si no existe, la primera disponible
            const semanasDisponibles = Object.keys(historicoSemanas);
            semanaActiva = datos.cuadrante_semana_activa && historicoSemanas[datos.cuadrante_semana_activa]
                ? datos.cuadrante_semana_activa
                : semanasDisponibles[0];

            // Persiste todo en localStorage y vuelve a pintar el cuadrante
            localStorage.setItem("cuadrante_historico", JSON.stringify(historicoSemanas));
            localStorage.setItem("cuadrante_semana_activa", semanaActiva);
            localStorage.setItem("cuadrante_fechas_cambios", JSON.stringify(fechasCambios));
            localStorage.setItem("cuadrante_notas_semanas", JSON.stringify(notasSemanas));

            renderizarCuadrante();
            alert("¡Copia de seguridad restaurada correctamente!");
        } catch (error) {
            alert("No se ha podido leer el archivo JSON. Comprueba que no esté dañado.");
        }
    };

    lector.readAsText(archivo, "utf-8");
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

// 4. NOTAS Y CAMBIOS DE FECHA POR SEMANA
let notasSemanas = JSON.parse(localStorage.getItem("cuadrante_notas_semanas")) || {};

function cargarNotasSemana() {
    const campoNotas = document.getElementById("texto-notas-semana");
    if (!campoNotas) return;
    campoNotas.value = notasSemanas[semanaActiva] || "";
}

function guardarNotasSemana() {
    const campoNotas = document.getElementById("texto-notas-semana");
    if (!campoNotas) return;
    notasSemanas[semanaActiva] = campoNotas.value;
    localStorage.setItem("cuadrante_notas_semanas", JSON.stringify(notasSemanas));
}

const campoNotasInicial = document.getElementById("texto-notas-semana");
if (campoNotasInicial) {
    campoNotasInicial.addEventListener("input", guardarNotasSemana);
}

// Inicializar
renderizarCuadrante();