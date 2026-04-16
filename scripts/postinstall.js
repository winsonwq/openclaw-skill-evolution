#!/usr/bin/env node
/**
 * postinstall script
 * 
 * After `npm install -g openclaw-skill-evolution`, automatically copies
 * the hook to ~/.openclaw/hooks/openclaw-skill-evolution
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const child_process = require('child_process');

const HOOK_NAME = 'openclaw-skill-evolution';
const TARGET_DIR = path.join(os.homedir(), '.openclaw', 'hooks', HOOK_NAME);

// Get the global npm modules directory
const globalRoot = child_process.execSync('npm root -g').toString().trim();

// The package directory (parent of scripts/, or __dirname if scripts is at root)
const pkgDir = path.dirname(__dirname);

// Only install if this is a global install (pkg is under npm global root)
if (pkgDir === globalRoot || !pkgDir.startsWith(globalRoot + '/')) {
  // Local install - skip auto-install
  console.log('[postinstall] Local install detected, skipping auto-install.');
  process.exit(0);
}

console.log(`[postinstall] Global install detected. Installing ${HOOK_NAME} to ${TARGET_DIR}`);

// Files/dirs to copy (relative to package root)
const COPY_ENTRIES = [
  'handler.js',
  'HOOK.md',
  'package.json',
  'patterns',
  'README.md',
  'AGENTS.md',
];

try {
  fs.mkdirSync(TARGET_DIR, { recursive: true });

  for (const entry of COPY_ENTRIES) {
    const src = path.join(pkgDir, entry);
    const dest = path.join(TARGET_DIR, entry);

    if (!fs.existsSync(src)) {
      console.log(`[postinstall] Skipping missing: ${entry}`);
      continue;
    }

    if (fs.statSync(src).isDirectory()) {
      copyDir(src, dest);
    } else {
      fs.copyFileSync(src, dest);
    }
    console.log(`[postinstall] Copied: ${entry}`);
  }

  console.log(`[postinstall] Done! Run 'openclaw gateway restart' to load the hook.`);
} catch (err) {
  console.error(`[postinstall] Failed: ${err.message}`);
  process.exit(0);
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src)) {
    const srcPath = path.join(src, entry);
    const destPath = path.join(dest, entry);
    if (fs.statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
