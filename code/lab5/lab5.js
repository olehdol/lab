import fs from 'fs'
import YASMIJ from 'yasmij';

const stringToMatrix = string => {
    let rows = string.split('\n');

    return rows.reduce((acc, row) => {
        const arr = [];

        row.split(' ').forEach(col => arr.push(+col))
        acc.push(arr)
        return acc;
    }, [])
}

const getLowerGameValue = matrix => {
    return Math.max(...(matrix.reduce((acc, row) => {
        acc.push(row.reduce((acc, col) => {
            if (acc === 0 || acc > col) {
                acc = col;
            }
            return acc;
        }, 0))

        return acc;
    }, [])));
}

const getUpperGameValue = matrix => {
    const max = [];
    for (let i = 0; i < matrix.length; i++) {
        let temp = 0;
        for (let j = 0; j < matrix.length; j++) {
            if (temp === 0 || temp < matrix[j][i]) {
                temp = matrix[j][i];
            }
        }
        max.push(temp);
    }

    return Math.min(...max);
}

const isSaddlePoint = matrix => {
    return getLowerGameValue(matrix) === getUpperGameValue(matrix);
}

const deleteRow = (matrix, index) => {
    matrix.splice(index, 1);
    return matrix;
}

const deleteCol = (matrix, index) => {
    for (let i = 0; i < matrix.length; i++) {
        matrix[i].splice(index, 1);
    }
    return matrix;
}

const matrixSimplification = matrix => {
    let newMatrix = matrix;

    for (let i = 0; i < newMatrix.length; i++) {
        let iRowToDelete = true;
        let jRowToDelete = true;
        let iIndex = -1;
        let jIndex = -1;

        for (let j = i + 1; j < newMatrix.length; j++) {
            iRowToDelete = true;
            jRowToDelete = true;
            iIndex = -1;
            jIndex = -1;

            for (let col = 0; col < matrix[0].length; col++) {
                if (matrix[i][col] > matrix[j][col]) {
                    if (jRowToDelete) jIndex = j;
                    iRowToDelete = false;

                } else if (matrix[i][col] < matrix[j][col]) {
                    if (iRowToDelete) iIndex = i;
                    jRowToDelete = false;
                }
            }
        }
        if (iRowToDelete) {
            newMatrix = deleteRow(matrix, iIndex);
            break;
        }
        if (jRowToDelete) {
            newMatrix = deleteRow(matrix, jIndex);
            break;
        }
    }

    if (newMatrix !== newMatrix[0].length) {
        for (let i = 0; i < newMatrix[0].length; i++) {
            let iColToDelete = true;
            let jColToDelete = true;
            let iIndex = -1;
            let jIndex = -1;

            for (let j = i + 1; j < newMatrix[0].length; j++) {
                iColToDelete = true;
                jColToDelete = true;
                iIndex = -1;
                jIndex = -1;

                for (let col = 0; col < newMatrix.length; col++) {
                    if (newMatrix[col][i] < newMatrix[col][j]) {
                        if (jColToDelete) jIndex = j;
                        iColToDelete = false;

                    } else if (newMatrix[col][i] > newMatrix[col][j]) {
                        if (iColToDelete) iIndex = i;
                        jColToDelete = false;
                    }
                }
            }
            if (iColToDelete) {
                newMatrix = deleteCol(matrix, iIndex);
                break;
            }
            if (jColToDelete) {
                newMatrix = deleteCol(matrix, jIndex);
                break;
            }
        }
    }

    return newMatrix;
}

const simplexMethod = matrix => {
    const constraintsA = matrix.reduce((acc, row) => {
        let limitation = '';

        row.forEach((col, index) => {
            if (row.length - 1 !== index) {
                limitation += `${col}x${index + 1} + `
            } else {
                limitation += `${col}x${index + 1} `
            }
        })

        limitation += '<= 1';
        acc.push(limitation);
        return acc;
    }, []);

    const constraintsB = matrix.reduce((acc, row, i) => {
        let limitation = '';

        row.forEach((col, j) => {
            if (row.length - 1 !== j) {
                limitation += `${matrix[j][i]}x${j + 1} + `
            } else {
                limitation += `${matrix[j][i]}x${j + 1} `
            }
        })

        limitation += '>= 1';
        acc.push(limitation);
        return acc;
    }, []);

    const playerA = {
        type: "maximize",
        objective : "x1 + x2 + x3 + x4",
        constraints : constraintsA,
    };

    const playerB = {
        type: "minimize",
        objective : "x1 + x2 + x3 + x4",
        constraints : constraintsB,
    };

    return [
      YASMIJ.solve(playerA),
      YASMIJ.solve(playerB),
    ];
}

const getOptimalStrategy = (data, label) => {
    const { x1, x2, x3, x4, z} = data.result;

    return {
        [`${label}1`]: 1 / z * x1,
        [`${label}2`]: 1 / z * x2,
        [`${label}3`]: 1 / z * x3,
        [`${label}4`]: 1 / z * x4,
    }
}

const matrixGameSolution = matrix => {
    if (isSaddlePoint(matrix)) {
        console.log('Solution found. Pure strategy. Probabilities P = 1 and Q = 1');
    } else {
        const simpleMatrix = matrixSimplification(matrix);
        const [solutionA, solutionB] = simplexMethod(simpleMatrix);

        console.log(getOptimalStrategy(solutionA, 'p'));
        console.log(getOptimalStrategy(solutionB, 'q'));
    }
}


// Read data from file
const data = stringToMatrix(fs.readFileSync('./data5.txt', 'utf8'));
matrixGameSolution(data);
