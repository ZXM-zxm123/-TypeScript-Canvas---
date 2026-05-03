const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');
const distDir = path.join(__dirname, '..', 'dist');

if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
}

console.log('Building TypeScript...');

try {
    execSync('npx tsc', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    console.log('TypeScript build completed!');
} catch (error) {
    console.error('TypeScript build failed:', error);
    process.exit(1);
}

const wasmSource = path.join(__dirname, '..', 'wasm', 'collision.cpp');
const wasmDest = path.join(distDir, 'collision.cpp');
if (fs.existsSync(wasmSource)) {
    fs.copyFileSync(wasmSource, wasmDest);
    console.log('Copied C++ source for Wasm build');
}

console.log('Build completed successfully!');
