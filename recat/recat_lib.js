const fs = require('fs');
const path = require('path');

function doCat(dir) {
    console.log("Project directory listing:\n\n");
    let packageJsonFiles = walkDir(dir);
    packageJsonFiles.forEach(analyzePackageJson);
}

function walkDir(dir) {
    let packageJsonFiles = [];
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        let isIgnored = ['node_modules', '.git', '.env'].some(ignoredDir => dirPath.includes(ignoredDir));

        if (!isIgnored) {
            if (isDirectory) {
                packageJsonFiles = packageJsonFiles.concat(walkDir(dirPath));
            } else if (f === 'package.json') {
                packageJsonFiles.push(dirPath);
            }
            console.log(dirPath);  // Print the path of the file or directory
        }
    });
    return packageJsonFiles;
}

function analyzePackageJson(filePath) {
    let content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    console.log(`\n=== ${filePath} ===\n`);
    console.log(content);

    let bins = content.bin || {};
    let scripts = content.scripts || {};

    console.log(`Package: ${path.dirname(filePath)}`);


    // Read and log the content of each binary file
    for (let binName in bins) {
        readAndLogJsFile(path.join(path.dirname(filePath), bins[binName]));
    }

    // Read and log the content of js files referenced in scripts
    for (let scriptName in scripts) {
        let command = scripts[scriptName];
        // match any .js or .ts file in the command
        let regex = /\b(\S+)\.(js|ts)\b/g;
        let match;
        while ((match = regex.exec(command)) !== null) {
            readAndLogJsFile(path.join(path.dirname(filePath), match[1] + '.' + match[2]));
        }
    }
}

function readAndLogJsFile(filePath) {
    let ext = path.extname(filePath);

    // skip if the file extension is not .js or .ts
    if (ext !== '.js' && ext !== '.ts') {
        return;
    }

    try {
        let fileContent = fs.readFileSync(filePath, 'utf8');
        console.log(`\n=== ${filePath} ===\n`);
        console.log(fileContent);
    } catch (e) {
        console.log(`Failed to open file: ${filePath}`);
    }
}

module.exports = {
    doCat
};