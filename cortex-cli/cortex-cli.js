#!/usr/bin/env node
require("dotenv").config();
const axios = require("axios");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const fs = require("fs");
const Papa = require("papaparse");

const argv = yargs(hideBin(process.argv))
  .command("$0 [command]", "Cortex CLI", (yargs) => {
    yargs
      .positional("command", {
        describe: "Cortex pathway to call",
        type: "string",
        default: "pass",
      })
      .option("input", {
        alias: "i",
        type: "string",
        description: "Input for the Cortex pathway - string or path to a file",
      })
      .option("prompt", {
        alias: "p",
        type: "string",
        description: "Extra prompt for the Cortex pathway",
      })
      .option("variables", {
        alias: "v",
        type: "string",
        description: "Extra variables (in JSON) for the Cortex pathway",
      })
      .option("mergecsv", {
        alias: "m",
        type: "string",
        description:
          "File name for merged CSV output (requires input to be a CSV file)",
      });
  })
  .help().argv;

const command = argv.command;
const url = process.env.CORTEX_API_URL;
const key = process.env.CORTEX_API_KEY;

if (!url) {
  console.error("Please set the CORTEX_API_URL environment variable.");
  process.exit(1);
}

let variables = {};
try {
  variables = JSON.parse(argv.variables || "{}");
} catch (error) {
  console.error("Variables option provided but not in JSON format.");
  process.exit(1);
}

let inputString = "";
if (!argv.input && !process.stdin.isTTY) {
  process.stdin.setEncoding("utf8");
  process.stdin.on("readable", () => {
    let chunk;
    while ((chunk = process.stdin.read()) !== null) {
      inputString += chunk;
    }
  });
  process.stdin.on("end", () => {
    handleInput(inputString, argv.prompt, variables, argv.mergecsv).catch(
      (error) => {
        console.error(error);
      }
    );
  });
} else {
  handleInput(argv.input, argv.prompt, variables, argv.mergecsv).catch(
    (error) => {
      console.error(error);
    }
  );
}

function cleanData(data) {
  const lines = data.split(/\r?\n|\r/); // Split by any EOL characters
  const cleanedLines = lines.map((line) => {
    return line.replace(/,+$/, ""); // Remove trailing commas from each line
  });
  return cleanedLines.join("\n");
}

function handleInput(input = "", prompt = "", variables = {}, mergecsv = "") {
  return new Promise((resolve, reject) => {
    input = input.trim();

    // Check if the input is a path to a file
    if (fs.existsSync(input)) {
      let fileContent = cleanData(fs.readFileSync(input, "utf8").trim());

      // Check if the file is a CSV
      if (input.endsWith(".csv")) {
        Papa.parse(fileContent, {
          complete: (results) => {
            resolve(
              processInput(
                fileContent,
                prompt,
                variables,
                mergecsv,
                results.data
              )
            );
          },
          error: (error) => {
            console.error(`Error parsing CSV: ${error}`);
            reject(error);
          },
          skipEmptyLines: true,
        });
      } else {
        // If it's not a CSV, just read the file normally
        resolve(processInput(fileContent, prompt, variables, mergecsv));
      }

      return;
    }

    // If it's not a file path, just process the input normally
    resolve(processInput(input, prompt, variables, mergecsv));
  });
}

function handleResponse(response, mergecsv, inputCsvData) {
  const resultData = response?.data?.data?.[command]?.result;

  if (!resultData) {
    throw new Error("Invalid response data");
  }

  if (!mergecsv) {
    console.log(resultData);
    return;
  }

  if (!inputCsvData || !Array.isArray(inputCsvData)) {
    throw new Error("Invalid input CSV data");
  }

  const parsedData = Papa.parse(resultData);

  if (!parsedData.data.length) {
    throw new Error("No data to parse");
  }

  let map = new Map();

  const addToMap = (row, map) => {
    const id = row[0];
    const value = row[1];

    if (map.has(id)) {
      map.get(id).push(value);
    } else {
      map.set(id, [value]);
    }
  };

  inputCsvData.forEach((row) => addToMap(row, map));
  parsedData.data.forEach((row) => addToMap(row, map));

  const mergedArray = Array.from(map, ([id, values]) => [id, ...values]);
  fs.writeFileSync(mergecsv, Papa.unparse(mergedArray));
}

function processInput(
  input = "",
  prompt = "",
  variables = {},
  mergecsv = "",
  inputCsvData = {}
) {
  input = input.trim();
  if (prompt) {
    input = `${prompt}\n\n${input}`;
  }

  if (!input) {
    console.error("No input provided.");
    process.exit(1);
  }

  function inferGraphQLType(value) {
    switch (typeof value) {
      case "string":
        return "String";
      case "boolean":
        return "Boolean";
      case "number":
        return value % 1 === 0 ? "Int" : "Float";
      default:
        return "String";
    }
  }

  // Prepare the variables part for the GraphQL query
  let variablesPart = "";
  for (let key in variables) {
    variablesPart += `, $${key}: ${inferGraphQLType(variables[key])}`;
  }

  // Prepare the parameters part for the GraphQL command
  let parametersPart = "";
  for (let key in variables) {
    parametersPart += `, ${key}: $${key}`;
  }

  const query = `
    query ${
      command.charAt(0).toUpperCase() + command.slice(1)
    }($text: String${variablesPart}) {
      ${command}(text: $text${parametersPart}) {
        result
      }
    }
  `;

  axios
    .post(
      url,
      {
        query: query,
        variables: { text: input, ...variables },
      },
      {
        headers: {
          "Ocp-Apim-Subscription-Key": key,
        },
      }
    )
    .then((response) => {
      handleResponse(response, mergecsv, inputCsvData);
    })
    .catch((error) => {
      const message =
        error?.response?.data?.errors?.[0]?.message || error.message;
      if (message.startsWith("Cannot query field")) {
        console.error(`Could not find Cortex pathway: ${command}`);
      } else {
        console.error(`Error: ${message}`);
      }
      process.exit(1);
    });
}
