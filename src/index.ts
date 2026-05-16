// Compatibility entrypoint for hosts or templates that compile src/index.ts.
// The Vite application is mounted from src/main.tsx via index.html, but keeping
// this file as a lightweight bridge prevents stale backend/Prisma entrypoints
// from being used during TypeScript builds.
import "./main.tsx";
