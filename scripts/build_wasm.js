const { execSync } = require('fs');
const { join, dirname } = require('path');
const { fileURLToPath } = require('url');

const __dirname = dirname(fileURLToPath(import.meta.url));
const wasmDir = join(__dirname, '..', 'wasm');

console.log('Building Wasm module with Emscripten...');

try {
    execSync(`emcc ${wasmDir}/collision.cpp -o ${wasmDir}/collision.wasm -s STANDALONE_WASM -s EXPORTED_FUNCTIONS='["_checkAABBCollision","_checkAABBPrecise","_checkCircleAABB","_checkCircleCircle","_calculateOverlap","_calculateOverlapY","_checkCollisionWithResponse","_isPointInAABB","_isPointInCircle"]' -s EXPORTED_RUNTIME_METHODS='["ccall","cwrap"]' -O2`, {
        stdio: 'inherit',
        cwd: wasmDir
    });
    console.log('Wasm module built successfully!');
} catch (error) {
    console.error('Failed to build Wasm module. Make sure Emscripten is installed.');
    console.error('You can install it from: https://emscripten.org/docs/getting_started/downloads.html');
    process.exit(1);
}
