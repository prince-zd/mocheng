var _a;
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
var env = (_a = globalThis.process) === null || _a === void 0 ? void 0 : _a.env;
export default defineConfig({
    base: (env === null || env === void 0 ? void 0 : env.GITHUB_PAGES) === 'true' ? '/mocheng/' : '/',
    plugins: [vue()],
    resolve: {
        alias: {
            '@': '/src'
        }
    }
});
