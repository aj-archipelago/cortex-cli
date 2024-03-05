#!/usr/bin/env node

const recatLib = require('./recat_lib');
// Check for command line arguments
if (process.argv.length < 3) {
    console.log('Usage: recat <directory>');
    process.exit(1);
}
let dir = process.argv[2];
recatLib.doCat(dir);