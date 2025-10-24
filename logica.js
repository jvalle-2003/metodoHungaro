let nRows = 3, nCols = 3;

function crearTabla() {
    const tabla = document.getElementById('tabla');
    tabla.innerHTML = '';

    const header = document.createElement('tr');
    header.appendChild(document.createElement('th'));
    for (let j = 0; j < nCols; j++) {
        const th = document.createElement('th');
        const input = document.createElement('input');
        input.type = 'text';
        input.value = 'Tarea ' + (j + 1);
        th.appendChild(input);
        header.appendChild(th);
    }
    tabla.appendChild(header);

    for (let i = 0; i < nRows; i++) {
        const tr = document.createElement('tr');
        const th = document.createElement('th');
        const input = document.createElement('input');
        input.type = 'text';
        input.value = 'Empleado ' + (i + 1);
        th.appendChild(input);
        tr.appendChild(th);

        for (let j = 0; j < nCols; j++) {
            const td = document.createElement('td');
            const inp = document.createElement('input');
            inp.type = 'number';
            inp.value = 0;
            td.appendChild(inp);
            tr.appendChild(td);
        }
        tabla.appendChild(tr);
    }
}

function leerMatriz() {
    const tabla = document.getElementById('tabla');
    const rows = tabla.querySelectorAll('tr');
    const nombresFilas = [];
    const nombresCols = [];
    const matriz = [];

    rows[0].querySelectorAll('input[type=text]').forEach(input => nombresCols.push(input.value));
    for (let i = 1; i < rows.length; i++) {
        const inputs = rows[i].querySelectorAll('input');
        nombresFilas.push(inputs[0].value);
        const fila = [];
        for (let j = 1; j < inputs.length; j++) fila.push(Number(inputs[j].value));
        matriz.push(fila);
    }
    return { matriz, nombresFilas, nombresCols };
}

function hungarian(matrix) {
    let n = matrix.length;
    let m = matrix[0].length;
    const size = Math.max(n, m);
    const newMatrix = Array.from({ length: size }, (_, i) =>
        Array.from({ length: size }, (_, j) =>
            i < n && j < m ? matrix[i][j] : 0
        )
    );

    for (let i = 0; i < size; i++) {
        const minFila = Math.min(...newMatrix[i]);
        for (let j = 0; j < size; j++) newMatrix[i][j] -= minFila;
    }

    for (let j = 0; j < size; j++) {
        let minCol = Infinity;
        for (let i = 0; i < size; i++) if (newMatrix[i][j] < minCol) minCol = newMatrix[i][j];
        for (let i = 0; i < size; i++) newMatrix[i][j] -= minCol;
    }

    const reducedMatrix = newMatrix.map(row => [...row]);

    n = m = size;
    const u = Array(n + 1).fill(0);
    const v = Array(m + 1).fill(0);
    const p = Array(m + 1).fill(0);
    const way = Array(m + 1).fill(0);

    for (let i = 1; i <= n; i++) {
        p[0] = i;
        let j0 = 0;
        const minv = Array(m + 1).fill(Infinity);
        const used = Array(m + 1).fill(false);

        do {
            used[j0] = true;
            let i0 = p[j0], delta = Infinity, j1 = 0;
            for (let j = 1; j <= m; j++) {
                if (!used[j]) {
                    const cur = newMatrix[i0 - 1][j - 1] - u[i0] - v[j];
                    if (cur < minv[j]) { minv[j] = cur; way[j] = j0; }
                    if (minv[j] < delta) { delta = minv[j]; j1 = j; }
                }
            }
            for (let j = 0; j <= m; j++) {
                if (used[j]) { u[p[j]] += delta; v[j] -= delta; }
                else minv[j] -= delta;
            }
            j0 = j1;
        } while (p[j0] !== 0);

        do {
            const j1 = way[j0];
            p[j0] = p[j1];
            j0 = j1;
        } while (j0 !== 0);
    }

    const ans = Array(n).fill(-1);
    for (let j = 1; j <= m; j++) {
        if (p[j] > 0 && p[j]-1 < matrix.length && j-1 < matrix[0].length) ans[p[j]-1] = j-1;
    }

    return { assignment: ans, reducedMatrix };
}

// Botones
document.getElementById('addRow').onclick = () => { nRows++; crearTabla(); };
document.getElementById('removeRow').onclick = () => { if(nRows>1) nRows--; crearTabla(); };
document.getElementById('addCol').onclick = () => { nCols++; crearTabla(); };
document.getElementById('removeCol').onclick = () => { if(nCols>1) nCols--; crearTabla(); };
document.getElementById('reset').onclick = () => { nRows = 3; nCols = 3; crearTabla(); document.getElementById('resultado').innerHTML = ''; };

document.getElementById('run').onclick = () => {
    const { matriz, nombresFilas, nombresCols } = leerMatriz();
    const { assignment, reducedMatrix } = hungarian(matriz);

    let totalCost = 0;
    assignment.forEach((taskIndex, i) => {
        if (taskIndex >= 0 && taskIndex < matriz[0].length) totalCost += matriz[i][taskIndex];
    });

    let salida = `<h3>Asignaciones óptimas (Costo Total: $${totalCost})</h3><ul>`;
    assignment.forEach((taskIndex, i) => {
        if (taskIndex >= 0 && taskIndex < nombresCols.length) salida += `<li>${nombresFilas[i]} → ${nombresCols[taskIndex]}</li>`;
    });
    salida += '</ul>';

    salida += '<h3>Matriz reducida (ceros generados)</h3><table>';
    salida += '<tr><th></th>'; nombresCols.forEach(c => salida += `<th>${c}</th>`); salida += '</tr>';
    reducedMatrix.forEach((fila, i) => {
        salida += `<tr><th>${nombresFilas[i]}</th>`;
        fila.forEach(val => salida += `<td>${val}</td>`);
        salida += '</tr>';
    });
    salida += '</table>';

    salida += '<h3>Matriz original con asignaciones resaltadas</h3><table>';
    salida += '<tr><th></th>'; nombresCols.forEach(c => salida += `<th>${c}</th>`); salida += '</tr>';
    matriz.forEach((fila, i) => {
        salida += `<tr><th>${nombresFilas[i]}</th>`;
        fila.forEach((val, j) => {
            const clase = assignment[i] === j ? 'assigned' : '';
            salida += `<td class="${clase}">${val}</td>`;
        });
        salida += '</tr>';
    });
    salida += '</table>';

    document.getElementById('resultado').innerHTML = salida;
};

crearTabla();
