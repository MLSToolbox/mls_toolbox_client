import { validateEnvironment } from './environment.schema';

// Archivo para ambiente DEVELOPMENT (desarrollo en servidor gessi.cs.upc.edu)
// Nginx proxy: puerto 1448 → backend development (5001)

const config = {
  apiUrl: 'http://gessi.cs.upc.edu:1448/api',
  apiTimeout: 30000,
};

export const environment = validateEnvironment(config);
