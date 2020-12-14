import fs from 'fs'

const EMV = (data, years, EMVs) => {
  const M = data[0];
  const D = [data[1], data[3]]
  const P = [data[2], data[4]]

  if (!EMVs) {
    return D.reduce((acc, Di, index) => {
      acc += Di * years * P[index]
      return acc;
    }, -M)
  } else {
    return Math.max(...EMVs);
  }
}

const getRightSolution = (data, years) => {
  const max = {value: 0, label: ''};

  data.forEach((d, index) => {
    if (d.length === 5) {
      // for first and second nodes
      const emv = EMV(d, years)
      if (emv > max.value) {
        max.value = emv;
        max.label = abc[index];
      }
      results.push({value: emv, label: abc[label]})
      label++;
    } else {
      // deep for last node
      const newData = data.slice(0, data.length - 1).map(newD => {
        return newD.map((col, index) => {
          if (index === 2) return d[2]
          if (index === 4) return d[3];
          return col;
        })
      })

      label += 1;

      const C = getRightSolution(newData, years - 1)
      C.max.value = C.max.value * d[0] + 0 * d[1];

      if (C.max.value > max.value) {
        max.value = C.max.value;
        max.label = index.toString();
      }

      label -= 3;
      results.push({value: C.max.value, label: abc[label]})
      results.push({value: 0, label: abc[label + 3]})
      label++;
    }
  })

  return {results , max};
}


// Convert String to Object of values
const stringToMatrix = string => {
  const rows = string.split('\r\n\r\n');

  return {
    data: rows[0].split('\r\n').map(row => {
      const cols = row.split(' ');
      return cols.map(col => +col)
    }),
    years: +rows[1]
  }
}

const printTable = data => {
  const formattedTable = data.results.reduce((acc, row) => {
    acc[row.label] = { EMV: row.value }
    return acc;
  }, {})

  formattedTable.SOLUTION = { EMV: `${data.max.label} (${data.max.value})`}

  console.table(formattedTable)
}

// Read data from file
const { data, years } = stringToMatrix(fs.readFileSync('./data2.txt', 'utf8'));

const abc = ['A', 'B', 'C', 'D', 'E', 'F'];
const results = [];
let label = 0;

const solution = getRightSolution(data, years);
solution.results = solution.results.sort((a, b) => a.label.charCodeAt(0) - b.label.charCodeAt(0));
printTable(solution);
