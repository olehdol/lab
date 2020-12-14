import fs from 'fs'

const bayesCriterion = (matrix, p) => {
  const W = [];

  for (let i = 0; i < matrix.length; i++) {
    let value = 0;

    for (let j = 0; j < matrix[i].length; j++) {
      value += matrix[i][j] * p[j];
    }

    W.push(Math.round(value * 100) / 100);
  }

  return W;
}

const laplaceCriterion = matrix => {
  const W = [];

  for (let i = 0; i < matrix.length; i++) {
    let value = 0;

    for (let j = 0; j < matrix[i].length; j++) {
      value += matrix[i][j];
    }

    value *= 1 / 3;

    W.push(Math.round(value * 100) / 100);
  }

  return W;
}

const waldCriterion = matrix => {
  const W = [];

  for (let i = 0; i < matrix.length; i++) {
    W.push(Math.min(...matrix[i]))
  }

  return W;
}

const hurwitzCriterion = (matrix, C) => {
  const W = [];

  for (let i = 0; i < matrix.length; i++) {
    W.push(C * Math.min(...matrix[i]) + (1 - C) * Math.max(...matrix[i]))
  }

  return W;
}

// Convert String to Object of values
const stringToMatrix = string => {
  const rows = string.split('\r\n\r\n');

  return {
    matrix: rows[0].split('\r\n').map(row => {
      const cols = row.split(' ');
      return cols.map(col => +col)
    }),
    p: rows[1].split(' ').map(col => +col),
    C: +rows[2]
  }
}

const printTable = (matrix, p, bayes, laplace, wald, hurwitz) => {
  const rowLabels = ['A1', 'A2', 'A3', 'Pj'];
  const formattedTable = [...matrix, p].reduce((acc, row, index) => {

    acc[rowLabels[index]] = {
      S1: row[0],
      S2: row[1],
      S3: row[2],
      Bayes: bayes[index] || `A${bayes.findIndex(b => b === Math.max(...bayes)) + 1}`,
      Laplace: laplace[index] || `A${laplace.findIndex(l => l === Math.max(...laplace)) + 1}`,
      Wald: wald[index] || `A${wald.findIndex(w => w === Math.max(...wald)) + 1}`,
      Hurwitz: hurwitz[index] || `A${hurwitz.findIndex(h => h === Math.max(...hurwitz)) + 1}`,
    }

    return acc;
  }, {})

  console.table(formattedTable)
}

// Read data from file
const data = stringToMatrix(fs.readFileSync('./data1.txt', 'utf8'));
const { matrix, p, C} = data;

const bayes = bayesCriterion(matrix, p);
const laplace = laplaceCriterion(matrix);
const wald = waldCriterion(matrix);
const hurwitz = hurwitzCriterion(matrix, C);

printTable(matrix, p, bayes, laplace, wald, hurwitz)

