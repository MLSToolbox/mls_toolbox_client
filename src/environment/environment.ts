import { validateEnvironment } from './environment.schema';

const config = {
  apiUrl: 'http://localhost:5001/api',
  apiTimeout: 30000,
};

export const environment = validateEnvironment(config);
