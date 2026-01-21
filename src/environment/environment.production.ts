import { validateEnvironment } from './environment.schema';

// Archivo para ambiente PRODUCTION (producción en servidor gessi.cs.upc.edu)
// Nginx proxy: puerto 1446 → backend producción (5000)

const config = {
  apiUrl: 'http://gessi.cs.upc.edu:1446/api',
  apiTimeout: 30000,
};

export const environment = validateEnvironment(config);
