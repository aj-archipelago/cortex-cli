# Multiple CLI Applications Repository

This repository contains multiple command-line interface (CLI) applications, each designed to leverage different tools and services.

## Repository Structure

```
.
├── cortex-cli
├── gdnote
├── gdreview
├── install.sh
└── recat
```

## Applications

### Cortex CLI

The `cortex-cli` is a CLI application that interacts with the Cortex API, allowing users to execute a variety of commands.

#### Installation

Navigate to the `cortex-cli` directory and run:

```bash
$ npm install
```

#### Usage

This script executes Cortex pathways as commands through the command line. Sample usage:

```bash
$ cortex-cli <command> [options]
```

Full documentation can be found in the `cortex-cli` directory's README.

### GDNote

The `gdnote` CLI compiles release notes for a git branch by sending a diff of the branch to a Cortex API endpoint.

#### Installation

Navigate to the `gdnote` directory and run:

```bash
$ npm install
```

#### Usage

Run the `gdnote` script with the branch name to compare the current branch with as an argument:

```bash
$ gdnote <branch_name>
```

### GDReview

The `gdreview` CLI performs a code review for a git branch by sending a diff of the branch to a Cortex API endpoint.

#### Installation

Navigate to the `gdreview` directory and run:

```bash
$ npm install
```

#### Usage

Run the `gdreview` script with the branch name to compare the current branch with as an argument:

```bash
$ gdreview <branch_name>
```

### Recat

The `recat` CLI recursively prints the directory structure and select source files from the current directory down.  It is typically used to generate a text block to feed to Cortex pathways that work on source code.

#### Installation

Navigate to the `recat` directory and run:

```bash
$ npm install
```

#### Usage

Run the `recat` script with the directory name as an argument:

```bash
$ recat <directory>
```

## Development

This project uses Node.js and npm. Ensure they are both installed. Then install the project dependencies using npm:

```bash
$ npm install
```

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.