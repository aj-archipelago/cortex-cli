#!/usr/bin/env node
require('dotenv').config();
const axios = require('axios');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const fs = require('fs');
const Papa = require('papaparse');

const argv = yargs(hideBin(process.argv)).command('$0 [command]', 'Cortex CLI', (yargs) => {
  yargs
    .positional('command', {
      describe: 'Cortex pathway to call',
      type: 'string',
      default: 'pass',
    })
    .option('input', {
      alias: 'i',
      type: 'string',
      description: 'Input for the Cortex pathway',
    })
    .option('prompt', {
      alias: 'p',
      type: 'string',
      description: 'Extra prompt for the Cortex pathway',
    })
}).help().argv;

const command = argv.command;
const url = process.env.CORTEX_API_URL;
const key = process.env.CORTEX_API_KEY;

let inputString = '';
if (!argv.input && !process.stdin.isTTY) {
  process.stdin.setEncoding('utf8');
  process.stdin.on('readable', () => {
    let chunk;
    while ((chunk = process.stdin.read()) !== null) {
      inputString += chunk;
    }
  });

  process.stdin.on('end', () => {
    handleInput(inputString, argv.prompt)
      .catch(error => {
        console.error(error);
      });
  });
} else {
  handleInput(argv.input, argv.prompt)
    .catch(error => {
      console.error(error);
    });
}

function processResults(data) {
  return data && JSON.stringify(data.map(innerArray => innerArray.filter(str => str !== ""))) ;
}

function cleanData(data) {
  const lines = data.split(/\r?\n|\r/); // Split by any EOL characters
  const firstLines = lines.slice(0, 100); // Get the first 100 lines
  const cleanedLines = firstLines.map(line => {
    return line.replace(/,+$/,''); // Remove trailing commas from each line
  });
  return cleanedLines.join('\n');
}

function handleInput(input = '', prompt = '') {
  return new Promise((resolve, reject) => {
    input = input.trim();

    // Check if the input is a path to a file
    if (fs.existsSync(input)) {
      let fileContent = cleanData(fs.readFileSync(input, 'utf8').trim());

      // Check if the file is a CSV
      if (false && input.endsWith('.csv')) {
        Papa.parse(fileContent, {
          complete: (results) => {
            let csvData = processResults(results.data);
            resolve(processInput(csvData, prompt));
          },
          error: (error) => {
            console.error(`Error parsing CSV: ${error}`);
            reject(error);
          },
          preview: 100,
          quoteChar: '"',
          delimiter: ",",
          skipEmptyLines: true,
          /*
          {

	delimiter: "",	// auto-detect
	newline: "",	// auto-detect
	quoteChar: '"',
	escapeChar: '"',
	header: false,
	transformHeader: undefined,
	dynamicTyping: false,
	preview: 0,
	encoding: "",
	worker: false,
	comments: false,
	step: undefined,
	complete: undefined,
	error: undefined,
	download: false,
	downloadRequestHeaders: undefined,
	downloadRequestBody: undefined,
	skipEmptyLines: false,
	chunk: undefined,
	chunkSize: undefined,
	fastMode: undefined,
	beforeFirstChunk: undefined,
	withCredentials: undefined,
	transform: undefined,
	delimitersToGuess: [',', '\t', '|', ';', Papa.RECORD_SEP, Papa.UNIT_SEP],
	skipFirstNLines: 0
}
*/
        });
      } else {
        // If it's not a CSV, just read the file normally
        resolve(processInput(fileContent, prompt));
      }

      return;
    } 
  
    // If it's not a file path, just process the input normally
    resolve(processInput(input, prompt));
  });
}

function processInput(input = '', prompt = '') {
  input = input.trim();
  if (prompt) {
    input = `${prompt}\n\n${input}`;
  }

  if (!input) {
    console.error("No input provided.");
    process.exit(1);
  }

  const query = `
    query ${command.charAt(0).toUpperCase() + command.slice(1)}($text: String) {
      ${command}(text: $text) {
        result
      }
    }
  `;

  axios.post(url, {
    query: query,
    variables: { text: input },
  }, {
    headers: {
      'Ocp-Apim-Subscription-Key': key,
    },
  }).then(response => {
    console.log(response.data.data[command].result);
  }).catch(error => {
    console.error(error);
  });
}