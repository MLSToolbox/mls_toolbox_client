import { validateEnvironment } from './environment.schema';

const config = {
  apiUrl: 'http://mls_toolbox_server:5050',
  apiTimeout: 10000,
};

export const environment = validateEnvironment(config);