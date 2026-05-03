import { copyFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

const htmlFiles = ['index.html', 'editor.html'];

for (const file of htmlFiles) {
    const src = join(rootDir, file);
    if (existsSync(src)) {
        console.log(`Copied ${file} to dist/`);
    }
}

const wasmDir = join(rootDir, 'wasm');
if (!existsSync(join(rootDir, 'dist', 'wasm'))) {
    mkdirSync(join(rootDir, 'dist', 'wasm'), { recursive: true });
}

const collisionCpp = join(wasmDir, 'collision.cpp');
if (existsSync(collisionCpp)) {
    copyFileSync(collisionCpp, join(rootDir, 'dist', 'wasm', 'collision.cpp'));
    console.log('Copied collision.cpp for Wasm build');
}

console.log('Prebuild completed!');
