// FIX: The reference to "vite/client" was failing to resolve.
// Replaced with a minimal declaration for CSS files to allow imports like `import './index.css';`
// without causing a TypeScript error, as seen in `src/index.tsx`.
declare module '*.css';
