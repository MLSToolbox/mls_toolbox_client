require('dotenv').config();

const API_BASE_URL = process.env['API_BASE_URL'] || 'http://localhost:5000';
const CODE_ANALYSIS_API_URL = process.env['CODE_ANALYSIS_API_URL'] || 'http://localhost:5060';

module.exports = {
  "/api/create_app": {
    target: `${API_BASE_URL}/api/create_app`,
    secure: false,
    changeOrigin: true,
    logLevel: "debug"
  },
  "/api/upload-zip": {
    target: CODE_ANALYSIS_API_URL,
    secure: false,
    changeOrigin: true,
    logLevel: "debug"
  }
};
