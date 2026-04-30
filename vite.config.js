import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    // This allows you to use 'describe', 'it', and 'expect' without importing them in every file
    globals: true,
    // This simulates a browser environment (DOM) in Node.js
    environment: 'jsdom',
    // Path to the setup file we discussed earlier
    setupFiles: './src/test/setup.js',
    // Optional: Useful if you want to see a nice UI for your tests
    css: true,
  },
})