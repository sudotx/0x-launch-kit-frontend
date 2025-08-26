import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
    plugins: [
        react(),
        svgr(),
        nodePolyfills({
            protocolImports: true,
            globals: {
                Buffer: true,
                global: true,
                process: true,
            },
        }),
    ],
    server: {
        port: 3000,
    },
});