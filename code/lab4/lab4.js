import fs from 'fs'

const  methodExpertAssessments = data => {
    const result = data.map(d => {
        return {
            result: d.data.map(item => Math.round(item * d.weight * 100) / 100),
            category: d.category,
            weight: d.weight,
        }
    })

    const sums = result.reduce((acc, d) => {
        d.result.forEach((r, index) => {
            acc.result[index] = Math.round((acc.result[index] + r) * 100) / 100;
        })
        return acc;
    }, { result: [0, 0, 0, 0, 0] })

    return [{labels: data[0].labels }, ...result, sums];
}

// Convert String to Object of values
const stringToMatrix = string => {
    let [rows, labels] = string.split('\n\n')
    rows = rows.split('\n');

    return rows.reduce((acc, row) => {
        const [category, weight, data] = row.split('  ')
        acc.push({
            category,
            weight: +weight,
            data: data.split(' ').map(d => +d),
            labels: labels.split(' ')
        })
        return acc;
    }, [])
}

const printTable = data => {
    const formattedTable = [...data.slice(1)].reduce((acc, row, rowID) => {
        let max = 0;
        let maxSum = 0;

        if (rowID !== 5) {
            acc[row.category] = acc[row.category] || {}
            acc[row.category].WEIGHT = row.weight;
        }

        data[0].labels.forEach((label, index) => {
            if (rowID === 5) {
                if (row.result[index] > maxSum) {
                    maxSum = row.result[index]
                }
                acc.SUM = acc.SUM || {}
                acc.SUM[label] = row.result[index];
                acc.SUM.WEIGHT = 1;

                if (maxSum === acc.SUM[label]) {
                    Object.keys(acc.SUM).forEach(key => acc.SUM[key] = +acc.SUM[key] )
                    acc.SUM[label] = acc.SUM[label].toString();
                }
            }  else {
                acc[row.category][label] = row.result[index];
            }

            if (row.result[index] > max) {
                max = row.result[index];
            }
        })

        if (rowID !== 5) {
            acc[row.category].MAX = max;
        }

        return acc;
    }, {})

    console.table(formattedTable)
}

// Read data from file
const data = stringToMatrix(fs.readFileSync('./data4.txt', 'utf8'));

const solution = methodExpertAssessments(data);
printTable(solution);