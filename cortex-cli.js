#!/usr/bin/env node
require('dotenv').config();

const axios = require('axios');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

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

// Extract the command from the arguments
const command = argv.command;

// Get the URL and key from the environment variables
const url = process.env.CORTEX_API_URL;
const key = process.env.CORTEX_API_KEY;

// Read the piped input
let inputString = '';
if (!argv.input) {
  process.stdin.setEncoding('utf8');
  process.stdin.on('readable', () => {
    let chunk;
    while ((chunk = process.stdin.read()) !== null) {
      inputString += chunk;
    }
  });

  process.stdin.on('end', () => {
    handleInput(inputString, argv.prompt);
  });
} else {
  handleInput(argv.input, argv.prompt);
}

function handleInput(input = '', prompt = '') {
  input = input.trim();
  if (prompt) {
    input = `${prompt}\n\n${input}`;
  }

  if (!input) {
    console.error("No input provided.");
    process.exit(1);
  }

  // Define the GraphQL query
  const query = `
    query ${command.charAt(0).toUpperCase() + command.slice(1)}($text: String) {
      ${command}(text: $text) {
        result
      }
    }
  `;

  // Send the GraphQL query to the endpoint
  axios.post(url, {
    query: query,
    variables: { text: input },
  }, {
    headers: {
      'Ocp-Apim-Subscription-Key': key,
    },
  }).then(response => {
    // Log the result of the GraphQL query
    console.log(response.data.data[command].result);
  }).catch(error => {
    console.error(error);
  });
}