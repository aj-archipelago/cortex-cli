#!/usr/bin/env node
require('dotenv').config();
const { version } = require('./package.json');

const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fetch = require('node-fetch');
const argv = require('minimist')(process.argv.slice(2));
// Get the URL and key from the environment variables
const url = process.env.CORTEX_API_URL;
const key = process.env.CORTEX_API_KEY;

async function getGitDiff(branchName) {
    const { stdout, stderr } = await exec(`git diff ${branchName} --ignore-space-change --ignore-all-space --ignore-blank-lines -- . ':!package-lock.json'`);
    if (stderr) {
        console.error(`Error getting git diff: ${stderr}`);
        return null;
    }
    return stdout;
}

async function sendToCortex(diffString) {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Ocp-Apim-Subscription-Key': key,
        },
        body: JSON.stringify({
            query: `
            query Release_note ($text: String!) {
                release_notes(text: $text) {
                    result
                }
            }
            `,
            variables: {
                text: JSON.stringify(diffString),
            },
        }),
    });
    const { data } = await response.json();
    return data.release_notes.result;
}

(async () => {
    console.log(`gdnote v${version}`);
    const branchName = argv._[0];
    if (!branchName) {
        console.error('Please provide a branch name.');
        process.exit(1);
    }
    console.log(`Getting diff for branch ${branchName}`);
    const diffString = await getGitDiff(branchName);
    if (!diffString) {
        console.error('Failed to get git diff.');
        process.exit(1);
    }
    console.log('Asking Cortex for notes... (may take a few seconds)');
    const result = await sendToCortex(diffString);
    console.log(result);
})();
