import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    base: '/mdmdvsm/bi/',
    plugins: [react()],
    define: {
        __WS_TOKEN__: `"${process.env.VITE_WS_TOKEN}"`,
    },
});
