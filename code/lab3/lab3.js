import fs from 'fs'

const methodBord = data => {
  let max = 0;
  let index = 0;
  const voices = {};

  for (let i = 0; i < alphabet.length; i++) {
    let beta = 0;
    for (let j = 0; j < data.length; j++) {
      beta += +data[j].candidates * [...data[j].data].reverse().findIndex(index => index === alphabet[i])
    }

    voices[alphabet[i]] =  beta;

    if (beta > max) {
      max = beta;
      index = i;
    }
  }

  return { candidate: alphabet[index], data: voices };
}

const methodCondorce = data => {
  const words = {}
  for (let i = 0; i < alphabet.length; i++) {
    for (let j = 0; j < alphabet.length; j++) {
      if (alphabet[i] !== alphabet[j]) {
        const word = alphabet[i] + alphabet[j];
        words[word] = words[word] || 0
      }
    }
  }

  for (let i = 0; i <  Object.keys(words).length; i++) {
    const firstLetter = Object.keys(words)[i][0];
    const lastLetter = Object.keys(words)[i][1];

    for (let j = 0; j < data.length; j++) {
      const indexOfFL = data[j].data.findIndex(d => d === firstLetter);
      const indexOfLL = data[j].data.findIndex(d => d === lastLetter);

      if (indexOfFL < indexOfLL) {
        words[Object.keys(words)[i]] += +data[j].candidates;
      }
    }
  }

  const result = Object.keys(words).reduce((acc, key) => {
    const reverseValue = key.split('').reverse().join('');
    if (!acc[key.charAt(0)]) {
      acc[key.charAt(0)] = 0
    }

    if (words[key] > words[reverseValue]) {
      acc[key.charAt(0)] +=  1;
    }

    return acc;
  }, {})

  const winner = Object.keys(result).reduce((a, b) => result[a] > result[b] ? a : b)

  return {
    candidate: winner,
    betterThan: result[winner],
    data: words
  }
}


// Convert String to Array
const stringToMatrix = string => {
  return string.split('\r\n').map(row => {
    const cols = row.split(' \t');

    return {
      candidates: cols[0],
      data: cols[1].split(' ')
    }
  });
}

const printTable = (data, label) => {
  console.table({
    [label]: {...data.data, WINNER: data.candidate}
  })
}

// Read data from file
const data = stringToMatrix(fs.readFileSync('./data3.txt', 'utf8'));
const alphabet = data[0].data.sort();

printTable(methodBord(data), 'Bord');
printTable(methodCondorce(data), 'Condorce');
