// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills'; // Use named import
import tailwindcss from '@tailwindcss/vite'


export default defineConfig({
    plugins: [
        react(), tailwindcss(),
        nodePolyfills({
            // Specify which Node.js modules to polyfill
            globals: {
                Buffer: true,
                process: true,
            },
        }),
    ],
    optimizeDeps: {
        esbuildOptions: {
            // Node.js global to browser globalThis
            define: {
                global: 'globalThis',
            },
        },
    },
});