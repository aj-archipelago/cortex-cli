# Cortex CLI

"Cortex CLI" is a Command Line Interface (CLI) tool designed to interact with the Cortex API. It uses a GraphQL query to send requests to the Cortex API endpoint and returns the results in the console. This script requires Node.js to run.

## Prerequisites

You need to have Node.js and npm installed on your machine.

## Installation

First, clone this repository to your local machine using `git clone`.

Then navigate to the project directory and run `npm install` to install the required packages.

## Configuration

The script uses environment variables to get the URL of the Cortex API endpoint and the API key. These should be set in a `.env` file in the project root. The file should have the following structure:
```shell
CORTEX_API_URL=<your-cortex-api-url>
CORTEX_API_KEY=<your-cortex-api-key>
```
## Usage

You can run this script using `node` followed by the filename. The script accepts a command and two optional parameters: `input` and `prompt`.

The syntax to run the script is as follows:
```shell
node cortex-cli.js [pathway_name] -i [input] -p [prompt]
```
Here is an example:
```shell
node cortex-cli.js pass -i 'Hello there!' -p 'Respond as if you are a pirate:'
```
In the above example, the script will call the `pass` (passthrough) pathway with "Hello there!" as the input and "Respond as if you are a pirate:" as the extra prompt for the passthrough pathway.
This can be any pathway that Cortex supports:
```shell
node cortex-cli.js grammar -i 'This has a speling misstake.'
```
Note that the above example doesn't require a prompt as the pathway already has a prompt that defines behavior.  It just corrects the spelling and grammar.

If you want to pipe input text from another command or a file, you can do so using the pipe (`|`) operator. Here's an example:
```shell
echo "This has a speling misstake" | node cortex-cli.js grammar
```
In this example, `echo "This has a speling misstake"` generates the input, and then the pipe operator `|` feeds this input to our script. The script will call the `grammar` pathway with the input.

## Error Handling

If no input is provided, either through the `input` parameter, the pipe operator, or from stdin, the script will print "No input provided." to the console and exit.

## Contributing

Pull requests are welcome. Please make sure to update tests as appropriate.

## License

This project is licensed under the MIT license.