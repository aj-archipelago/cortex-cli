# Cortex CLI

Cortex CLI is a command line interface tool written in JavaScript for interacting with the Cortex API.

## Installation

To install the project, use the following command:

```bash
npm install
```

## Usage

To use the CLI, you need to set the `CORTEX_API_URL` and `CORTEX_API_KEY` environment variables.

Use the CLI by passing it a command which is the Cortex pathway to call. You can optionally set the following options:

- `input` or `-i` - Input for the Cortex pathway - string or path to a file
- `prompt` or `-p` - Extra prompt for the Cortex pathway
- `variables` or `-v` - Extra variables (in JSON) for the Cortex pathway
- `mergecsv` or `-m` - File name for merged CSV output (requires input to be a CSV file)

Example command:

```bash
node cortex-cli.js "command" -i "input.txt" -p "Prompt" -v '{"var1": "value1"}' -m "output.csv"
```

## Dependencies

This project depends on the following NPM packages:

- [axios](https://www.npmjs.com/package/axios) - Promise based HTTP client for the browser and node.js
- [dotenv](https://www.npmjs.com/package/dotenv) - Zero-dependency module that loads environment variables from a `.env` file into `process.env`
- [fs](https://www.npmjs.com/package/fs) - Filesystem related utilities
- [papaparse](https://www.npmjs.com/package/papaparse) - Powerful, in-browser CSV parser for big boys and girls
- [yargs](https://www.npmjs.com/package/yargs) - modern, pirate-themed, successor to optimist

## Contributing

Contributions are welcome. Please submit a pull request.

## License

Cortex CLI is licensed under [MIT](https://opensource.org/licenses/MIT).