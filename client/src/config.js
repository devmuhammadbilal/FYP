// client/src/config.js
const config = {
  // Vite requires env variables to start with VITE_
  backendUrl: import.meta.env.VITE_BACKEND_URL || "http://localhost:8080",
};

export default config;
