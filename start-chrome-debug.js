#!/usr/bin/env node
const { spawn } = require('child_process');
const os = require('os');

// Get profile and port from command line arguments
const args = process.argv.slice(2);
let profile = 'Default';
let port = 9222;

args.forEach((arg, i) => {
  if (arg === '--profile' && args[i + 1]) {
    profile = args[i + 1];
  }
  if (arg === '--port' && args[i + 1]) {
    port = args[i + 1];
  }
});

console.log(`Starting Chrome with profile "${profile}" on port ${port}...`);

const platform = os.platform();
let chromeCmd;
let userDataDir;

if (platform === 'linux') {
  chromeCmd = 'google-chrome';
  userDataDir = `${process.env.HOME}/.config/google-chrome`;
} else if (platform === 'darwin') {
  chromeCmd = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  userDataDir = `${process.env.HOME}/Library/Application Support/Google/Chrome`;
} else {
  console.error('Unsupported OS. Only Linux and macOS supported.');
  process.exit(1);
}

const chromeArgs = [
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${userDataDir}`,
  `--profile-directory=${profile}`,
  `--new-window`,
];

const proc = spawn(chromeCmd, chromeArgs, {
  detached: true,
  stdio: 'ignore',
});

proc.unref();
console.log(
  'Chrome launched (detached). Wait a few seconds, then run your crawler to connect to the debug port.'
);
