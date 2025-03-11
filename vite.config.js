import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
    base: '/bi/',
    plugins: [react()],
    define: {
        __WS_TOKEN__: `"${process.env.VITE_WS_TOKEN}"`,
    },
});
