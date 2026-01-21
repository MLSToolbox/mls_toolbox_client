import { validateEnvironment } from './environment.schema';

// Archivo para ambiente LOCAL (desarrollo local)
// Este archivo se genera dinámicamente durante el build de Docker

const config = {
  apiUrl: 'http://localhost:5000/api',
  apiTimeout: 30000,
};

export const environment = validateEnvironment(config);
