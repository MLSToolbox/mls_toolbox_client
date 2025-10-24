export const environment = {
  production: true,

  // API Configuration
  api: {
    baseUrl: "https://your-production-api.com", // TODO: Actualizar con URL real
    codeAnalysisBaseUrl: "https://your-production-api.com", // TODO: Actualizar con URL real del servicio de análisis
    timeout: 15000,
    endpoints: {
      codeGenerator: "/api/create_app",
      codeAssessment: "/api/rate_app",
      uploadZip: "/api/upload-zip",
      getConfig: "/api/get_config",
      getEditor: "/api/get_editor",
      getBaseEditor: "/api/get_base_editor",
      getAvailableEditor: "/api/get_available_editor",
    },
  },

  // Feature Flags
  features: {
    enableMinimap: true,
    enableAutoSave: true,
    enableAutoArrange: true,
    debugMode: false,
    enableLogging: false,
  },

  // UI Configuration
  ui: {
    defaultTheme: "light",
    animationsEnabled: true,
    tooltipsEnabled: true,
    minimapSize: 200,
  },

  // Editor Configuration
  editor: {
    autoSaveInterval: 60000, // 60 seconds in production
    maxUndoSteps: 25,
    gridSize: 20,
    snapToGrid: true,
  },
};
