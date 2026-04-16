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

// The package directory (parent of scripts/)
const pkgDir = path.dirname(path.dirname(__filename));

// Only install if this is a global install
if (pkgDir !== globalRoot && !pkgDir.startsWith(globalRoot + '/')) {
  console.log('[postinstall] Local install detected, skipping auto-install.');
  process.exit(0);
}

console.log(`[postinstall] Global install detected. Installing ${HOOK_NAME} to ${TARGET_DIR}`);

try {
  fs.mkdirSync(TARGET_DIR, { recursive: true });

  const entries = ['hook', 'package.json', 'patterns', 'README.md', 'AGENTS.md'];

  for (const entry of entries) {
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
