import { validateEnvironment } from './environment.schema';

const config = {
  apiUrl: 'http://localhost:5050',
  apiTimeout: 10000,
};

export const environment = validateEnvironment(config);